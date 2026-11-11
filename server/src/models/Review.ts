import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  isVerifiedLearner: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: {
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
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating must be between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comment'],
      maxlength: 1000,
    },
    isVerifiedLearner: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent user from reviewing the same course multiple times
ReviewSchema.index({ user: 1, course: 1 }, { unique: true });

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
export default Review;

