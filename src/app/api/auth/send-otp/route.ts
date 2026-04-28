import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '../../../../lib/firebaseAdmin';
import { sendOtpEmail } from '../../../../lib/emailService';

const OTP_SECRET = process.env.OTP_SECRET || 'dev_otp_secret';

function hashOtp(otp: string): string {
  return crypto.createHmac('sha256', OTP_SECRET).update(otp).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 1. Generate 6 digit OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = hashOtp(rawOtp);

    // 2. Store in Firestore with 5m expiry
    const expiresAt = Date.now() + 5 * 60 * 1000;

    await adminDb.collection('otp_verifications').doc(email).set({
      hashedOtp,
      attempts: 0,
      ip,
      userAgent,
      expiresAt,
    });

    // 3. Send email or print to console in dev mode
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendOtpEmail(email, rawOtp);
    } else {
      console.log(`\n\n[DEV MODE] OTP for ${email}: ${rawOtp}\n\n`);
    }

    // Generic response to prevent email enumeration
    return NextResponse.json({ message: 'If the email is valid, an OTP has been sent.' });
  } catch (error) {
    console.error('sendOtp Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
