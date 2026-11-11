import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProgress extends Document {
  learner: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  completedLessons: mongoose.Types.ObjectId[];
  progressPercentage: number;
  lastWatchedLesson?: mongoose.Types.ObjectId;
  isCompleted: boolean;
  completedAt?: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
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
    completedLessons: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastWatchedLesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  },
  { timestamps: true }
);

ProgressSchema.index({ learner: 1, course: 1 }, { unique: true });

export const Progress: Model<IProgress> =
  mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);
export default Progress;

