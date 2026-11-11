import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_SkillSync2026';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_skillsync_test_mock';

export const isRazorpayConfigured = (): boolean => {
  return (
    Boolean(key_id) &&
    Boolean(key_secret) &&
    key_id !== 'rzp_test_SkillSync2026' &&
    key_secret !== 'rzp_secret_skillsync_test_mock'
  );
};

export const razorpayInstance = new Razorpay({
  key_id,
  key_secret,
});

export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_skillsync_test_mock';
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

export const verifyWebhookSignature = (
  rawBody: string,
  webhookSignature: string,
  webhookSecret: string
): boolean => {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === webhookSignature;
};

export default razorpayInstance;

