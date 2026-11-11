import bcrypt from 'bcryptjs';

// In-Memory store for when external MongoDB service is not running
class LocalStore {
  public users: any[] = [];
  public teacherProfiles: any[] = [];
  public learnerProfiles: any[] = [];
  public categories: any[] = [];
  public courses: any[] = [];
  public lessons: any[] = [];
  public videos: any[] = [];
  public liveClasses: any[] = [];
  public bookings: any[] = [];
  public payments: any[] = [];
  public enrollments: any[] = [];
  public progress: any[] = [];
  public reviews: any[] = [];
  public quizzes: any[] = [];
  public assignments: any[] = [];
  public subscriptions: any[] = [];
  public notifications: any[] = [];
  public reports: any[] = [];

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults() {
    const passwordHash = bcrypt.hashSync('password123', 10);
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);

    // Categories
    this.categories = [
      { _id: 'cat_music', name: 'Music', slug: 'music', description: 'Master instruments, vocals, music production, and sound design.', icon: 'Music', featured: true, order: 1, courseCount: 1, teacherCount: 1 },
      { _id: 'cat_dance', name: 'Dance', slug: 'dance', description: 'Contemporary, hip-hop, classical, and cultural dance styles.', icon: 'Activity', featured: true, order: 2, courseCount: 1, teacherCount: 1 },
      { _id: 'cat_prog', name: 'Programming', slug: 'programming', description: 'Full-stack web development, Python, mobile apps, and machine learning.', icon: 'Code', featured: true, order: 3, courseCount: 1, teacherCount: 1 },
      { _id: 'cat_photo', name: 'Photography', slug: 'photography', description: 'Portrait, landscape, camera gear mastery, and Adobe Lightroom editing.', icon: 'Camera', featured: true, order: 4, courseCount: 0, teacherCount: 0 },
      { _id: 'cat_art', name: 'Drawing and Painting', slug: 'drawing-and-painting', description: 'Watercolor, oil painting, digital sketching, and character art.', icon: 'Palette', featured: true, order: 5, courseCount: 0, teacherCount: 0 },
      { _id: 'cat_cook', name: 'Cooking', slug: 'cooking', description: 'Artisanal culinary techniques, baking, international cuisine, and plating.', icon: 'Utensils', featured: true, order: 6, courseCount: 1, teacherCount: 1 },
      { _id: 'cat_fit', name: 'Fitness', slug: 'fitness', description: 'Yoga, HIIT conditioning, calisthenics, and breathwork mastery.', icon: 'Flame', featured: true, order: 7, courseCount: 0, teacherCount: 0 },
      { _id: 'cat_lang', name: 'Language Learning', slug: 'language-learning', description: 'Conversational fluency in Spanish, Japanese, French, and Mandarin.', icon: 'Globe', featured: true, order: 8, courseCount: 0, teacherCount: 0 },
      { _id: 'cat_craft', name: 'Arts and Crafts', slug: 'arts-and-crafts', description: 'Pottery, woodworking, resin craft, and handmade jewelry design.', icon: 'Scissors', featured: true, order: 9, courseCount: 0, teacherCount: 0 },
    ];

