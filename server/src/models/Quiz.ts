import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IQuizQuestion {
  _id?: mongoose.Types.ObjectId;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface IQuizAttempt {
  _id?: mongoose.Types.ObjectId;
  learner: mongoose.Types.ObjectId;
  answers: number[];
  score: number;
  passed: boolean;
  attemptedAt: Date;
}

export interface IQuiz extends Document {
  course: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  passingScore: number;
  questions: IQuizQuestion[];
  attempts: IQuizAttempt[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswerIndex: { type: Number, required: true },
  explanation: { type: String, default: '' },
});

const AttemptSchema = new Schema<IQuizAttempt>({
  learner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answers: { type: [Number], required: true },
  score: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  attemptedAt: { type: Date, default: Date.now },
});

const QuizSchema = new Schema<IQuiz>(
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
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    passingScore: {
      type: Number,
      default: 70,
    },
    questions: [QuestionSchema],
    attempts: [AttemptSchema],
  },
  { timestamps: true }
);

export const Quiz: Model<IQuiz> =
  mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
export default Quiz;

