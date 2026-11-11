import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBooking extends Document {
  learner: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  liveClass?: mongoose.Types.ObjectId;
  type: 'course_enrollment' | 'live_class' | '1_on_1_session';
  bookingDate: Date;
  scheduledStartTime?: Date;
  scheduledEndTime?: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  amount: number;
  payment?: mongoose.Types.ObjectId;
  notes?: string;
  meetingLink?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    learner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    liveClass: {
      type: Schema.Types.ObjectId,
      ref: 'LiveClass',
    },
    type: {
      type: String,
      enum: ['course_enrollment', 'live_class', '1_on_1_session'],
      required: true,
      index: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    scheduledStartTime: Date,
    scheduledEndTime: Date,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
      default: 'pending',
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    notes: {
      type: String,
      default: '',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
export default Booking;

