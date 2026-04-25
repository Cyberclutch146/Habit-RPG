const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { db, auth } = require('../services/firebase');
const { sendOtpEmail } = require('../services/emailService');

const OTP_SECRET = process.env.OTP_SECRET || 'dev_otp_secret';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// Helper: Hash OTP
function hashOtp(otp) {
  return crypto.createHmac("sha256", OTP_SECRET).update(otp).digest("hex");
}

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'unknown';

    // 1. Generate 6 digit OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = hashOtp(rawOtp);

    // 2. Store in Firestore with 5m expiry
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    // We use email as the doc ID to easily overwrite previous OTPs
    await db.collection('otp_verifications').doc(email).set({
      hashedOtp,
      attempts: 0,
      ip,
      userAgent,
      expiresAt
    });

    // 3. Fire-and-forget Email or Output in Dev Mode
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Send email without awaiting entirely if speed is preferred, but awaiting helps guarantee delivery.
      await sendOtpEmail(email, rawOtp);
    } else {
      console.log(`\n\n[DEV MODE] OTP for ${email}: ${rawOtp}\n\n`);
    }

    // Generic response against enumeration
    return res.status(200).json({ message: "If the email is valid, an OTP has been sent." });

  } catch (error) {
    console.error("sendOtp Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    const docRef = db.collection('otp_verifications').doc(email);
    
    // ATOMIC TRANSACTION: Check attempts, verify constraints, update.
    const result = await db.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      if (!doc.exists) {
        throw new Error("NOT_FOUND");
      }

      const data = doc.data();

      // Check Expiry
      if (Date.now() > data.expiresAt) {
        t.delete(docRef);
        throw new Error("EXPIRED");
      }

      // Log IP/Device mismatch as a warning but don't block verification.
      // IP can change legitimately (mobile networks, VPNs, proxies).
      if (data.ip !== ip || data.userAgent !== userAgent) {
        console.warn(`[SECURITY] OTP verify for ${email} from different IP/UA. Sent from ${data.ip}, verified from ${ip}`);
      }

      // Check Attempts
      if (data.attempts >= 5) {
        t.delete(docRef);
        throw new Error("MAX_ATTEMPTS");
      }

      // Compare Hash (IP check removed — was causing false rejections)
      const candidateHash = hashOtp(otp);
      if (candidateHash !== data.hashedOtp) {
        t.update(docRef, { attempts: data.attempts + 1 });
        throw new Error("INVALID_OTP");
      }

      // Success
      t.delete(docRef);
      return true;
    });

    if (result) {
      // Generate single-use JWT verification token
      const jti = crypto.randomUUID();
      const token = jwt.sign({ email, jti }, JWT_SECRET, { expiresIn: '10m' });
      return res.status(200).json({ token });
    }

  } catch (error) {
    // Determine error type
    const msg = error.message;
    if (msg === "NOT_FOUND" || msg === "INVALID_OTP" || msg === "EXPIRED" || msg === "MAX_ATTEMPTS") {
         return res.status(401).json({ error: "Invalid or expired OTP." });
    }
    console.error("verifyOtp Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.register = async (req, res) => {
  const { token, password, username } = req.body;
  if (!token || !password || !username) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { email, jti } = decoded;

    // Check Replay (JTI)
    const jtiRef = db.collection('used_jwt_nonces').doc(jti);
    const result = await db.runTransaction(async (t) => {
      const doc = await t.get(jtiRef);
      if (doc.exists) {
        throw new Error("REPLAY");
      }
      // Store jti to prevent replay
      t.set(jtiRef, { usedAt: Date.now() });
      return true;
    });

    if (!result) return res.status(401).json({ error: "Token already used." });

    // Firebase Auth creation/update logic
    let uid;
    try {
      // Try to create the user
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: username
      });
      uid = userRecord.uid;
    } catch (fbErr) {
      if (fbErr.code === 'auth/email-already-exists') {
        // If email already exists, verify-otp proved they own it. Update their password/username instead.
        const existingUser = await auth.getUserByEmail(email);
        uid = existingUser.uid;
        await auth.updateUser(uid, { password, displayName: username });
      } else {
        throw fbErr;
      }
    }

    // Set custom claims (optional)
    await auth.setCustomUserClaims(uid, { verified: true });

    // Create Firebase Custom Token
    const customToken = await auth.createCustomToken(uid);

    return res.status(200).json({ customToken });

  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid or expired session token." });
    }
    if (error.message === "REPLAY") {
      return res.status(401).json({ error: "This operation has already been processed." });
    }
    console.error("Register Error:", error);
    return res.status(500).json({ error: "Registration failed." });
  }
};

exports.wipeGuest = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    
    if (decodedToken.firebase.sign_in_provider !== 'anonymous') {
      return res.status(403).json({ error: "Only anonymous sessions can be wiped." });
    }

    // Optional Check: Ensure auth_time is recent if we only want active sessions doing this
    // e.g. if (Date.now() / 1000 - decodedToken.auth_time > 86400) throw ...

    const uid = decodedToken.uid;

    // Deep copy/delete Firestore collections
    // Warning: Deleting collections in Firestore from Node is complex due to subcollections.
    // For habit-rpg, we wipe the user doc and top-level subcollections
    // users/{uid}, users/{uid}/habits, users/{uid}/logs
    
    async function deleteCollection(path) {
      const colRef = db.collection(path);
      const snapshot = await colRef.get();
      if (snapshot.size === 0) return;
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    await deleteCollection(`users/${uid}/logs`);
    await deleteCollection(`users/${uid}/habits`);
    await db.collection('users').doc(uid).delete();

    // Finally delete from Auth
    await auth.deleteUser(uid);

    return res.status(200).json({ message: "Guest data wiped successfully." });

  } catch (error) {
    console.error("Wipe Guest Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
