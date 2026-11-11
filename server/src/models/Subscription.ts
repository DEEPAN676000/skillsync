import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISubscriptionFeatures {
  maxCourses: number;
  maxVideos: number;
  commissionRate: number; // percentage platform takes (e.g. 15% basic, 10% premium, 5% pro)
  priorityDiscovery: boolean;
  analyticsEnabled: boolean;
}

export interface ISubscription extends Document {
  teacher: mongoose.Types.ObjectId;
  plan: 'basic' | 'premium' | 'pro';
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  price: number;
  payment?: mongoose.Types.ObjectId;
  features: ISubscriptionFeatures;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['basic', 'premium', 'pro'],
      default: 'basic',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
      index: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    features: {
      maxCourses: { type: Number, default: 3 },
      maxVideos: { type: Number, default: 5 },
      commissionRate: { type: Number, default: 15 },
      priorityDiscovery: { type: Boolean, default: false },
      analyticsEnabled: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const Subscription: Model<ISubscription> =
  mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
export default Subscription;

