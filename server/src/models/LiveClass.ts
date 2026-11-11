import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IEnrolledLearner {
  learner: mongoose.Types.ObjectId;
  enrolledAt: Date;
  booking?: mongoose.Types.ObjectId;
}

export interface ILiveClass extends Document {
  teacher: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  scheduledAt: Date;
  durationMinutes: number;
  price: number;
  maxCapacity: number;
  enrolledLearners: IEnrolledLearner[];
  meetingRoomId: string;
  meetingUrl: string;
  meetingPassword?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnrolledLearnerSchema = new Schema<IEnrolledLearner>({
  learner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  enrolledAt: { type: Date, default: Date.now },
  booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
});

const LiveClassSchema = new Schema<ILiveClass>(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a class title'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled start date and time is required'],
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 60,
      min: 15,
      max: 300,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    maxCapacity: {
      type: Number,
      required: true,
      default: 15,
      min: 1,
      max: 100,
    },
    enrolledLearners: [EnrolledLearnerSchema],
    meetingRoomId: {
      type: String,
      required: true,
    },
    meetingUrl: {
      type: String,
      required: true,
    },
    meetingPassword: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const LiveClass: Model<ILiveClass> =
  mongoose.models.LiveClass || mongoose.model<ILiveClass>('LiveClass', LiveClassSchema);
export default LiveClass;