    // Users
    this.users = [
      {
        _id: 'usr_admin',
        id: 'usr_admin',
        name: 'SkillSync Admin',
        email: 'admin@skillsync.com',
        password: adminPasswordHash,
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        role: 'admin',
        isEmailVerified: true,
        bio: 'SkillSync Platform Administrator & Moderator',
        createdAt: new Date('2026-01-01'),
      },
      {
        _id: 'usr_elena',
        id: 'usr_elena',
        name: 'Elena Rostova',
        email: 'elena.violin@skillsync.com',
        password: passwordHash,
        phone: '+91 98111 22334',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
        role: 'teacher',
        isEmailVerified: true,
        bio: 'Concert Violinist & Master Music Educator with over 12 years of performance and orchestra experience.',
        createdAt: new Date('2026-01-10'),
      },
      {
        _id: 'usr_marcus',
        id: 'usr_marcus',
        name: 'Marcus Chen',
        email: 'marcus.code@skillsync.com',
        password: passwordHash,
        phone: '+91 98222 33445',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        role: 'teacher',
        isEmailVerified: true,
        bio: 'Senior Full-Stack Engineer specializing in React, Node.js, TypeScript, and AI integrations.',
        createdAt: new Date('2026-01-12'),
      },
      {
        _id: 'usr_priya',
        id: 'usr_priya',
        name: 'Priya Sharma',
        email: 'priya.dance@skillsync.com',
        password: passwordHash,
        phone: '+91 98333 44556',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
        role: 'teacher',
        isEmailVerified: true,
        bio: 'Professional contemporary dancer, choreographer, and certified Kathak instructor.',
        createdAt: new Date('2026-01-15'),
      },
      {
        _id: 'usr_antonio',
        id: 'usr_antonio',
        name: 'Chef Antonio Ricci',
        email: 'antonio.chef@skillsync.com',
        password: passwordHash,
        phone: '+91 98444 55667',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
        role: 'teacher',
        isEmailVerified: true,
        bio: 'Artisan Pasta Chef and Baker trained in Florence with a passion for authentic Mediterranean flavors.',
        createdAt: new Date('2026-01-18'),
      },
      {
        _id: 'usr_david',
        id: 'usr_david',
        name: 'David Miller',
        email: 'david@example.com',
        password: passwordHash,
        phone: '+91 98555 66778',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
        role: 'learner',
        isEmailVerified: true,
        bio: 'Software developer and aspiring violinist eager to learn musical theory and practice.',
        createdAt: new Date('2026-02-01'),
      },
      {
        _id: 'usr_priya_learner',
        id: 'usr_priya_learner',
        name: 'Priya Sharma (Learner)',
        email: 'priya.learner@skillsync.com',
        password: passwordHash,
        phone: '+91 98999 11223',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        role: 'learner',
        isEmailVerified: true,
        bio: 'Design student learning coding and music production.',
        createdAt: new Date('2026-02-05'),
      },
      {
        _id: 'usr_learner',
        id: 'usr_learner',
        name: 'Demo Learner',
        email: 'learner@skillsync.com',
        password: passwordHash,
        phone: '+91 98777 66554',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
        role: 'learner',
        isEmailVerified: true,
        bio: 'Skill enthusiast exploring creative arts and culinary techniques.',
        createdAt: new Date('2026-02-05'),
      },
    ];

