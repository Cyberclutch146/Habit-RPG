import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { adminDb, adminAuth } from '../../../../lib/firebaseAdmin';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, password, username } = body;

  if (!token || !password || !username) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; jti: string };
    const { email, jti } = decoded;

    // Check Replay (JTI)
    const jtiRef = adminDb.collection('used_jwt_nonces').doc(jti);
    const replayResult = await adminDb.runTransaction(async (t) => {
      const doc = await t.get(jtiRef);
      if (doc.exists) {
        throw new Error('REPLAY');
      }
      // Store jti to prevent replay
      t.set(jtiRef, { usedAt: Date.now() });
      return true;
    });

    if (!replayResult) {
      return NextResponse.json({ error: 'Token already used.' }, { status: 401 });
    }

    // Firebase Auth creation/update logic
    let uid: string;
    try {
      // Try to create the user
      const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: username,
      });
      uid = userRecord.uid;
    } catch (fbErr: any) {
      if (fbErr.code === 'auth/email-already-exists') {
        // If email already exists, verify-otp proved they own it. Update their password/username.
        const existingUser = await adminAuth.getUserByEmail(email);
        uid = existingUser.uid;
        await adminAuth.updateUser(uid, { password, displayName: username });
      } else {
        throw fbErr;
      }
    }

    // Set custom claims
    await adminAuth.setCustomUserClaims(uid, { verified: true });

    // Create Firebase Custom Token
    const customToken = await adminAuth.createCustomToken(uid);

    return NextResponse.json({ customToken });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid or expired session token.' }, { status: 401 });
    }
    if (error.message === 'REPLAY') {
      return NextResponse.json({ error: 'This operation has already been processed.' }, { status: 401 });
    }
    console.error('Register Error:', error);
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
  }
}
