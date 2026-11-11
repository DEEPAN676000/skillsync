import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILearnerProfile extends Document {
  user: mongoose.Types.ObjectId;
  interests: string[];
  learningGoals: string[];
  savedCourses: mongoose.Types.ObjectId[];
  savedVideos: mongoose.Types.ObjectId[];
  savedTeachers: mongoose.Types.ObjectId[];
  bio: string;
}

const LearnerProfileSchema = new Schema<ILearnerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    interests: {
      type: [String],
      default: [],
    },
    learningGoals: {
      type: [String],
      default: [],
    },
    savedCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    savedVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    savedTeachers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    bio: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const LearnerProfile: Model<ILearnerProfile> =
  mongoose.models.LearnerProfile ||
  mongoose.model<ILearnerProfile>('LearnerProfile', LearnerProfileSchema);
export default LearnerProfile;