    // Teacher Profiles
    this.teacherProfiles = [
      {
        _id: 'tp_elena',
        user: this.users[1],
        title: 'Master Classical Violinist & Soloist',
        bio: 'Elena is a Juilliard-trained concert violinist who has performed with prestigious European philharmonics. She specializes in making violin technique intuitive and expressive for all levels.',
        skills: ['Violin Technique', 'Bowing Mastery', 'Music Theory', 'Ear Training'],
        categories: [this.categories[0]],
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
        _id: 'tp_marcus',
        user: this.users[2],
        title: 'Staff Software Architect & Full-Stack Mentor',
        bio: 'Marcus has built scalable distributed architectures and helped hundreds of students transition into high-paying software engineering roles.',
        skills: ['React 18', 'TypeScript', 'Node.js', 'System Design', 'MongoDB'],
        categories: [this.categories[2]],
        experienceYears: 9,
        qualifications: ['BS Computer Science - UC Berkeley', 'AWS Certified Solutions Architect'],
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
        _id: 'tp_priya',
        user: this.users[3],
        title: 'Choreographer & Contemporary Dance Artist',
        bio: 'Priya blends classical discipline with fluid contemporary movement. Her sessions focus on posture, rhythmic musicality, spatial awareness, and emotive choreography.',
        skills: ['Contemporary Dance', 'Kathak', 'Flexibility Training', 'Stage Choreography'],
        categories: [this.categories[1]],
        experienceYears: 7,
        qualifications: ['National Diploma in Performing Arts', 'Certified Movement Therapist'],
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
        _id: 'tp_antonio',
        user: this.users[4],
        title: 'Italian Master Chef & Artisanal Pasta Maker',
        bio: 'Chef Antonio brings the heart of Tuscan kitchens directly to your home. Learn the exact science of handmade egg pasta and authentic regional sauces.',
        skills: ['Handmade Pasta', 'Sourdough Baking', 'Italian Sauces', 'Wine Pairing'],
        categories: [this.categories[5]],
        experienceYears: 15,
        qualifications: ['Culinary Arts Diploma - Florence Culinary Institute'],
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
    ];

    // Courses
    this.courses = [
      {
        _id: 'crs_violin',
        id: 'crs_violin',
        teacher: this.users[1],
        title: 'Mastering the Violin: From First Note to Expressive Vibrato',
        slug: 'mastering-the-violin',
        description: 'A comprehensive, step-by-step masterclass designed to take you from basic posture and bowing techniques to rich tone production, smooth shifting, and expressive vibrato.',
        category: this.categories[0],
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
        ],
        status: 'published',
        isApproved: true,
        rating: 4.9,
        numReviews: 18,
        enrolledCount: 64,
        lessonsCount: 3,
        tags: ['Violin', 'Classical Music', 'Strings'],
        createdAt: new Date('2026-02-01'),
      },
      {
        _id: 'crs_ts',
        id: 'crs_ts',
        teacher: this.users[2],
        title: 'Production Full-Stack TypeScript with React 18 & Node.js',
        slug: 'production-fullstack-typescript',
        description: 'Build robust, scalable, enterprise-grade full-stack web applications. Learn end-to-end type safety, modern React state architecture, clean Express REST API patterns, and JWT authentication.',
        category: this.categories[2],
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=700',
        price: 1999,
        durationMinutes: 480,
        difficulty: 'intermediate',
        requirements: ['Basic understanding of HTML, CSS, and modern JavaScript (ES6+)', 'Node.js and VS Code installed'],
        whatYouWillLearn: [
          'Master TypeScript generics, utility types, and strict mode',
          'Build responsive UI interfaces with Tailwind CSS and Lucide React',
          'Design resilient Express micro-architectures with Mongoose',
          'Implement secure JWT authentication and role guards',
        ],
        status: 'published',
        isApproved: true,
        rating: 5.0,
        numReviews: 29,
        enrolledCount: 112,
        lessonsCount: 3,
        tags: ['TypeScript', 'React', 'Node.js', 'Full-Stack'],
        createdAt: new Date('2026-02-05'),
      },
      {
        _id: 'crs_dance',
        id: 'crs_dance',
        teacher: this.users[3],
        title: 'Contemporary Dance Foundations: Flow, Floorwork & Expression',
        slug: 'contemporary-dance-foundations',
        description: 'Unlock your bodys natural expressive capacity. Learn grounding techniques, release mechanics, fluid floor transitions, and musical rhythm alignment.',
        category: this.categories[1],
        thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=700',
        price: 999,
        durationMinutes: 180,
        difficulty: 'all_levels',
        requirements: ['Comfortable athletic or dance wear', 'Open floor space with smooth flooring'],
        whatYouWillLearn: [
          'Core stability and spine articulation',
          'Safe and fluid contemporary floor transitions',
          'Dynamic weight shifts and balance recovery',
        ],
        status: 'published',
        isApproved: true,
        rating: 4.8,
        numReviews: 14,
        enrolledCount: 48,
        lessonsCount: 2,
        tags: ['Dance', 'Contemporary', 'Movement'],
        createdAt: new Date('2026-02-10'),
      },
      {
        _id: 'crs_pasta',
        id: 'crs_pasta',
        teacher: this.users[4],
        title: 'Authentic Italian Pasta Mastery: From Scratch to Table',
        slug: 'authentic-italian-pasta-mastery',
        description: 'Discover the heritage of traditional Italian pasta making. Knead silky egg dough, shape garganelli, tagliatelle, ravioli, and simmer classic regional sauces with perfection.',
        category: this.categories[5],
        thumbnail: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=700',
        price: 899,
        durationMinutes: 150,
        difficulty: 'beginner',
        requirements: ['Italian 00 flour and semolina', 'Fresh eggs and olive oil', 'Rolling pin'],
        whatYouWillLearn: [
          'The golden ratio of egg yolks to flour for perfect elasticity',
          'Hand-rolling and cutting tagliatelle and pappardelle',
          'Crafting stuffed ravioli and tortellini without leaks',
        ],
        status: 'published',
        isApproved: true,
        rating: 4.95,
        numReviews: 22,
        enrolledCount: 75,
        lessonsCount: 2,
        tags: ['Cooking', 'Pasta', 'Italian'],
        createdAt: new Date('2026-02-12'),
      },
    ];

