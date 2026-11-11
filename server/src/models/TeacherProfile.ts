import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAvailabilitySlot {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "17:00"
  isAvailable: boolean;
}

export interface ITeacherProfile extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  bio: string;
  skills: string[];
  categories: mongoose.Types.ObjectId[];
  experienceYears: number;
  qualifications: string[];
  introVideoUrl: string;
  languages: string[];
  hourlyRate: number;
  availabilitySchedule: IAvailabilitySlot[];
  rating: number;
  numReviews: number;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationDocuments: Array<{
    title: string;
    fileUrl: string;
    uploadedAt: Date;
  }>;
  verificationNote?: string;
  subscriptionTier: 'basic' | 'premium' | 'pro';
  subscriptionExpiresAt?: Date;
  featured: boolean;
  totalEarnings: number;
  totalStudentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AvailabilitySlotSchema = new Schema<IAvailabilitySlot>({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '17:00' },
  isAvailable: { type: Boolean, default: true },
});

const TeacherProfileSchema = new Schema<ITeacherProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Expert Instructor',
      trim: true,
      maxlength: 120,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    experienceYears: {
      type: Number,
      default: 1,
      min: 0,
    },
    qualifications: {
      type: [String],
      default: [],
    },
    introVideoUrl: {
      type: String,
      default: '',
    },
    languages: {
      type: [String],
      default: ['English'],
    },
    hourlyRate: {
      type: Number,
      default: 500, // INR
      min: 0,
    },
    availabilitySchedule: {
      type: [AvailabilitySlotSchema],
      default: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isAvailable: true },
        { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isAvailable: true },
        { dayOfWeek: 0, startTime: '10:00', endTime: '14:00', isAvailable: false },
      ],
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
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
      index: true,
    },
    verificationDocuments: [
      {
        title: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    verificationNote: {
      type: String,
      default: '',
    },
    subscriptionTier: {
      type: String,
      enum: ['basic', 'premium', 'pro'],
      default: 'basic',
    },
    subscriptionExpiresAt: Date,
    featured: {
      type: Boolean,
      default: false,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    totalStudentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const TeacherProfile: Model<ITeacherProfile> =
  mongoose.models.TeacherProfile ||
  mongoose.model<ITeacherProfile>('TeacherProfile', TeacherProfileSchema);
export default TeacherProfile;

