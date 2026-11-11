import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IVideo extends Document {
  teacher: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: mongoose.Types.ObjectId;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  likes: mongoose.Types.ObjectId[];
  saves: mongoose.Types.ObjectId[];
  views: number;
  relatedCourse?: mongoose.Types.ObjectId;
  tags: string[];
  isModerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a video title'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    thumbnailUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=600',
    },
    durationSeconds: {
      type: Number,
      default: 60,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    saves: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    relatedCourse: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    tags: {
      type: [String],
      default: [],
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Video: Model<IVideo> =
  mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);
export default Video;

