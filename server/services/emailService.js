const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(toEmail, otp) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to: toEmail,
    subject: 'SHADOW_OPERATIVE Authentication',
    html: `
      <div style="font-family: monospace; background-color: #000; color: #e2e2e2; padding: 20px;">
        <h2 style="color: #dc2626;">PROTOCOL: CONFIRM_IDENTITY</h2>
        <p>A login request was initiated for your operative account.</p>
        <p>Enter the following passcode to authenticate:</p>
        <h1 style="color: #fff; letter-spacing: 5px;">${otp}</h1>
        <p style="font-size: 10px; color: #666;">If you did not request this, ignore this transmission. Expires in 5 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ OTP sent to ${toEmail}`);
  } catch (err) {
    console.error(`Failed to send email to ${toEmail}:`, err.message);
    throw new Error('Failed to deliver OTP via Email');
  }
}

module.exports = { sendOtpEmail };
