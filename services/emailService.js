const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;

// Create OAuth2 client
const getAuthClient = () => {
  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  return oauth2Client;
};

// Send email using Gmail API
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const auth = getAuthClient();
    const gmail = google.gmail({ version: 'v1', auth });

    const message = [
      `From: ${process.env.GMAIL_USER}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      htmlContent,
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    console.log('✅ Email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error);
    throw new Error('Failed to send email');
  }
};

// Send Verification Email
const sendVerificationEmail = async (email, username, otp) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">Welcome to vRoot! 🎉</h2>
      <p style="color: #555; font-size: 16px;">Hi ${username},</p>
      <p style="color: #555; font-size: 16px;">Thank you for registering! Please verify your email using the OTP below:</p>
      <div style="background: #fff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #4CAF50;">
        <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 5px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #777; font-size: 14px;">This OTP is valid for 10 minutes.</p>
      <p style="color: #999; font-size: 12px; text-align: center;">© 2024 vRoot. All rights reserved.</p>
    </div>
  `;

  return await sendEmail(email, 'Verify Your Email Address', htmlContent);
};

// Send Reset Password OTP
const sendResetPasswordOTP = async (email, username, otp) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">Reset Your Password 🔐</h2>
      <p style="color: #555; font-size: 16px;">Hi ${username},</p>
      <p style="color: #555; font-size: 16px;">We received a request to reset your password. Use the OTP below:</p>
      <div style="background: #fff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #FF6B6B;">
        <h1 style="color: #FF6B6B; font-size: 36px; letter-spacing: 5px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #777; font-size: 14px;">This OTP is valid for 10 minutes.</p>
      <p style="color: #999; font-size: 12px; text-align: center;">© 2024 vRoot. All rights reserved.</p>
    </div>
  `;

  return await sendEmail(email, 'Password Reset OTP', htmlContent);
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordOTP,
};