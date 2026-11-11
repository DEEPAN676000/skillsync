import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import TeacherProfile from '../models/TeacherProfile.js';
import LearnerProfile from '../models/LearnerProfile.js';
import Category from '../models/Category.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Video from '../models/Video.js';
import LiveClass from '../models/LiveClass.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import Review from '../models/Review.js';
import Quiz from '../models/Quiz.js';
import Assignment from '../models/Assignment.js';
import Notification from '../models/Notification.js';
import Subscription from '../models/Subscription.js';
import { generateJitsiRoom } from '../services/jitsiService.js';

dotenv.config();

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillsync';
  try {
    console.log(`[Seed] Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed] Connected successfully.');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      TeacherProfile.deleteMany({}),
      LearnerProfile.deleteMany({}),
      Category.deleteMany({}),
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Video.deleteMany({}),
      LiveClass.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Enrollment.deleteMany({}),
      Progress.deleteMany({}),
      Review.deleteMany({}),
      Quiz.deleteMany({}),
      Assignment.deleteMany({}),
      Notification.deleteMany({}),
      Subscription.deleteMany({}),
    ]);

    console.log('[Seed] Cleaned existing collections.');

    // 1. Categories
    const categoriesData = [
      { name: 'Music', description: 'Master instruments, vocals, music production, and sound design.', icon: 'Music', order: 1 },
      { name: 'Dance', description: 'Contemporary, hip-hop, classical, and cultural dance styles.', icon: 'Activity', order: 2 },
      { name: 'Programming', description: 'Full-stack web development, Python, mobile apps, and machine learning.', icon: 'Code', order: 3 },
      { name: 'Photography', description: 'Portrait, landscape, camera gear mastery, and Adobe Lightroom editing.', icon: 'Camera', order: 4 },
      { name: 'Drawing and Painting', description: 'Watercolor, oil painting, digital sketching, and character art.', icon: 'Palette', order: 5 },
      { name: 'Cooking', description: 'Artisanal culinary techniques, baking, international cuisine, and plating.', icon: 'Utensils', order: 6 },
      { name: 'Fitness', description: 'Yoga, HIIT conditioning, calisthenics, and breathwork mastery.', icon: 'Flame', order: 7 },
      { name: 'Language Learning', description: 'Conversational fluency in Spanish, Japanese, French, and Mandarin.', icon: 'Globe', order: 8 },
      { name: 'Arts and Crafts', description: 'Pottery, woodworking, resin craft, and handmade jewelry design.', icon: 'Scissors', order: 9 },
    ];

    const categories = await Category.create(categoriesData);
    const catMap = new Map();
    categories.forEach((cat) => catMap.set(cat.name, cat._id));

    // 2. Users
    const passwordHash = await bcrypt.hash('password123', 10);
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    const usersData = [
      {
        name: 'SkillSync Admin',
        email: 'admin@skillsync.com',
        password: adminPasswordHash,
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        role: 'admin',
        isEmailVerified: true,
        bio: 'SkillSync Platform Administrator & Moderator',
      },
      // Teachers
      {
        name: 'Elena Rostova',
        email: 'elena.violin@skillsync.com',
        password: passwordHash,
        phone: '+91 98111 22334',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
        role: 'teacher',
        isEmailVerified: true,
        bio: 'Concert Violinist & Master Music Educator with over 12 years of performance and orchestra experience.',
      },
      {
        name: 'Marcus Chen',
        email: 'marcus.code@skillsync.com',
        password: passwordHash,
        phone: '+91 98222 33445',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        role: 'teacher',
        isEmailVerified: true,
        bio: 'Senior Full-Stack Engineer specializing in React, Node.js, TypeScript, and AI integrations.',
      },
      {
        name: 'Priya Sharma',
        email: 'priya.dance@skillsync.com',
        password: passwordHash,
        phone: '+91 98333 44556',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
        role: 'teacher',
        isEmailVerified: true,
        bio: 'Professional contemporary dancer, choreographer, and certified Kathak instructor.',
      },
      {
        name: 'Chef Antonio Ricci',
        email: 'antonio.chef@skillsync.com',
        password: passwordHash,
        phone: '+91 98444 55667',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
        role: 'teacher',
        isEmailVerified: true,
        bio: 'Artisan Pasta Chef and Baker trained in Florence with a passion for authentic Mediterranean flavors.',
      },
      // Learners
      {
        name: 'David Miller',
        email: 'david@example.com',
        password: passwordHash,
        phone: '+91 98555 66778',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
        role: 'learner',
        isEmailVerified: true,
        bio: 'Software developer and aspiring violinist eager to learn musical theory and practice.',
      },
      {
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        password: passwordHash,
        phone: '+91 98666 77889',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
        role: 'learner',
        isEmailVerified: true,
        bio: 'Product designer interested in modern choreography, fitness, and gourmet cooking.',
      },
      {
        name: 'Alex Rivera',
        email: 'alex@example.com',
        password: passwordHash,
        phone: '+91 98777 88990',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
        role: 'learner',
        isEmailVerified: true,
        bio: 'Lifelong learner exploring languages, photography, and creative arts.',
      },
    ];

    const users = await User.create(usersData);
    const userMap = new Map();
    users.forEach((u) => userMap.set(u.email, u));

    // 3. Teacher Profiles & Subscriptions
    const elena = userMap.get('elena.violin@skillsync.com')!;
    const marcus = userMap.get('marcus.code@skillsync.com')!;
    const priya = userMap.get('priya.dance@skillsync.com')!;
    const antonio = userMap.get('antonio.chef@skillsync.com')!;

    await TeacherProfile.create([
      {
        user: elena._id,
        title: 'Master Classical Violinist & Soloist',
        bio: 'Elena is a Juilliard-trained concert violinist who has performed with prestigious European philharmonics. She specializes in making violin technique intuitive and expressive for all levels.',
        skills: ['Violin Technique', 'Bowing Mastery', 'Music Theory', 'Ear Training', 'Orchestral Performance'],
        categories: [catMap.get('Music')],
        experienceYears: 12,
        qualifications: ["Master's in Classical Violin Performance - Juilliard", 'Royal Academy of Music Licentiate'],
        introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        languages: ['English', 'Russian', 'Italian'],
        hourlyRate: 1200,
        rating: 4.9,
        numReviews: 24,
        verificationStatus: 'verified',
        subscriptionTier: 'pro',
        featured: true,
        totalEarnings: 84000,
        totalStudentsCount: 142,
      },
      {
        user: marcus._id,
        title: 'Staff Software Architect & Full-Stack Mentor',
        bio: 'Marcus has built scalable distributed architectures and helped hundreds of students transition into high-paying software engineering roles. He breaks down complex programming concepts with clean visuals and real projects.',
        skills: ['React 18', 'TypeScript', 'Node.js', 'System Design', 'MongoDB', 'REST APIs'],
        categories: [catMap.get('Programming')],
        experienceYears: 9,
        qualifications: ['BS Computer Science - UC Berkeley', 'AWS Certified Solutions Architect - Professional'],
        introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        languages: ['English', 'Mandarin'],
        hourlyRate: 1500,
        rating: 5.0,
        numReviews: 38,
        verificationStatus: 'verified',
        subscriptionTier: 'pro',
        featured: true,
        totalEarnings: 128000,
        totalStudentsCount: 260,
      },
      {
        user: priya._id,
        title: 'Choreographer & Contemporary Dance Artist',
        bio: 'Priya blends classical discipline with fluid contemporary movement. Her sessions focus on posture, rhythmic musicality, spatial awareness, and emotive choreography.',
        skills: ['Contemporary Dance', 'Kathak', 'Flexibility Training', 'Stage Choreography', 'Rhythm & Beats'],
        categories: [catMap.get('Dance'), catMap.get('Fitness')],
        experienceYears: 7,
        qualifications: ['National Diploma in Performing Arts - Kathak Kendra', 'Certified Movement Therapist'],
        introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        languages: ['English', 'Hindi'],
        hourlyRate: 800,
        rating: 4.8,
        numReviews: 19,
        verificationStatus: 'verified',
        subscriptionTier: 'premium',
        featured: true,
        totalEarnings: 45000,
        totalStudentsCount: 95,
      },
      {
        user: antonio._id,
        title: 'Italian Master Chef & Artisanal Pasta Maker',
        bio: 'Chef Antonio brings the heart of Tuscan kitchens directly to your home. Learn the exact science of handmade egg pasta, authentic fermented sourdough, and balanced Mediterranean sauces.',
        skills: ['Handmade Pasta', 'Sourdough Baking', 'Italian Sauces', 'Wine Pairing', 'Knife Skills'],
        categories: [catMap.get('Cooking')],
        experienceYears: 15,
        qualifications: ['Culinary Arts Diploma - Florence Culinary Institute', 'Head Chef - Trattoria del Sole'],
        introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        languages: ['English', 'Italian'],
        hourlyRate: 1000,
        rating: 4.95,
        numReviews: 31,
        verificationStatus: 'verified',
        subscriptionTier: 'premium',
        featured: true,
        totalEarnings: 62000,
        totalStudentsCount: 110,
      },
    ]);

    // Subscriptions for teachers
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    await Subscription.create([
      {
        teacher: elena._id,
        plan: 'pro',
        startDate: new Date(),
        endDate: nextYear,
        status: 'active',
        price: 2499,
        features: { maxCourses: 50, maxVideos: 100, commissionRate: 5, priorityDiscovery: true, analyticsEnabled: true },
      },
      {
        teacher: marcus._id,
        plan: 'pro',
        startDate: new Date(),
        endDate: nextYear,
        status: 'active',
        price: 2499,
        features: { maxCourses: 50, maxVideos: 100, commissionRate: 5, priorityDiscovery: true, analyticsEnabled: true },
      },
      {
        teacher: priya._id,
        plan: 'premium',
        startDate: new Date(),
        endDate: nextYear,
        status: 'active',
        price: 999,
        features: { maxCourses: 15, maxVideos: 30, commissionRate: 10, priorityDiscovery: true, analyticsEnabled: true },
      },
      {
        teacher: antonio._id,
        plan: 'premium',
        startDate: new Date(),
        endDate: nextYear,
        status: 'active',
        price: 999,
        features: { maxCourses: 15, maxVideos: 30, commissionRate: 10, priorityDiscovery: true, analyticsEnabled: true },
      },
    ]);

    // 4. Learner Profiles
    const david = userMap.get('david@example.com')!;
    const sarah = userMap.get('sarah@example.com')!;
    const alex = userMap.get('alex@example.com')!;

    await LearnerProfile.create([
      { user: david._id, interests: ['Music', 'Programming'], learningGoals: ['Play Vivaldi Violin Concertos', 'Build full-stack AI applications'] },
      { user: sarah._id, interests: ['Dance', 'Cooking', 'Fitness'], learningGoals: ['Master handmade pasta', 'Improve dance flexibility'] },
      { user: alex._id, interests: ['Photography', 'Music', 'Drawing and Painting'], learningGoals: ['Learn acoustic guitar chords', 'Master lighting'] },
    ]);

    // 5. Courses
    const coursesData = [
      {
        teacher: elena._id,
        title: 'Mastering the Violin: From First Note to Expressive Vibrato',
        description: 'A comprehensive, step-by-step masterclass designed to take you from basic posture and bowing techniques to rich tone production, smooth shifting, and expressive vibrato. Includes annotated sheet music and daily practice routines.',
        category: catMap.get('Music'),
        subCategory: 'Strings',
        thumbnail: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?auto=format&fit=crop&q=80&w=700',
        price: 1499,
        durationMinutes: 240,
        difficulty: 'beginner',
        requirements: ['A playable violin with bow and rosin', 'A shoulder rest and clip-on tuner', '30 minutes of daily dedicated practice'],
        whatYouWillLearn: [
          'Correct violin posture and ergonomic bow grip',
          'Intonation and finger placement on all four strings',
          'Smooth bow distribution and dynamics control',
          'Expressive wrist and arm vibrato mechanics',
          'Reading classical and contemporary sheet music with ease',
        ],
        status: 'published',
        isApproved: true,
        rating: 4.9,
        numReviews: 18,
        enrolledCount: 64,
        tags: ['Violin', 'Classical Music', 'Strings', 'Music Theory'],
      },
      {
        teacher: marcus._id,
        title: 'Production Full-Stack TypeScript with React 18 & Node.js',
        description: 'Build robust, scalable, enterprise-grade full-stack web applications. Learn end-to-end type safety, modern React state architecture, clean Express REST API patterns, MongoDB schema design, JWT authentication, and automated cloud deployments.',
        category: catMap.get('Programming'),
        subCategory: 'Web Development',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=700',
        price: 1999,
        durationMinutes: 480,
        difficulty: 'intermediate',
        requirements: ['Basic understanding of HTML, CSS, and modern JavaScript (ES6+)', 'A computer with Node.js and VS Code installed'],
        whatYouWillLearn: [
          'Master TypeScript generics, utility types, and strict mode',
          'Build responsive UI interfaces with Tailwind CSS and Lucide React',
          'Design resilient Express micro-architectures with Mongoose',
          'Implement secure JWT authentication and role-based access control',
          'Integrate real payment gateways and cloud media storage',
        ],
        status: 'published',
        isApproved: true,
        rating: 5.0,
        numReviews: 29,
        enrolledCount: 112,
        tags: ['TypeScript', 'React', 'Node.js', 'MongoDB', 'Full-Stack'],
      },
      {
        teacher: priya._id,
        title: 'Contemporary Dance Foundations: Flow, Floorwork & Expression',
        description: 'Unlock your bodys natural expressive capacity. Learn grounding techniques, release mechanics, fluid floor transitions, musical rhythm alignment, and full choreographed lyrical routines.',
        category: catMap.get('Dance'),
        subCategory: 'Contemporary',
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=700',
        price: 999,
        durationMinutes: 180,
        difficulty: 'all_levels',
        requirements: ['Comfortable athletic or dance wear', 'Open floor space (at least 2m x 2m) with wooden or smooth flooring'],
        whatYouWillLearn: [
          'Core stability and spine articulation',
          'Safe and fluid contemporary floor transitions',
          'Dynamic weight shifts and balance recovery',
          'Expressing emotion and musical phrasing through dance',
          'Full performance choreographies',
        ],
        status: 'published',
        isApproved: true,
        rating: 4.8,
        numReviews: 14,
        enrolledCount: 48,
        tags: ['Dance', 'Contemporary', 'Choreography', 'Movement'],
      },
      {
        teacher: antonio._id,
        title: 'Authentic Italian Pasta Mastery: From Scratch to Table',
        description: 'Discover the heritage of traditional Italian pasta making. Knead silky egg dough, shape garganelli, tagliatelle, ravioli, and tortellini, and simmer classic regional sauces with perfection.',
        category: catMap.get('Cooking'),
        subCategory: 'Italian Cuisine',
        thumbnail: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=700',
        price: 899,
        durationMinutes: 150,
        difficulty: 'beginner',
        requirements: ['Italian "00" flour and semolina flour', 'Fresh eggs and olive oil', 'Rolling pin or simple pasta hand machine'],
        whatYouWillLearn: [
          'The golden ratio of egg yolks to flour for perfect elasticity',
          'Hand-rolling and cutting tagliatelle, fettuccine, and pappardelle',
          'Crafting stuffed ravioli and tortellini without leaks',
          'Authentic Cacio e Pepe, Carbonara, and slow-braised Ragu Bolognese',
        ],
        status: 'published',
        isApproved: true,
        rating: 4.95,
        numReviews: 22,
        enrolledCount: 75,
        tags: ['Cooking', 'Pasta', 'Italian', 'Culinary'],
      },
    ];

    const courses = await Course.create(coursesData);
    const violinCourse = courses[0];
    const tsCourse = courses[1];
    const danceCourse = courses[2];
    const pastaCourse = courses[3];

    // 6. Lessons for each course
    await Lesson.create([
      // Violin Lessons
      {
        course: violinCourse._id,
        title: 'Lesson 1: Anatomy of the Violin, Tuning & Ergonomic Posture',
        description: 'Introduction to violin components, proper shoulder rest adjustment, bow tightening, and fine tuner usage.',
        orderIndex: 0,
        durationMinutes: 25,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=600',
        content: '# Getting Started with the Violin\n\nEnsure your bow hair has a pencil-width tension. Apply rosin evenly in 5-6 full strokes.',
        isFreePreview: true,
        materials: [{ title: 'Beginner Violin Fingering Chart.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf' }],
      },
      {
        course: violinCourse._id,
        title: 'Lesson 2: The Open String Bowing Technique & Tone Production',
        description: 'Produce clear, singing tones on G, D, A, and E strings without squeaking or bouncing.',
        orderIndex: 1,
        durationMinutes: 30,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80&w=600',
        content: 'Maintain a 90-degree angle between the bow stick and strings parallel to the bridge.',
        isFreePreview: false,
      },
      {
        course: violinCourse._id,
        title: 'Lesson 3: First Position Fingerings and Major Scales',
        description: 'Placing 1st, 2nd, 3rd, and 4th fingers on the fingerboard with pristine intonation.',
        orderIndex: 2,
        durationMinutes: 35,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=600',
        content: 'Practice the D Major and G Major two-octave scales daily using metronome set to 60 BPM.',
        isFreePreview: false,
      },

      // TypeScript Course Lessons
      {
        course: tsCourse._id,
        title: 'Lesson 1: Modern TypeScript Architecture & Strict Configuration',
        description: 'Set up tsconfig with strict flags, NodeNext module resolution, and project references.',
        orderIndex: 0,
        durationMinutes: 30,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
        content: '# TypeScript 5.4 Best Practices\n\nAlways enable `strict: true`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`.',
        isFreePreview: true,
        materials: [{ title: 'Full-Stack Architecture Cheat Sheet.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf' }],
      },
      {
        course: tsCourse._id,
        title: 'Lesson 2: Designing Express Controllers & REST APIs with Mongoose',
        description: 'Building type-safe route handlers, async middleware, and robust error wrappers.',
        orderIndex: 1,
        durationMinutes: 45,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600',
        content: 'Use interface inheritance for Mongoose documents and validate input using strict schemas.',
        isFreePreview: false,
      },
      {
        course: tsCourse._id,
        title: 'Lesson 3: Securing JWT Authentication & Role Authorization',
        description: 'Implementing bcrypt hashing, Bearer token verification, and role-based route guards.',
        orderIndex: 2,
        durationMinutes: 40,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
        content: 'Store tokens securely and enforce authorization guards on all sensitive mutations.',
        isFreePreview: false,
      },
    ]);

    // Update lesson counts on courses
    await Course.findByIdAndUpdate(violinCourse._id, { lessonsCount: 3 });
    await Course.findByIdAndUpdate(tsCourse._id, { lessonsCount: 3 });

    // 7. Quizzes and Assignments
    await Quiz.create([
      {
        course: violinCourse._id,
        title: 'Violin Fundamentals Knowledge Check',
        description: 'Test your understanding of violin string tuning, bowing angles, and posture.',
        passingScore: 70,
        questions: [
          {
            question: 'What are the four strings of a standard violin from lowest pitch to highest?',
            options: ['E - A - D - G', 'G - D - A - E', 'C - G - D - A', 'A - D - G - C'],
            correctAnswerIndex: 1,
            explanation: 'The violin is tuned in perfect fifths: G (lowest), D, A, and E (highest).',
          },
          {
            question: 'Where should the bow contact the string for optimal tone?',
            options: ['Directly over the fingerboard', 'Halfway between the bridge and fingerboard', 'On the tailpiece', 'On the wooden bridge itself'],
            correctAnswerIndex: 1,
            explanation: 'The sounding point halfway between the fingerboard and bridge produces the most balanced harmonic resonance.',
          },
        ],
      },
      {
        course: tsCourse._id,
        title: 'TypeScript & Node Architecture Quiz',
        description: 'Verify your mastery of TypeScript generics, async execution, and REST principles.',
        passingScore: 80,
        questions: [
          {
            question: 'Which tsconfig flag prevents undefined errors when accessing array elements by index?',
            options: ['noImplicitAny', 'noUncheckedIndexedAccess', 'strictNullChecks', 'skipLibCheck'],
            correctAnswerIndex: 1,
            explanation: '`noUncheckedIndexedAccess` ensures index signatures return `T | undefined`.',
          },
          {
            question: 'What is the purpose of bcrypt salting when hashing passwords?',
            options: ['To compress password length', 'To prevent rainbow table precomputation attacks', 'To speed up hashing performance', 'To allow two-way decryption'],
            correctAnswerIndex: 1,
            explanation: 'Salting appends unique random bytes to ensure identical passwords hash to different values.',
          },
        ],
      },
    ]);

    await Assignment.create([
      {
        course: violinCourse._id,
        title: 'Assignment 1: Two-Octave G Major Scale Recording',
        description: 'Record a 60-second audio or video of yourself playing the G Major scale slowly with consistent bow speed. Focus on clean string crossings.',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        maxScore: 100,
      },
      {
        course: tsCourse._id,
        title: 'Assignment 1: Build a Type-Safe Express Authentication Service',
        description: 'Implement a complete register/login workflow with JWT token generation and bcrypt password comparison. Submit your repository link or zip archive.',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        maxScore: 100,
      },
    ]);

    // 8. Showcase Videos
    await Video.create([
      {
        teacher: elena._id,
        title: 'Violin Bowing Masterclass: How to stop squeaking and get warm tone',
        description: 'Watch how micro-adjustments in finger pressure on the bow stick transform thin screechy sounds into deep, resonant cello-like warmth.',
        category: catMap.get('Music'),
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=600',
        durationSeconds: 145,
        likes: [david._id, sarah._id],
        saves: [david._id],
        views: 1240,
        relatedCourse: violinCourse._id,
        tags: ['Violin', 'ToneProduction', 'MusicTips'],
      },
      {
        teacher: marcus._id,
        title: 'TypeScript Generics Explained in 90 Seconds with Visual Diagrams',
        description: 'Generics are functions for your types. See how generic constraints and keyof operators eliminate duplicated code across your backend and frontend.',
        category: catMap.get('Programming'),
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600',
        durationSeconds: 90,
        likes: [david._id, alex._id],
        saves: [david._id, alex._id],
        views: 3120,
        relatedCourse: tsCourse._id,
        tags: ['TypeScript', 'CodingTips', 'WebDev'],
      },
      {
        teacher: priya._id,
        title: 'Contemporary Floorwork: Seamless Roll to Standing Transition',
        description: 'Learn the spiral momentum technique to glide from the floor into a standing balance without putting strain on your knees.',
        category: catMap.get('Dance'),
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
        durationSeconds: 110,
        likes: [sarah._id, alex._id],
        saves: [sarah._id],
        views: 2150,
        relatedCourse: danceCourse._id,
        tags: ['ContemporaryDance', 'Floorwork', 'MovementArt'],
      },
      {
        teacher: antonio._id,
        title: 'The Secret to Silky Egg Tagliatelle: Dough Hydration Breakdown',
        description: 'Watch the transformation from shaggy crumb to silky golden dough through traditional wooden bench kneading.',
        category: catMap.get('Cooking'),
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=600',
        durationSeconds: 135,
        likes: [sarah._id, david._id, alex._id],
        saves: [sarah._id],
        views: 4500,
        relatedCourse: pastaCourse._id,
        tags: ['HomemadePasta', 'ItalianFood', 'ChefSecrets'],
      },
    ]);

    // 9. Live Classes with Jitsi Meet Rooms
    const liveTime1 = new Date();
    liveTime1.setDate(liveTime1.getDate() + 2);
    liveTime1.setHours(18, 0, 0, 0);

    const liveTime2 = new Date();
    liveTime2.setDate(liveTime2.getDate() + 4);
    liveTime2.setHours(19, 30, 0, 0);

    const room1 = generateJitsiRoom('Violin Group Workshop', elena._id.toString());
    const room2 = generateJitsiRoom('FullStack Architecture QA', marcus._id.toString());

    await LiveClass.create([
      {
        teacher: elena._id,
        title: 'Interactive Violin Masterclass: Intonation & Vibrato Clinic',
        description: 'Live interactive session where students play short excerpts, receive personalized posture and tone feedback, and learn the physics of vibrato oscillation.',
        category: catMap.get('Music'),
        course: violinCourse._id,
        scheduledAt: liveTime1,
        durationMinutes: 75,
        price: 499,
        maxCapacity: 12,
        meetingRoomId: room1.roomName,
        meetingUrl: room1.meetingUrl,
        status: 'scheduled',
        enrolledLearners: [
          { learner: david._id, enrolledAt: new Date() },
        ],
      },
      {
        teacher: marcus._id,
        title: 'Live Architecture Code Review & Q&A: Enterprise TypeScript',
        description: 'Bring your code or system design questions! We will review real repository architectures, refactor tricky type definitions, and discuss production deployment strategies.',
        category: catMap.get('Programming'),
        course: tsCourse._id,
        scheduledAt: liveTime2,
        durationMinutes: 90,
        price: 599,
        maxCapacity: 25,
        meetingRoomId: room2.roomName,
        meetingUrl: room2.meetingUrl,
        status: 'scheduled',
        enrolledLearners: [
          { learner: david._id, enrolledAt: new Date() },
          { learner: alex._id, enrolledAt: new Date() },
        ],
      },
    ]);

    // 10. Enrollments, Progress, Payments, Bookings
    const payment1 = await Payment.create({
      user: david._id,
      orderId: 'order_seed_001_violin',
      paymentId: 'pay_seed_violin_123',
      signature: 'seed_verified_signature',
      amount: 1499,
      currency: 'INR',
      status: 'paid',
      itemType: 'course',
      itemId: violinCourse._id,
      receipt: 'rcpt_seed_001',
    });

    const booking1 = await Booking.create({
      learner: david._id,
      teacher: elena._id,
      course: violinCourse._id,
      type: 'course_enrollment',
      status: 'confirmed',
      amount: 1499,
      payment: payment1._id,
      notes: 'Full course enrollment',
    });

    await Enrollment.create({
      learner: david._id,
      course: violinCourse._id,
      booking: booking1._id,
      status: 'active',
      enrolledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    // David's progress on violin course: completed lesson 1
    const violinLessons = await Lesson.find({ course: violinCourse._id }).sort({ orderIndex: 1 });
    await Progress.create({
      learner: david._id,
      course: violinCourse._id,
      completedLessons: [violinLessons[0]._id],
      progressPercentage: 33,
      lastWatchedLesson: violinLessons[0]._id,
      isCompleted: false,
    });

    // Sarah enrolled in Italian Pasta course
    const payment2 = await Payment.create({
      user: sarah._id,
      orderId: 'order_seed_002_pasta',
      paymentId: 'pay_seed_pasta_456',
      signature: 'seed_verified_signature',
      amount: 899,
      currency: 'INR',
      status: 'paid',
      itemType: 'course',
      itemId: pastaCourse._id,
      receipt: 'rcpt_seed_002',
    });

    const booking2 = await Booking.create({
      learner: sarah._id,
      teacher: antonio._id,
      course: pastaCourse._id,
      type: 'course_enrollment',
      status: 'confirmed',
      amount: 899,
      payment: payment2._id,
    });

    await Enrollment.create({
      learner: sarah._id,
      course: pastaCourse._id,
      booking: booking2._id,
      status: 'active',
      enrolledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await Progress.create({
      learner: sarah._id,
      course: pastaCourse._id,
      completedLessons: [],
      progressPercentage: 0,
      isCompleted: false,
    });

    // 11. Verified Reviews
    await Review.create([
      {
        user: david._id,
        course: violinCourse._id,
        teacher: elena._id,
        rating: 5,
        comment: 'Elena is an exceptional teacher. The lesson on bowing angles completely transformed my sound in just two practice sessions. The feedback during live sessions is invaluable!',
        isVerifiedLearner: true,
      },
      {
        user: sarah._id,
        course: pastaCourse._id,
        teacher: antonio._id,
        rating: 5,
        comment: 'Best culinary course I have ever taken! The explanation of dough hydration and resting time answered questions I had struggled with for months. My family loved the tagliatelle!',
        isVerifiedLearner: true,
      },
    ]);

    // 12. Notifications
    await Notification.create([
      {
        recipient: david._id,
        title: 'Upcoming Live Violin Class 🎻',
        message: 'Reminder: Interactive Violin Masterclass is scheduled in 2 days at 6:00 PM.',
        type: 'live_class',
        link: '/dashboard/learner',
        isRead: false,
      },
      {
        recipient: elena._id,
        title: 'New Student Enrollment! 💰',
        message: 'David Miller enrolled in your course "Mastering the Violin". You earned ₹1,274!',
        type: 'booking',
        link: '/dashboard/teacher',
        isRead: true,
      },
    ]);

    console.log('[Seed] Database successfully populated with realistic platform data!');
    process.exit(0);
  } catch (error: any) {
    console.error('[Seed] Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();

