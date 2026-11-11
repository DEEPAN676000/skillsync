export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'learner' | 'teacher' | 'admin';
  avatar: string;
  phone?: string;
  bio?: string;
  isEmailVerified?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  featured: boolean;
  order: number;
  courseCount?: number;
  teacherCount?: number;
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface TeacherProfile {
  _id: string;
  user: User;
  title: string;
  bio: string;
  skills: string[];
  categories: Category[];
  experienceYears: number;
  qualifications: string[];
  introVideoUrl?: string;
  languages: string[];
  hourlyRate: number;
  availabilitySchedule: AvailabilitySlot[];
  rating: number;
  numReviews: number;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationDocuments?: Array<{
    title: string;
    fileUrl: string;
    uploadedAt: string;
  }>;
  verificationNote?: string;
  subscriptionTier: 'basic' | 'premium' | 'pro';
  featured: boolean;
  totalEarnings: number;
  totalStudentsCount: number;
}

export interface LessonMaterial {
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize?: string;
}

export interface Lesson {
  _id: string;
  course: string;
  title: string;
  description: string;
  orderIndex: number;
  durationMinutes: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  content?: string;
  isFreePreview: boolean;
  materials?: LessonMaterial[];
}

export interface Course {
  _id: string;
  teacher: User;
  title: string;
  slug: string;
  description: string;
  category: Category;
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
  createdAt: string;
}

export interface VideoShowcase {
  _id: string;
  teacher: User;
  title: string;
  description: string;
  category: Category;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  likes: string[];
  likesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  views: number;
  relatedCourse?: Course;
  tags: string[];
  createdAt: string;
}

export interface LiveClass {
  _id: string;
  teacher: User;
  title: string;
  description: string;
  category: Category;
  course?: Course;
  scheduledAt: string;
  durationMinutes: number;
  price: number;
  maxCapacity: number;
  enrolledLearners: Array<{ learner: User; enrolledAt: string }>;
  meetingRoomId: string;
  meetingUrl: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  cancellationReason?: string;
}

export interface Booking {
  _id: string;
  learner: User;
  teacher: User;
  course?: Course;
  liveClass?: LiveClass;
  type: 'course_enrollment' | 'live_class' | '1_on_1_session';
  bookingDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  amount: number;
  meetingLink?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  _id: string;
  user: User;
  orderId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed' | 'refunded';
  itemType: 'course' | 'live_class' | 'subscription' | 'booking';
  receipt: string;
  createdAt: string;
}

export interface CourseProgress {
  completedLessons: string[] | Lesson[];
  progressPercentage: number;
  lastWatchedLesson?: string;
  isCompleted: boolean;
}

export interface Review {
  _id: string;
  user: User;
  course: string;
  rating: number;
  comment: string;
  isVerifiedLearner: boolean;
  createdAt: string;
}

export interface QuizQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface Quiz {
  _id: string;
  course: string;
  title: string;
  description?: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface Assignment {
  _id: string;
  course: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'live_class' | 'course' | 'assignment' | 'subscription' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: 'basic' | 'premium' | 'pro';
  name: string;
  price: number;
  billingCycle: string;
  description: string;
  features: string[];
  popular?: boolean;
  limits: {
    maxCourses: number;
    maxVideos: number;
    commissionRate: number;
    priorityDiscovery: boolean;
    analyticsEnabled: boolean;
  };
}
