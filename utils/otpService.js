/**
 * OTP Service
 * Generates and manages OTP codes for phone and email verification
 */

const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Calculate OTP expiration time (default: 10 minutes)
 * @param {number} minutes - Minutes until expiration (default: 10)
 * @returns {Date} Expiration date
 */
const getOTPExpiration = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Verify if OTP is valid and not expired
 * @param {string} userOTP - OTP stored in user document
 * @param {Date} expiresAt - OTP expiration date
 * @param {string} providedOTP - OTP provided by user
 * @returns {boolean} True if OTP is valid
 */
const verifyOTP = (userOTP, expiresAt, providedOTP) => {
  if (!userOTP || !expiresAt || !providedOTP) {
    return false;
  }

  // Check if OTP is expired
  if (new Date() > new Date(expiresAt)) {
    return false;
  }

  // Check if OTP matches
  return userOTP === providedOTP;
};

/**
 * Send OTP via SMS (placeholder - integrate with SMS service like Twilio)
 * @param {string} phone - Phone number
 * @param {string} otp - OTP code
 * @returns {Promise<void>}
 */
const sendOTPViaSMS = async (phone, otp) => {
  // Check if SMS service is configured
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`\n📱 [SMS OTP - Console Mode] Phone: ${phone}, OTP: ${otp}`);
    console.log('⚠️  SMS service not configured. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env file to send real SMS.\n');
    return;
  }

  try {
    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    // Example Twilio integration:
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({
    //   body: `Your verification code is: ${otp}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone
    // });
  } catch (error) {
    throw error;
  }
};

/**
 * Send OTP via Email using Nodemailer
 * @param {string} email - Email address
 * @param {string} otp - OTP code
 * @returns {Promise<void>}
 */
const sendOTPViaEmail = async (email, otp) => {
  // Check if email service is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n📧 [Email OTP - Console Mode] Email: ${email}, OTP: ${otp}`);
    console.log('⚠️  Email service not configured. Add EMAIL_USER and EMAIL_PASS to .env file to send real emails.\n');
    return;
  }

  try {
    const nodemailer = require('nodemailer');
    
    // Create transporter based on email service
    let transporter;
    
    if (process.env.EMAIL_SERVICE === 'gmail' || !process.env.EMAIL_SERVICE) {
      // Gmail configuration
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Use App Password for Gmail
        },
      });
    } else if (process.env.EMAIL_SERVICE === 'smtp') {
      // Custom SMTP configuration
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // Generic service (Outlook, Yahoo, etc.)
      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    // Email content
    const mailOptions = {
      from: `"Site Snap" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code - Site Snap',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hello,</p>
          <p>Your verification code for Site Snap is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `,
      text: `Your verification code for Site Snap is: ${otp}. This code will expire in 10 minutes.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateOTP,
  getOTPExpiration,
  verifyOTP,
  sendOTPViaSMS,
  sendOTPViaEmail,
};

