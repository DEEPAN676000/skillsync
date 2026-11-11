import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'live_class' | 'course' | 'assignment' | 'subscription' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['booking', 'payment', 'live_class', 'course', 'assignment', 'subscription', 'system'],
      default: 'system',
      index: true,
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;