    // Lessons
    this.lessons = [
      {
        _id: 'lsn_violin_1',
        course: 'crs_violin',
        title: 'Lesson 1: Anatomy of the Violin, Tuning & Ergonomic Posture',
        description: 'Introduction to violin components, shoulder rest adjustment, bow tightening, and fine tuner usage.',
        orderIndex: 0,
        durationMinutes: 25,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=600',
        content: '# Getting Started with the Violin\n\nEnsure your bow hair has a pencil-width tension. Apply rosin evenly in 5-6 full strokes.',
        isFreePreview: true,
        materials: [{ title: 'Beginner Violin Fingering Chart.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf' }],
      },
      {
        _id: 'lsn_violin_2',
        course: 'crs_violin',
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
        _id: 'lsn_ts_1',
        course: 'crs_ts',
        title: 'Lesson 1: Modern TypeScript Architecture & Strict Configuration',
        description: 'Set up tsconfig with strict flags, NodeNext module resolution, and project references.',
        orderIndex: 0,
        durationMinutes: 30,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
        content: '# TypeScript 5.4 Best Practices\n\nAlways enable strict: true and noUncheckedIndexedAccess.',
        isFreePreview: true,
        materials: [{ title: 'Full-Stack Architecture Cheat Sheet.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf' }],
      },
    ];

    // Quizzes & Assignments
    this.quizzes = [
      {
        _id: 'qz_violin_1',
        course: 'crs_violin',
        title: 'Violin Fundamentals Knowledge Check',
        passingScore: 70,
        questions: [
          {
            question: 'What are the four strings of a standard violin from lowest pitch to highest?',
            options: ['E - A - D - G', 'G - D - A - E', 'C - G - D - A', 'A - D - G - C'],
            correctAnswerIndex: 1,
          },
          {
            question: 'Where should the bow contact the string for optimal tone?',
            options: ['Directly over the fingerboard', 'Halfway between the bridge and fingerboard', 'On the tailpiece', 'On the wooden bridge'],
            correctAnswerIndex: 1,
          },
        ],
      },
    ];

    this.assignments = [
      {
        _id: 'asg_violin_1',
        course: 'crs_violin',
        title: 'Assignment 1: Two-Octave G Major Scale Recording',
        description: 'Record a 60-second audio or video of yourself playing the G Major scale slowly with consistent bow speed.',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        maxScore: 100,
      },
    ];

    // Videos Showcase Reels
    this.videos = [
      {
        _id: 'vid_1',
        teacher: this.users[1],
        title: 'Violin Bowing Masterclass: How to stop squeaking and get warm tone',
        description: 'Watch how micro-adjustments in finger pressure on the bow stick transform thin screechy sounds into deep warmth.',
        category: this.categories[0],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=600',
        durationSeconds: 145,
        likes: ['usr_david'],
        likesCount: 12,
        views: 1240,
        relatedCourse: this.courses[0],
        tags: ['Violin', 'ToneProduction', 'MusicTips'],
        createdAt: new Date(),
      },
      {
        _id: 'vid_2',
        teacher: this.users[2],
        title: 'TypeScript Generics Explained in 90 Seconds with Visual Diagrams',
        description: 'Generics are functions for your types. See how generic constraints eliminate duplicated code.',
        category: this.categories[2],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600',
        durationSeconds: 90,
        likes: ['usr_david'],
        likesCount: 28,
        views: 3120,
        relatedCourse: this.courses[1],
        tags: ['TypeScript', 'CodingTips', 'WebDev'],
        createdAt: new Date(),
      },
      {
        _id: 'vid_3',
        teacher: this.users[3],
        title: 'Contemporary Floorwork: Seamless Roll to Standing Transition',
        description: 'Learn the spiral momentum technique to glide from the floor into a standing balance without strain.',
        category: this.categories[1],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
        durationSeconds: 110,
        likes: ['usr_david'],
        likesCount: 19,
        views: 2150,
        relatedCourse: this.courses[2],
        tags: ['ContemporaryDance', 'Floorwork'],
        createdAt: new Date(),
      },
      {
        _id: 'vid_4',
        teacher: this.users[4],
        title: 'The Secret to Silky Egg Tagliatelle: Dough Hydration Breakdown',
        description: 'Watch the transformation from shaggy crumb to silky golden dough through traditional kneading.',
        category: this.categories[5],
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=600',
        durationSeconds: 135,
        likes: ['usr_david'],
        likesCount: 42,
        views: 4500,
        relatedCourse: this.courses[3],
        tags: ['HomemadePasta', 'ItalianFood'],
        createdAt: new Date(),
      },
    ];

