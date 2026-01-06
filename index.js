const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// ----------------------------------------------------------------------
// CONFIGURATION
// ----------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
const EMAIL_USER = process.env.GMAIL_EMAIL;
const EMAIL_PASS = process.env.GMAIL_PASSWORD;

// ----------------------------------------------------------------------
// EMAIL TRANSPORTER
// ----------------------------------------------------------------------
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// ----------------------------------------------------------------------
// HTML TEMPLATE
// ----------------------------------------------------------------------
const getHtmlTemplate = (code) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Zenify Verification</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f0f0f; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 16px; overflow: hidden; margin-top: 40px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(90deg, #1DB954 0%, #1ed760 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; font-weight: 800; }
    .content { padding: 40px; text-align: center; color: #ffffff; }
    .message { font-size: 16px; color: #b3b3b3; line-height: 1.6; margin-bottom: 30px; }
    .otp-box { 
      background: rgba(255, 255, 255, 0.05); 
      border: 1px solid rgba(255, 255, 255, 0.1); 
      border-radius: 12px; 
      padding: 20px; 
      display: inline-block; 
      margin-bottom: 30px; 
    }
    .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1DB954; font-family: 'Courier New', monospace; }
    .footer { background-color: #121212; padding: 20px; text-align: center; color: #666666; font-size: 12px; }
    .footer a { color: #888888; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ZENIFY</h1>
    </div>
    <div class="content">
      <h2 style="color: white; margin-top: 0;">Verify Your Account</h2>
      <p class="message">
        Welcome to Zenify! Use the verification code below to complete your sign-in process. 
        This code is valid for 10 minutes.
      </p>
      
      <div class="otp-box">
        <span class="otp-code">${code}</span>
      </div>
      
      <p class="message" style="font-size: 14px; margin-bottom: 0;">
        If you didn't request this email, you can safely ignore it.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Zenify Music. All rights reserved.</p>
      <p>Secure Authentication System</p>
    </div>
  </div>
</body>
</html>
`;

// ----------------------------------------------------------------------
// API ROUTES
// ----------------------------------------------------------------------

app.get('/', (req, res) => {
  res.send('Zenify Secure Email Server is Running.');
});

app.post('/send-otp', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Missing email or code' });
  }

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('Server Credentials Missing');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  const mailOptions = {
    from: `Zenify Security <${EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code - Zenify',
    html: getHtmlTemplate(code)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`EXP: Email sent to ${email}`);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
