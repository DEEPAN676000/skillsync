import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICourse extends Document {
  teacher: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  category: mongoose.Types.ObjectId;
  subCategory?: string;
  thumbnail: string;
  promoVideo?: string;
  price: number;
  durationMinutes: number;
  difficulty: 'all_levels' | 'beginner' | 'intermediate' | 'advanced';
  lessonsCount: number;
  requirements: string[];
  whatYouWillLearn: string[];
  status: 'draft' | 'published' | 'archived';
  isApproved: boolean;
  rating: number;
  numReviews: number;
  enrolledCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    subCategory: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    },
    promoVideo: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    durationMinutes: {
      type: Number,
      default: 60,
    },
    difficulty: {
      type: String,
      enum: ['all_levels', 'beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    lessonsCount: {
      type: Number,
      default: 0,
    },
    requirements: {
      type: [String],
      default: [],
    },
    whatYouWillLearn: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

CourseSchema.pre<ICourse>('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      randomSuffix;
  }
  next();
});

export const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export default Course;

