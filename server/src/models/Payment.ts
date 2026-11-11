import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  orderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed' | 'refunded';
  itemType: 'course' | 'live_class' | 'subscription' | 'booking';
  itemId: mongoose.Types.ObjectId;
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  receipt: string;
  rawResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
      index: true,
    },
    signature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    itemType: {
      type: String,
      enum: ['course', 'live_class', 'subscription', 'booking'],
      required: true,
      index: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    refundId: String,
    refundAmount: Number,
    refundReason: String,
    receipt: {
      type: String,
      required: true,
    },
    rawResponse: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;