    // Live Classes
    const liveTime1 = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const liveTime2 = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

    this.liveClasses = [
      {
        _id: 'live_violin',
        teacher: this.users[1],
        title: 'Interactive Violin Masterclass: Intonation & Vibrato Clinic',
        description: 'Live interactive session where students play short excerpts, receive personalized posture feedback, and learn vibrato.',
        category: this.categories[0],
        scheduledAt: liveTime1,
        durationMinutes: 75,
        price: 499,
        maxCapacity: 12,
        meetingRoomId: 'SkillSync_ViolinClinic_LiveRoom',
        meetingUrl: 'https://meet.jit.si/SkillSync_ViolinClinic_LiveRoom',
        status: 'scheduled',
        enrolledLearners: [{ learner: this.users[5], enrolledAt: new Date() }],
      },
      {
        _id: 'live_ts',
        teacher: this.users[2],
        title: 'Live Architecture Code Review & Q&A: Enterprise TypeScript',
        description: 'Bring your code or system design questions! We will review repository architectures and refactor tricky type definitions.',
        category: this.categories[2],
        scheduledAt: liveTime2,
        durationMinutes: 90,
        price: 599,
        maxCapacity: 25,
        meetingRoomId: 'SkillSync_TypeScriptQA_LiveRoom',
        meetingUrl: 'https://meet.jit.si/SkillSync_TypeScriptQA_LiveRoom',
        status: 'scheduled',
        enrolledLearners: [{ learner: this.users[5], enrolledAt: new Date() }],
      },
    ];

    // Enrollments
    this.enrollments = [
      {
        _id: 'enr_1',
        learner: this.users[5],
        course: this.courses[0],
        status: 'active',
        enrolledAt: new Date('2026-02-01'),
      },
    ];

    // Progress
    this.progress = [
      {
        _id: 'prg_1',
        learner: 'usr_david',
        course: 'crs_violin',
        completedLessons: ['lsn_violin_1'],
        progressPercentage: 33,
        lastWatchedLesson: 'lsn_violin_1',
        isCompleted: false,
      },
    ];

    // Reviews
    this.reviews = [
      {
        _id: 'rev_1',
        user: this.users[5],
        course: 'crs_violin',
        teacher: 'usr_elena',
        rating: 5,
        comment: 'Elena is an exceptional teacher. The lesson on bowing angles completely transformed my sound in just two practice sessions!',
        isVerifiedLearner: true,
        createdAt: new Date('2026-02-04'),
      },
    ];

    // Bookings
    this.bookings = [
      {
        _id: 'bk_1',
        learner: this.users[5],
        teacher: this.users[1],
        course: this.courses[0],
        type: 'course_enrollment',
        status: 'confirmed',
        amount: 1499,
        createdAt: new Date('2026-02-01'),
      },
    ];

    // Payments
    this.payments = [
      {
        _id: 'pay_1',
        user: this.users[5],
        orderId: 'order_violin_001',
        paymentId: 'pay_razor_violin_001',
        amount: 1499,
        currency: 'INR',
        status: 'paid',
        itemType: 'course',
        receipt: 'rcpt_violin_001',
        createdAt: new Date('2026-02-01'),
      },
    ];

    // Notifications
    this.notifications = [
      {
        _id: 'notif_1',
        recipient: 'usr_david',
        title: 'Upcoming Live Violin Class 🎻',
        message: 'Reminder: Interactive Violin Masterclass is scheduled in 2 days.',
        type: 'live_class',
        link: '/live',
        isRead: false,
        createdAt: new Date(),
      },
    ];

    // Learner Profiles
    this.learnerProfiles = [
      {
        _id: 'lp_david',
        user: this.users[5],
        savedCourses: ['crs_violin'],
        savedTeachers: ['usr_elena'],
        savedVideos: ['vid_violin_showcase'],
      },
      {
        _id: 'lp_priya_learner',
        user: this.users[6],
        savedCourses: ['crs_violin'],
        savedTeachers: ['usr_elena'],
        savedVideos: ['vid_violin_showcase'],
      },
      {
        _id: 'lp_learner',
        user: this.users[7],
        savedCourses: ['crs_violin'],
        savedTeachers: ['usr_elena'],
        savedVideos: ['vid_violin_showcase'],
      },
    ];
  }
}

export const localStore = new LocalStore();
export default localStore;

