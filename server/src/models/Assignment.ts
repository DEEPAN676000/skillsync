import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAssignmentSubmission {
  _id?: mongoose.Types.ObjectId;
  learner: mongoose.Types.ObjectId;
  content: string;
  attachmentUrl?: string;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
  submittedAt: Date;
}

export interface IAssignment extends Document {
  course: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  maxScore: number;
  submissions: IAssignmentSubmission[];
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<IAssignmentSubmission>({
  learner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  attachmentUrl: { type: String, default: '' },
  score: { type: Number },
  feedback: { type: String, default: '' },
  status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
  submittedAt: { type: Date, default: Date.now },
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    submissions: [SubmissionSchema],
  },
  { timestamps: true }
);

export const Assignment: Model<IAssignment> =
  mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);
export default Assignment;

