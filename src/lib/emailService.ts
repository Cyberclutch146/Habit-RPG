import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  return transporter;
}

export async function sendOtpEmail(toEmail: string, otp: string): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@habitquest.app',
    to: toEmail,
    subject: 'HabitQuest — Verify Your Email',
    html: `
      <div style="font-family: 'Segoe UI', system-ui, sans-serif; background: linear-gradient(135deg, #0f172a, #1e1b4b); color: #e2e8f0; padding: 40px 32px; border-radius: 16px; max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -0.02em;">
            Habit<span style="color: #818cf8;">Quest</span>
          </h1>
        </div>
        <h2 style="color: #c7d2fe; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Verification Code</h2>
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Enter this code to complete your registration:</p>
        <div style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ffffff; letter-spacing: 8px; font-size: 36px; margin: 0; font-family: monospace;">${otp}</h1>
        </div>
        <p style="font-size: 11px; color: #64748b; text-align: center;">
          This code expires in 5 minutes. If you did not request this, ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await getTransporter().sendMail(mailOptions);
    console.log(`✉️ OTP sent to ${toEmail}`);
  } catch (err: any) {
    console.error(`Failed to send email to ${toEmail}:`, err.message);
    throw new Error('Failed to deliver OTP via Email');
  }
}
