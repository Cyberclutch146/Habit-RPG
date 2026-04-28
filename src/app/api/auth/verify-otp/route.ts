import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { adminDb } from '../../../../lib/firebaseAdmin';

const OTP_SECRET = process.env.OTP_SECRET || 'dev_otp_secret';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

function hashOtp(otp: string): string {
  return crypto.createHmac('sha256', OTP_SECRET).update(otp).digest('hex');
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, otp } = body;

  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    const docRef = adminDb.collection('otp_verifications').doc(email);

    // ATOMIC TRANSACTION: Check attempts, verify constraints, update.
    const result = await adminDb.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      if (!doc.exists) {
        throw new Error('NOT_FOUND');
      }

      const data = doc.data()!;

      // Check Expiry
      if (Date.now() > data.expiresAt) {
        t.delete(docRef);
        throw new Error('EXPIRED');
      }

      // Log IP/Device mismatch as a warning but don't block verification
      if (data.ip !== ip || data.userAgent !== userAgent) {
        console.warn(`[SECURITY] OTP verify for ${email} from different IP/UA. Sent from ${data.ip}, verified from ${ip}`);
      }

      // Check Attempts
      if (data.attempts >= 5) {
        t.delete(docRef);
        throw new Error('MAX_ATTEMPTS');
      }

      // Compare Hash
      const candidateHash = hashOtp(otp);
      if (candidateHash !== data.hashedOtp) {
        t.update(docRef, { attempts: data.attempts + 1 });
        throw new Error('INVALID_OTP');
      }

      // Success
      t.delete(docRef);
      return true;
    });

    if (result) {
      // Generate single-use JWT verification token
      const jti = crypto.randomUUID();
      const token = jwt.sign({ email, jti }, JWT_SECRET, { expiresIn: '10m' });
      return NextResponse.json({ token });
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 401 });
  } catch (error: any) {
    const msg = error.message;
    if (msg === 'NOT_FOUND' || msg === 'INVALID_OTP' || msg === 'EXPIRED' || msg === 'MAX_ATTEMPTS') {
      return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 401 });
    }
    console.error('verifyOtp Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
