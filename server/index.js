const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authController = require('./controllers/authController');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Trust Proxy if behind Cloudflare/Vercel/etc
app.set('trust proxy', 1);

const sendOtpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 3, // start blocking after 3 requests
  message: { error: "Too many OTP requests from this IP, please try again after a minute" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Since verifyOtp has DB-level rate limits per email, we just apply a standard generic spam limiter here
const standardLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 100,
});

app.post('/api/auth/send-otp', sendOtpLimiter, authController.sendOtp);
app.post('/api/auth/verify-otp', standardLimiter, authController.verifyOtp);
app.post('/api/auth/register', standardLimiter, authController.register);
app.post('/api/auth/wipe-guest', standardLimiter, authController.wipeGuest);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n=================================\n🚀 SHADOW_OPERATIVE COMMAND NODE ONLINE\n📡 Port: ${PORT}\n=================================\n`);
});
