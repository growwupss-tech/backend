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
  // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
  // For now, log the OTP (remove in production)
  console.log(`[SMS OTP] Phone: ${phone}, OTP: ${otp}`);
  
  // Example Twilio integration:
  // const accountSid = process.env.TWILIO_ACCOUNT_SID;
  // const authToken = process.env.TWILIO_AUTH_TOKEN;
  // const client = require('twilio')(accountSid, authToken);
  // await client.messages.create({
  //   body: `Your verification code is: ${otp}`,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: phone
  // });
};

/**
 * Send OTP via Email (placeholder - integrate with email service)
 * @param {string} email - Email address
 * @param {string} otp - OTP code
 * @returns {Promise<void>}
 */
const sendOTPViaEmail = async (email, otp) => {
  // TODO: Integrate with email service (SendGrid, AWS SES, Nodemailer, etc.)
  // For now, log the OTP (remove in production)
  console.log(`[Email OTP] Email: ${email}, OTP: ${otp}`);
  
  // Example Nodemailer integration:
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS
  //   }
  // });
  // await transporter.sendMail({
  //   from: process.env.EMAIL_USER,
  //   to: email,
  //   subject: 'Your Verification Code',
  //   text: `Your verification code is: ${otp}`
  // });
};

module.exports = {
  generateOTP,
  getOTPExpiration,
  verifyOTP,
  sendOTPViaSMS,
  sendOTPViaEmail,
};

