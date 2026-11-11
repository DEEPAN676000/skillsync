import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IEnrollment extends Document {
  learner: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  status: 'active' | 'completed' | 'refunded';
  enrolledAt: Date;
  completedAt?: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    learner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'refunded'],
      default: 'active',
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
  },
  { timestamps: true }
);

EnrollmentSchema.index({ learner: 1, course: 1 }, { unique: true });

export const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
export default Enrollment;

