import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILessonMaterial {
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize?: string;
}

export interface ILesson extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  description: string;
  orderIndex: number;
  durationMinutes: number;
  videoUrl: string;
  thumbnailUrl: string;
  content: string;
  isFreePreview: boolean;
  materials: ILessonMaterial[];
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<ILessonMaterial>({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, default: 'pdf' },
  fileSize: { type: String, default: '1.2 MB' },
});

const LessonSchema = new Schema<ILesson>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
    },
    orderIndex: {
      type: Number,
      required: true,
      default: 0,
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 15,
    },
    videoUrl: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    isFreePreview: {
      type: Boolean,
      default: false,
    },
    materials: [MaterialSchema],
  },
  { timestamps: true }
);

export const Lesson: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
export default Lesson;

