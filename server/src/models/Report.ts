import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId;
  targetType: 'video' | 'course' | 'teacher' | 'user' | 'review';
  targetId: mongoose.Types.ObjectId;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['video', 'course', 'teacher', 'user', 'review'],
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
export default Report;

