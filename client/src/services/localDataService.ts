// Centralized Frontend Persistent Data Service for SkillSync
// Automatically seeds initial state if not found in localStorage.
// All modifications (course creation, bookings, reviews, profile edits, progress) are persisted across page refreshes.

const STORAGE_KEY = 'skillsync_db_v1';

export interface LocalDatabase {
  users: any[];
  teacherProfiles: any[];
  learnerProfiles: any[];
  categories: any[];
  courses: any[];
  lessons: any[];
  videos: any[];
  liveClasses: any[];
  bookings: any[];
  payments: any[];
  enrollments: any[];
  progress: any[];
  reviews: any[];
  quizzes: any[];
  assignments: any[];
  subscriptions: any[];
  notifications: any[];
  reports: any[];
}

const getDefaultDatabase = (): LocalDatabase => {
  const categories = [
    { _id: 'cat_music', id: 'cat_music', name: 'Music', slug: 'music', description: 'Master instruments, vocals, music production, and sound design.', icon: 'Music', featured: true, order: 1, courseCount: 1, teacherCount: 1 },
    { _id: 'cat_dance', id: 'cat_dance', name: 'Dance', slug: 'dance', description: 'Contemporary, hip-hop, classical, and cultural dance styles.', icon: 'Activity', featured: true, order: 2, courseCount: 1, teacherCount: 1 },
    { _id: 'cat_prog', id: 'cat_prog', name: 'Programming', slug: 'programming', description: 'Full-stack web development, Python, mobile apps, and machine learning.', icon: 'Code', featured: true, order: 3, courseCount: 1, teacherCount: 1 },
    { _id: 'cat_photo', id: 'cat_photo', name: 'Photography', slug: 'photography', description: 'Portrait, landscape, camera gear mastery, and Adobe Lightroom editing.', icon: 'Camera', featured: true, order: 4, courseCount: 0, teacherCount: 0 },
    { _id: 'cat_art', id: 'cat_art', name: 'Drawing and Painting', slug: 'drawing-and-painting', description: 'Watercolor, oil painting, digital sketching, and character art.', icon: 'Palette', featured: true, order: 5, courseCount: 0, teacherCount: 0 },
    { _id: 'cat_cook', id: 'cat_cook', name: 'Cooking', slug: 'cooking', description: 'Artisanal culinary techniques, baking, international cuisine, and plating.', icon: 'Utensils', featured: true, order: 6, courseCount: 1, teacherCount: 1 },
    { _id: 'cat_fit', id: 'cat_fit', name: 'Fitness', slug: 'fitness', description: 'Yoga, HIIT conditioning, calisthenics, and breathwork mastery.', icon: 'Flame', featured: true, order: 7, courseCount: 0, teacherCount: 0 },
    { _id: 'cat_lang', id: 'cat_lang', name: 'Language Learning', slug: 'language-learning', description: 'Conversational fluency in Spanish, Japanese, French, and Mandarin.', icon: 'Globe', featured: true, order: 8, courseCount: 0, teacherCount: 0 },
    { _id: 'cat_craft', id: 'cat_craft', name: 'Arts and Crafts', slug: 'arts-and-crafts', description: 'Pottery, woodworking, resin craft, and handmade jewelry design.', icon: 'Scissors', featured: true, order: 9, courseCount: 0, teacherCount: 0 },
  ];

  const users = [
    {
      _id: 'usr_admin',
      id: 'usr_admin',
      name: 'SkillSync Admin',
      email: 'admin@skillsync.com',
      password: 'admin123',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      role: 'admin',
      isEmailVerified: true,
      bio: 'SkillSync Platform Administrator & Moderator',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      _id: 'usr_elena',
      id: 'usr_elena',
      name: 'Elena Rostova',
      email: 'elena.violin@skillsync.com',
      password: 'password123',
      phone: '+91 98111 22334',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
      role: 'teacher',
      isEmailVerified: true,
      bio: 'Concert Violinist & Master Music Educator with over 12 years of performance and orchestra experience.',
      createdAt: '2026-01-10T00:00:00.000Z',
    },
    {
      _id: 'usr_marcus',
      id: 'usr_marcus',
      name: 'Marcus Chen',
      email: 'marcus.code@skillsync.com',
      password: 'password123',
      phone: '+91 98222 33445',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      role: 'teacher',
      isEmailVerified: true,
      bio: 'Senior Software Engineer with 9+ years building high-throughput cloud microservices and web apps.',
      createdAt: '2026-01-12T00:00:00.000Z',
    },
    {
      _id: 'usr_priya_teacher',
      id: 'usr_priya_teacher',
      name: 'Priya Sharma (Dance)',
      email: 'priya.dance@skillsync.com',
      password: 'password123',
      phone: '+91 98333 44556',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
      role: 'teacher',
      isEmailVerified: true,
      bio: 'Professional contemporary dancer, choreographer, and certified Kathak instructor.',
      createdAt: '2026-01-15T00:00:00.000Z',
    },
    {
      _id: 'usr_antonio',
      id: 'usr_antonio',
      name: 'Chef Antonio Ricci',
      email: 'antonio.chef@skillsync.com',
      password: 'password123',
      phone: '+91 98444 55667',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      role: 'teacher',
      isEmailVerified: true,
      bio: 'Artisan Pasta Chef and Baker trained in Florence with a passion for authentic Mediterranean flavors.',
      createdAt: '2026-01-18T00:00:00.000Z',
    },
    {
      _id: 'usr_david',
      id: 'usr_david',
      name: 'David Miller',
      email: 'david@example.com',
      password: 'password123',
      phone: '+91 98555 66778',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
      role: 'learner',
      isEmailVerified: true,
      bio: 'Software developer and aspiring violinist eager to learn musical theory and practice.',
      createdAt: '2026-02-01T00:00:00.000Z',
    },
    {
      _id: 'usr_priya_learner',
      id: 'usr_priya_learner',
      name: 'Priya Sharma (Learner)',
      email: 'priya.learner@skillsync.com',
      password: 'password123',
      phone: '+91 98999 11223',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      role: 'learner',
      isEmailVerified: true,
      bio: 'Design student learning coding and music production.',
      createdAt: '2026-02-05T00:00:00.000Z',
    },
    {
      _id: 'usr_learner',
      id: 'usr_learner',
      name: 'Demo Learner',
      email: 'learner@skillsync.com',
      password: 'password123',
      phone: '+91 98777 66554',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
      role: 'learner',
      isEmailVerified: true,
      bio: 'Skill enthusiast exploring creative arts and culinary techniques.',
      createdAt: '2026-02-05T00:00:00.000Z',
    },
  ];

  const teacherProfiles = [
    {
      _id: 'tp_elena',
      id: 'tp_elena',
      user: users[1],
      title: 'Master Classical Violinist & Soloist',
      bio: 'Elena is a Juilliard-trained concert violinist who has performed with prestigious European philharmonics. She specializes in making violin technique intuitive and expressive for all levels.',
      skills: ['Violin Technique', 'Bowing Mastery', 'Music Theory', 'Ear Training'],
      categories: [categories[0]],
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
      id: 'tp_marcus',
      user: users[2],
      title: 'Staff Software Architect & Full-Stack Mentor',
      bio: 'Marcus has built scalable distributed architectures and helped hundreds of students transition into high-paying software engineering roles.',
      skills: ['React 18', 'TypeScript', 'Node.js', 'System Design', 'MongoDB'],
      categories: [categories[2]],
      experienceYears: 9,
      qualifications: ['BS Computer Science - UC Berkeley', 'AWS Certified Solutions Architect'],
      introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      languages: ['English', 'Mandarin'],
      hourlyRate: 1500,
      rating: 4.95,
      numReviews: 38,
      verificationStatus: 'verified',
      subscriptionTier: 'pro',
      featured: true,
      totalEarnings: 128000,
      totalStudentsCount: 210,
    },
    {
      _id: 'tp_priya',
      id: 'tp_priya',
      user: users[3],
      title: 'Choreographer & Expressive Dance Educator',
      bio: 'Priya blends classical discipline with fluid contemporary movement. Her classes emphasize body awareness, rhythmic precision, and authentic storytelling.',
      skills: ['Contemporary Dance', 'Kathak Classical', 'Improvisation', 'Stage Choreography'],
      categories: [categories[1]],
      experienceYears: 7,
      qualifications: ['BFA in Dance & Theatre - National Institute of Dance', 'Certified Yoga Instructor RYT-500'],
      introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      languages: ['English', 'Hindi'],
      hourlyRate: 900,
      rating: 4.88,
      numReviews: 19,
      verificationStatus: 'verified',
      subscriptionTier: 'premium',
      featured: true,
      totalEarnings: 45000,
      totalStudentsCount: 95,
    },
    {
      _id: 'tp_antonio',
      id: 'tp_antonio',
      user: users[4],
      title: 'Master Pasta Artisan & Mediterranean Chef',
      bio: 'Chef Antonio brings the warmth and authenticity of traditional Italian cooking straight into your kitchen. Learn pasta from scratch with zero complicated gear.',
      skills: ['Fresh Hand-rolled Pasta', 'Sourdough Bread', 'Classic Sauces', 'Wine Pairing'],
      categories: [categories[5]],
      experienceYears: 14,
      qualifications: ['Accademia Italiana della Cucina Diploma', 'Head Chef Trattoria della Spiga (Florence)'],
      introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      languages: ['English', 'Italian'],
      hourlyRate: 1100,
      rating: 4.92,
      numReviews: 42,
      verificationStatus: 'verified',
      subscriptionTier: 'premium',
      featured: true,
      totalEarnings: 92000,
      totalStudentsCount: 180,
    },
  ];

  const courses = [
    {
      _id: 'crs_violin',
      id: 'crs_violin',
      title: 'Mastering the Violin: From First Note to Expressive Vibrato',
      slug: 'mastering-the-violin-from-first-note-to-expressive-vibrato',
      description: 'A comprehensive, step-by-step masterclass on violin posture, intonation, bowing dynamics, and emotional phrasing. Includes daily guided exercises.',
      category: categories[0],
      teacher: users[1],
      thumbnail: 'https://images.unsplash.com/photo-1520523839898-50712825d3a3?auto=format&fit=crop&q=80&w=600',
      promoVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      price: 1499,
      durationMinutes: 180,
      difficulty: 'beginner',
      lessonsCount: 2,
      enrolledCount: 142,
      rating: 4.9,
      numReviews: 24,
      requirements: ['A standard 4/4 or 3/4 violin', 'Shoulder rest and rosin', 'Dedication to practice 20 mins a day'],
      whatYouWillLearn: [
        'Proper violin posture without neck or shoulder strain',
        'Straight bow tracking and smooth string crossings',
        'Accurate finger placement and pitch intonation',
        'Warm, consistent vibrato technique',
      ],
      tags: ['Violin', 'Classical Music', 'Instruments', 'String'],
      status: 'published',
      isApproved: true,
      createdAt: '2026-01-20T00:00:00.000Z',
    },
    {
      _id: 'crs_react',
      id: 'crs_react',
      title: 'Modern Full-Stack Development with React 18, Node.js & TypeScript',
      slug: 'modern-full-stack-development-with-react-18-nodejs-typescript',
      description: 'Build robust, production-grade applications with modern React patterns, clean REST APIs, JWT authentication, and high-performance Tailwind styling.',
      category: categories[2],
      teacher: users[2],
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600',
      promoVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      price: 2499,
      durationMinutes: 320,
      difficulty: 'intermediate',
      lessonsCount: 3,
      enrolledCount: 210,
      rating: 4.95,
      numReviews: 38,
      requirements: ['Basic understanding of JavaScript and HTML', 'Node.js installed locally', 'VS Code or preferred editor'],
      whatYouWillLearn: [
        'Component architecture and custom hooks',
        'End-to-end TypeScript type safety',
        'State management and performance optimization',
        'RESTful API architecture with Express & Mongoose',
      ],
      tags: ['React', 'TypeScript', 'Node.js', 'Web Development'],
      status: 'published',
      isApproved: true,
      createdAt: '2026-01-22T00:00:00.000Z',
    },
    {
      _id: 'crs_dance',
      id: 'crs_dance',
      title: 'Contemporary Flow: Floorwork, Turns and Emotional Phrasing',
      slug: 'contemporary-flow-floorwork-turns-and-emotional-phrasing',
      description: 'Connect movement with emotion. Explore graceful transitions to the floor, dynamic suspensions, and choreographic storytelling.',
      category: categories[1],
      teacher: users[3],
      thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
      promoVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      price: 999,
      durationMinutes: 120,
      difficulty: 'all',
      lessonsCount: 2,
      enrolledCount: 95,
      rating: 4.88,
      numReviews: 19,
      requirements: ['Comfortable loose clothing', 'Clear floor space of at least 2x2 meters', 'Barefoot or dance socks'],
      whatYouWillLearn: [
        'Fluid spinal articulation and breath integration',
        'Pain-free floorwork rolls and recoveries',
        'Center-of-gravity balance during spins',
        'Musicality and narrative expression',
      ],
      tags: ['Dance', 'Contemporary', 'Choreography', 'Movement'],
      status: 'published',
      isApproved: true,
      createdAt: '2026-01-25T00:00:00.000Z',
    },
    {
      _id: 'crs_pasta',
      id: 'crs_pasta',
      title: 'The Art of Handmade Italian Pasta from Scratch',
      slug: 'the-art-of-handmade-italian-pasta-from-scratch',
      description: 'Master the timeless Italian tradition of egg pasta dough, shaping tagliatelle, tortellini, and crafting silky emulsion sauces.',
      category: categories[5],
      teacher: users[4],
      thumbnail: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=600',
      promoVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      price: 1299,
      durationMinutes: 150,
      difficulty: 'beginner',
      lessonsCount: 2,
      enrolledCount: 180,
      rating: 4.92,
      numReviews: 42,
      requirements: ['Tipo 00 flour and fresh eggs', 'Rolling pin or simple manual pasta machine', 'Sharp kitchen knife'],
      whatYouWillLearn: [
        'Dough hydration and kneading to perfect gluten development',
        'Hand rolling paper-thin sfoglia sheets',
        'Shaping ravioli, agnolotti, and tagliolini',
        'Emulsifying cacio e pepe and brown butter sage sauces',
      ],
      tags: ['Cooking', 'Italian Cuisine', 'Pasta', 'Culinary'],
      status: 'published',
      isApproved: true,
      createdAt: '2026-01-28T00:00:00.000Z',
    },
  ];

  const lessons = [
    {
      _id: 'lsn_violin_1',
      id: 'lsn_violin_1',
      course: 'crs_violin',
      title: 'Lesson 1: Posture, Shoulder Rest Ergonomics & Bow Grip',
      description: 'Discover the relaxed bow hold and balance point to prevent wrist fatigue and create effortless tone.',
      orderIndex: 0,
      durationMinutes: 25,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      isFreePreview: true,
      content: 'Key takeaway: Ensure your thumb remains softly curved opposite the middle finger on the frog.',
      materials: [{ title: 'Violin Bowing Daily Practice Chart (PDF)', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }],
      createdAt: '2026-01-21T00:00:00.000Z',
    },
    {
      _id: 'lsn_violin_2',
      id: 'lsn_violin_2',
      course: 'crs_violin',
      title: 'Lesson 2: First Position Fingerings and Pure Tone Intonation',
      description: 'Finger spacing for major scales on D and A strings, plus ear training cues to spot sharp or flat notes.',
      orderIndex: 1,
      durationMinutes: 35,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      isFreePreview: false,
      content: 'Focus on keeping your knuckles arched and finger tips dropping cleanly onto the fingerboard.',
      materials: [{ title: 'First Position Sheet Music & Finger Chart (PDF)', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }],
      createdAt: '2026-01-21T00:00:00.000Z',
    },
    {
      _id: 'lsn_react_1',
      id: 'lsn_react_1',
      course: 'crs_react',
      title: 'Lesson 1: Project Setup, Vite Config & Strict TypeScript',
      description: 'Bootstrap a lightning-fast React 18 architecture with strict TS compiler options and Tailwind CSS.',
      orderIndex: 0,
      durationMinutes: 30,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      isFreePreview: true,
      content: 'Understanding why path aliases and strict null checks save hours during large team development.',
      materials: [{ title: 'Full-Stack Project Starter Checklist', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }],
      createdAt: '2026-01-23T00:00:00.000Z',
    },
  ];

  const videos = [
    {
      _id: 'vid_violin_showcase',
      id: 'vid_violin_showcase',
      teacher: users[1],
      title: 'Vivaldi Winter Solo - Expressive Bow Articulation',
      description: 'Quick demonstration of staccato bowing control in fast allegro passages. Practice this with a metronome at 72bpm first!',
      category: categories[0],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=600',
      relatedCourse: courses[0],
      durationSeconds: 95,
      views: 1240,
      likes: ['usr_david', 'usr_priya_learner'],
      saves: ['usr_david'],
      tags: ['Violin', 'Solo', 'Technique', 'Classical'],
      createdAt: '2026-02-01T00:00:00.000Z',
    },
    {
      _id: 'vid_react_showcase',
      id: 'vid_react_showcase',
      teacher: users[2],
      title: 'How Clean Architecture Works in Modern TypeScript',
      description: 'A 2-minute breakdown of separating UI, state, and HTTP services into decoupled layers.',
      category: categories[2],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600',
      relatedCourse: courses[1],
      durationSeconds: 120,
      views: 3120,
      likes: ['usr_david', 'usr_learner'],
      saves: ['usr_david'],
      tags: ['TypeScript', 'Architecture', 'CleanCode'],
      createdAt: '2026-02-02T00:00:00.000Z',
    },
    {
      _id: 'vid_dance_showcase',
      id: 'vid_dance_showcase',
      teacher: users[3],
      title: 'Floor Slide Transition Breakdown: Safe Hip Articulation',
      description: 'Protect your knees and hips with proper weight dispersal during sweeping floor transitions.',
      category: categories[1],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
      relatedCourse: courses[2],
      durationSeconds: 85,
      views: 890,
      likes: ['usr_david'],
      saves: [],
      tags: ['Dance', 'Floorwork', 'Safety'],
      createdAt: '2026-02-03T00:00:00.000Z',
    },
    {
      _id: 'vid_pasta_showcase',
      id: 'vid_pasta_showcase',
      teacher: users[4],
      title: 'Rolling Tagliatelle by Hand: Golden Dough Secrets',
      description: 'Watch the windowpane test for pasta dough elasticity before resting and slicing.',
      category: categories[5],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=600',
      relatedCourse: courses[3],
      durationSeconds: 110,
      views: 2450,
      likes: ['usr_david', 'usr_priya_learner'],
      saves: ['usr_priya_learner'],
      tags: ['Cooking', 'Pasta', 'CulinarySkills'],
      createdAt: '2026-02-04T00:00:00.000Z',
    },
  ];

  const liveClasses = [
    {
      _id: 'lc_violin_live',
      id: 'lc_violin_live',
      teacher: users[1],
      title: 'Live Interactive Masterclass: Bow Distribution & Dynamic Contrast',
      description: 'Join Elena live on webcam for real-time posture correction, tone projection exercises, and an open Q&A on classical repertoire.',
      category: categories[0],
      course: courses[0],
      scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      durationMinutes: 60,
      price: 299,
      maxCapacity: 20,
      meetingRoomId: 'SkillSync_ViolinClinic_LiveRoom',
      meetingUrl: 'https://meet.jit.si/SkillSync_ViolinClinic_LiveRoom',
      status: 'scheduled',
      enrolledLearners: [{ learner: users[5] }],
      createdAt: '2026-02-01T00:00:00.000Z',
    },
    {
      _id: 'lc_coding_workshop',
      id: 'lc_coding_workshop',
      teacher: users[2],
      title: 'Live Workshop: Architecting Scalable REST APIs with Express & Mongoose',
      description: 'Interactive code-along session building production middlewares, JWT auth flow, and database validation.',
      category: categories[2],
      course: courses[1],
      scheduledAt: new Date(Date.now() + 86400000 * 4).toISOString(),
      durationMinutes: 90,
      price: 499,
      maxCapacity: 35,
      meetingRoomId: 'SkillSync_FullStack_LiveWorkshop',
      meetingUrl: 'https://meet.jit.si/SkillSync_FullStack_LiveWorkshop',
      status: 'scheduled',
      enrolledLearners: [],
      createdAt: '2026-02-02T00:00:00.000Z',
    },
  ];

  const quizzes = [
    {
      _id: 'qz_violin_1',
      id: 'qz_violin_1',
      course: 'crs_violin',
      title: 'Violin Fundamentals Knowledge Check',
      passingScore: 70,
      questions: [
        {
          questionText: 'Where should your right thumb be positioned on a violin bow?',
          options: [
            'Flat and stiff across the frog grip',
            'Curved softly opposite the middle finger at the frog notch',
            'Wrapped around the stick near the tip',
            'Tucked inside the palm for leverage',
          ],
          correctAnswerIndex: 1,
        },
        {
          questionText: 'Which string on the violin has the highest pitch?',
          options: ['G string', 'D string', 'A string', 'E string'],
          correctAnswerIndex: 3,
        },
      ],
      attempts: [],
    },
  ];

  const assignments = [
    {
      _id: 'asg_violin_1',
      id: 'asg_violin_1',
      course: 'crs_violin',
      title: 'Practice Video Submission: 1-Minute Bowing Stability Exercise',
      description: 'Record a 1-minute video playing open strings (D and A) with a sustained, smooth tone. Upload your clip or link to demonstrate bow parallel tracking.',
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      maxScore: 100,
      submissions: [],
    },
  ];

  const enrollments = [
    {
      _id: 'enr_1',
      id: 'enr_1',
      learner: 'usr_david',
      course: courses[0],
      status: 'active',
      enrolledAt: '2026-02-01T00:00:00.000Z',
    },
  ];

  const progress = [
    {
      _id: 'prg_1',
      id: 'prg_1',
      learner: 'usr_david',
      course: 'crs_violin',
      completedLessons: ['lsn_violin_1'],
      progressPercentage: 50,
      lastWatchedLesson: 'lsn_violin_1',
      isCompleted: false,
    },
  ];

  const reviews = [
    {
      _id: 'rev_1',
      id: 'rev_1',
      user: users[5],
      course: 'crs_violin',
      teacher: 'usr_elena',
      rating: 5,
      comment: 'Elena is an exceptional teacher. The lesson on bowing angles completely transformed my sound in just two practice sessions!',
      isVerifiedLearner: true,
      createdAt: '2026-02-04T00:00:00.000Z',
    },
  ];

  const bookings = [
    {
      _id: 'bk_1',
      id: 'bk_1',
      learner: users[5],
      teacher: users[1],
      course: courses[0],
      type: 'course_enrollment',
      status: 'confirmed',
      amount: 1499,
      createdAt: '2026-02-01T00:00:00.000Z',
    },
  ];

  const payments = [
    {
      _id: 'pay_1',
      id: 'pay_1',
      user: users[5],
      orderId: 'order_violin_001',
      paymentId: 'pay_razor_violin_001',
      amount: 1499,
      currency: 'INR',
      status: 'paid',
      itemType: 'course',
      receipt: 'rcpt_violin_001',
      createdAt: '2026-02-01T00:00:00.000Z',
    },
  ];

  const notifications = [
    {
      _id: 'notif_1',
      id: 'notif_1',
      recipient: 'usr_david',
      title: 'Upcoming Live Violin Class 🎻',
      message: 'Reminder: Interactive Violin Masterclass is scheduled in 2 days.',
      type: 'live_class',
      link: '/live',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const learnerProfiles = [
    {
      _id: 'lp_david',
      id: 'lp_david',
      user: users[5],
      savedCourses: ['crs_violin'],
      savedTeachers: ['usr_elena'],
      savedVideos: ['vid_violin_showcase'],
    },
  ];

  return {
    users,
    teacherProfiles,
    learnerProfiles,
    categories,
    courses,
    lessons,
    videos,
    liveClasses,
    bookings,
    payments,
    enrollments,
    progress,
    reviews,
    quizzes,
    assignments,
    subscriptions: [],
    notifications,
    reports: [],
  };
};

// Singleton storage helper
class LocalDataService {
  private db: LocalDatabase;

  constructor() {
    this.db = this.load();
  }

  private load(): LocalDatabase {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[LocalDataService] Failed to load localStorage DB, initializing defaults:', e);
    }
    const initial = getDefaultDatabase();
    this.save(initial);
    return initial;
  }

  public save(data?: LocalDatabase): void {
    try {
      if (data) this.db = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
    } catch (e) {
      console.error('[LocalDataService] Failed to persist DB to localStorage:', e);
    }
  }

  public getDatabase(): LocalDatabase {
    return this.db;
  }

  // --- Auth Handlers ---
  public login(email: string, pass: string) {
    const user = this.db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === pass
    );
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const token = `jwt_mock_${user._id}_${Date.now()}`;
    return {
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
      },
    };
  }

  public register(payload: any) {
    const emailLower = payload.email.toLowerCase();
    if (this.db.users.some((u) => u.email.toLowerCase() === emailLower)) {
      throw new Error('An account with this email already exists.');
    }
    const newId = `usr_${Date.now()}`;
    const newUser = {
      _id: newId,
      id: newId,
      name: payload.name,
      email: emailLower,
      password: payload.password,
      phone: payload.phone || '',
      role: payload.role || 'learner',
      avatar:
        payload.avatar ||
        (payload.role === 'teacher'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'),
      bio: payload.bio || '',
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    };
    this.db.users.push(newUser);

    if (newUser.role === 'teacher') {
      this.db.teacherProfiles.push({
        _id: `tp_${newId}`,
        id: `tp_${newId}`,
        user: newUser,
        title: 'Instructor & Mentor',
        bio: 'Passionate about sharing knowledge and teaching skills.',
        skills: ['Teaching'],
        experienceYears: 1,
        hourlyRate: 500,
        rating: 5.0,
        numReviews: 0,
        verificationStatus: 'unverified',
        subscriptionTier: 'basic',
        totalEarnings: 0,
        totalStudentsCount: 0,
      });
    } else {
      this.db.learnerProfiles.push({
        _id: `lp_${newId}`,
        id: `lp_${newId}`,
        user: newUser,
        savedCourses: [],
        savedTeachers: [],
        savedVideos: [],
      });
    }

    this.save();
    const token = `jwt_mock_${newId}_${Date.now()}`;
    return {
      success: true,
      token,
      user: {
        id: newId,
        _id: newId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        phone: newUser.phone,
        bio: newUser.bio,
      },
    };
  }

  public getMe(userId: string) {
    const user = this.db.users.find((u) => u._id === userId || u.id === userId);
    if (!user) throw new Error('User not found');
    return { success: true, user };
  }

  public updateProfile(userId: string, body: any) {
    const user = this.db.users.find((u) => u._id === userId || u.id === userId);
    if (!user) throw new Error('User not found');
    Object.assign(user, body);
    this.save();
    return { success: true, user };
  }

  // --- Categories ---
  public getCategories() {
    const list = this.db.categories.map((cat) => {
      const courseCount = this.db.courses.filter((c) => c.category?._id === cat._id || c.category?.slug === cat.slug).length;
      const teacherCount = this.db.teacherProfiles.filter((tp) => (tp.categories || []).some((c: any) => c._id === cat._id || c.slug === cat.slug)).length;
      return { ...cat, courseCount, teacherCount };
    });
    return { success: true, data: list };
  }

  // --- Courses ---
  public getCourses(params: any = {}) {
    let list = [...this.db.courses];
    if (params.category) {
      list = list.filter((c) => c.category?._id === params.category || c.category?.slug === params.category);
    }
    if (params.teacherId) {
      list = list.filter((c) => c.teacher?._id === params.teacherId || c.teacher?.id === params.teacherId);
    }
    if (params.difficulty && params.difficulty !== 'all') {
      list = list.filter((c) => c.difficulty === params.difficulty);
    }
    if (params.minPrice) {
      list = list.filter((c) => c.price >= Number(params.minPrice));
    }
    if (params.maxPrice) {
      list = list.filter((c) => c.price <= Number(params.maxPrice));
    }
    if (params.rating) {
      list = list.filter((c) => (c.rating || 0) >= Number(params.rating));
    }
    if (params.search) {
      const q = String(params.search).toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || (c.tags || []).some((t: string) => t.toLowerCase().includes(q)));
    }
    return {
      success: true,
      data: list,
      pagination: {
        page: 1,
        limit: 20,
        total: list.length,
        pages: 1,
      },
    };
  }

  public getCourseById(idOrSlug: string, currentUserId?: string) {
    const course = this.db.courses.find((c) => c._id === idOrSlug || c.slug === idOrSlug || c.id === idOrSlug);
    if (!course) throw new Error('Course not found');

    const teacherId = course.teacher?._id || course.teacher?.id || course.teacher;
    const teacherProfile = this.db.teacherProfiles.find((tp) => tp.user?._id === teacherId || tp.user?.id === teacherId);

    const isTeacher = teacherId === currentUserId;
    const isEnrolled = this.db.enrollments.some(
      (e) => (e.learner === currentUserId || e.learner?._id === currentUserId) && (e.course?._id === course._id || e.course === course._id)
    );

    const lessons = this.db.lessons
      .filter((l) => l.course === course._id)
      .map((l) => {
        if (isEnrolled || isTeacher || l.isFreePreview) return l;
        return { ...l, videoUrl: '', content: '', materials: [] };
      });

    const quizzes = this.db.quizzes.filter((q) => q.course === course._id);
    const assignments = this.db.assignments.filter((a) => a.course === course._id);
    const reviews = this.db.reviews.filter((r) => r.course === course._id);
    const progress = this.db.progress.find((p) => (p.learner === currentUserId || p.learner?._id === currentUserId) && p.course === course._id);

    return {
      success: true,
      course,
      teacherProfile,
      lessons,
      quizzes,
      assignments,
      reviews,
      isEnrolled: isEnrolled || isTeacher,
      progress,
    };
  }

  public createCourse(payload: any, user: any) {
    const newId = `crs_${Date.now()}`;
    const slug = (payload.title || 'course').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const categoryObj = this.db.categories.find((c) => c._id === payload.category || c.slug === payload.category) || {
      _id: payload.category,
      name: 'General',
      slug: 'general',
      icon: 'BookOpen',
    };

    const newCourse = {
      _id: newId,
      id: newId,
      title: payload.title,
      slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
      description: payload.description || '',
      category: categoryObj,
      teacher: user,
      thumbnail: payload.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
      promoVideo: payload.promoVideo || '',
      price: Number(payload.price) || 0,
      durationMinutes: Number(payload.durationMinutes) || 60,
      difficulty: payload.difficulty || 'beginner',
      requirements: payload.requirements || [],
      whatYouWillLearn: payload.whatYouWillLearn || [],
      tags: payload.tags || [],
      rating: 5.0,
      numReviews: 0,
      lessonsCount: 0,
      enrolledCount: 0,
      status: 'published',
      isApproved: true,
      createdAt: new Date().toISOString(),
    };

    this.db.courses.unshift(newCourse);
    this.save();
    return { success: true, message: 'Course created successfully', data: newCourse };
  }

  public updateCourse(id: string, payload: any) {
    const course = this.db.courses.find((c) => c._id === id || c.id === id);
    if (!course) throw new Error('Course not found');
    Object.assign(course, payload);
    this.save();
    return { success: true, message: 'Course updated successfully', data: course };
  }

  public deleteCourse(id: string) {
    this.db.courses = this.db.courses.filter((c) => c._id !== id && c.id !== id);
    this.db.lessons = this.db.lessons.filter((l) => l.course !== id);
    this.save();
    return { success: true, message: 'Course deleted successfully' };
  }

  // --- Lessons ---
  public addLesson(courseId: string, payload: any) {
    const course = this.db.courses.find((c) => c._id === courseId || c.id === courseId);
    if (!course) throw new Error('Course not found');

    const newId = `lsn_${Date.now()}`;
    const newLesson = {
      _id: newId,
      id: newId,
      course: courseId,
      title: payload.title,
      description: payload.description || '',
      orderIndex: payload.orderIndex !== undefined ? payload.orderIndex : course.lessonsCount || 0,
      durationMinutes: Number(payload.durationMinutes) || 15,
      videoUrl: payload.videoUrl || '',
      thumbnailUrl: payload.thumbnailUrl || '',
      content: payload.content || '',
      isFreePreview: payload.isFreePreview || false,
      materials: payload.materials || [],
      createdAt: new Date().toISOString(),
    };

    this.db.lessons.push(newLesson);
    course.lessonsCount = (course.lessonsCount || 0) + 1;
    this.save();
    return { success: true, message: 'Lesson added successfully', data: newLesson };
  }

  public markLessonComplete(lessonId: string, userId: string) {
    const lesson = this.db.lessons.find((l) => l._id === lessonId || l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');

    let prog = this.db.progress.find(
      (p) => (p.learner === userId || p.learner?._id === userId) && p.course === lesson.course
    );

    if (!prog) {
      prog = {
        _id: `prog_${Date.now()}`,
        id: `prog_${Date.now()}`,
        learner: userId,
        course: lesson.course,
        completedLessons: [lessonId],
        progressPercentage: 50,
        lastWatchedLesson: lessonId,
        isCompleted: false,
      };
      this.db.progress.push(prog);
    } else {
      if (!prog.completedLessons.includes(lessonId)) {
        prog.completedLessons.push(lessonId);
      }
      prog.lastWatchedLesson = lessonId;
    }

    const totalLessons = this.db.lessons.filter((l) => l.course === lesson.course).length || 1;
    prog.progressPercentage = Math.min(100, Math.round((prog.completedLessons.length / totalLessons) * 100));
    if (prog.progressPercentage >= 100) {
      prog.isCompleted = true;
    }

    this.save();
    return { success: true, message: 'Lesson marked as completed', progress: prog };
  }

  // --- Teachers ---
  public getTeachers(params: any = {}) {
    let list = [...this.db.teacherProfiles];
    if (params.verifiedOnly === 'true') {
      list = list.filter((t) => t.verificationStatus === 'verified');
    }
    if (params.category) {
      list = list.filter((t) => (t.categories || []).some((c: any) => c._id === params.category || c.slug === params.category));
    }
    if (params.search) {
      const q = String(params.search).toLowerCase();
      list = list.filter(
        (t) =>
          t.user?.name?.toLowerCase().includes(q) ||
          t.title?.toLowerCase().includes(q) ||
          (t.skills || []).some((s: string) => s.toLowerCase().includes(q))
      );
    }
    return { success: true, data: list, pagination: { page: 1, limit: 12, total: list.length, pages: 1 } };
  }

  public getTeacherById(id: string) {
    const profile = this.db.teacherProfiles.find(
      (t) => t._id === id || t.id === id || t.user?._id === id || t.user?.id === id
    );
    if (!profile) throw new Error('Teacher profile not found');

    const teacherUserId = profile.user?._id || profile.user?.id;
    const courses = this.db.courses.filter((c) => c.teacher?._id === teacherUserId || c.teacher?.id === teacherUserId);
    const videos = this.db.videos.filter((v) => v.teacher?._id === teacherUserId || v.teacher?.id === teacherUserId);
    const reviews = this.db.reviews.filter((r) => r.teacher === teacherUserId);

    return { success: true, profile, courses, videos, reviews };
  }

  public updateTeacherProfile(userId: string, body: any) {
    let profile = this.db.teacherProfiles.find((t) => t.user?._id === userId || t.user?.id === userId);
    if (!profile) {
      const user = this.db.users.find((u) => u._id === userId || u.id === userId);
      profile = {
        _id: `tp_${userId}`,
        id: `tp_${userId}`,
        user,
        ...body,
      };
      this.db.teacherProfiles.push(profile);
    } else {
      Object.assign(profile, body);
    }
    this.save();
    return { success: true, message: 'Teacher profile updated successfully', data: profile };
  }

  // --- Videos ---
  public getVideos(params: any = {}) {
    let list = [...this.db.videos];
    if (params.category) {
      list = list.filter((v) => v.category?._id === params.category || v.category?.slug === params.category);
    }
    if (params.teacherId) {
      list = list.filter((v) => v.teacher?._id === params.teacherId || v.teacher?.id === params.teacherId);
    }
    if (params.search) {
      const q = String(params.search).toLowerCase();
      list = list.filter((v) => v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q));
    }
    return { success: true, data: list, pagination: { page: 1, limit: 12, total: list.length, pages: 1 } };
  }

  public createVideo(payload: any, user: any) {
    const newId = `vid_${Date.now()}`;
    const cat = this.db.categories.find((c) => c._id === payload.category || c.slug === payload.category) || {
      _id: payload.category,
      name: 'Skill Showcase',
      slug: 'skill-showcase',
    };
    const relCourse = payload.relatedCourse ? this.db.courses.find((c) => c._id === payload.relatedCourse) : undefined;

    const newVideo = {
      _id: newId,
      id: newId,
      teacher: user,
      title: payload.title,
      description: payload.description || '',
      category: cat,
      videoUrl: payload.videoUrl,
      thumbnailUrl: payload.thumbnailUrl || 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=600',
      relatedCourse: relCourse,
      durationSeconds: Number(payload.durationSeconds) || 60,
      views: 0,
      likes: [],
      saves: [],
      tags: payload.tags || [],
      createdAt: new Date().toISOString(),
    };

    this.db.videos.unshift(newVideo);
    this.save();
    return { success: true, message: 'Showcase video uploaded successfully', data: newVideo };
  }

  public toggleLikeVideo(videoId: string, userId: string) {
    const video = this.db.videos.find((v) => v._id === videoId || v.id === videoId);
    if (!video) throw new Error('Video not found');
    if (!video.likes) video.likes = [];
    const idx = video.likes.indexOf(userId);
    let liked = false;
    if (idx === -1) {
      video.likes.push(userId);
      liked = true;
    } else {
      video.likes.splice(idx, 1);
    }
    this.save();
    return { success: true, liked, likesCount: video.likes.length };
  }

  // --- Live Classes ---
  public getLiveClasses(params: any = {}) {
    let list = [...this.db.liveClasses];
    if (params.category) {
      list = list.filter((lc) => lc.category?._id === params.category || lc.category?.slug === params.category);
    }
    if (params.teacherId) {
      list = list.filter((lc) => lc.teacher?._id === params.teacherId || lc.teacher?.id === params.teacherId);
    }
    list.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    return { success: true, data: list, pagination: { page: 1, limit: 10, total: list.length, pages: 1 } };
  }

  public getLiveClassById(id: string, currentUserId?: string) {
    const liveClass = this.db.liveClasses.find((lc) => lc._id === id || lc.id === id);
    if (!liveClass) throw new Error('Live class not found');
    const isHost = (liveClass.teacher?._id || liveClass.teacher?.id) === currentUserId;
    const isEnrolled = (liveClass.enrolledLearners || []).some(
      (e: any) => (e.learner?._id || e.learner?.id || e.learner) === currentUserId
    );
    return { success: true, data: liveClass, isAuthorizedToJoin: isHost || isEnrolled || liveClass.price === 0 };
  }

  public createLiveClass(payload: any, user: any) {
    const newId = `lc_${Date.now()}`;
    const cleanTitle = (payload.title || 'class').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
    const meetingRoomId = `SkillSync_${cleanTitle}_${Math.random().toString(36).substring(2, 8)}`;
    const cat = this.db.categories.find((c) => c._id === payload.category || c.slug === payload.category) || {
      _id: payload.category,
      name: 'Workshop',
      slug: 'workshop',
    };

    const newClass = {
      _id: newId,
      id: newId,
      teacher: user,
      title: payload.title,
      description: payload.description || '',
      category: cat,
      course: payload.course || undefined,
      scheduledAt: new Date(payload.scheduledAt).toISOString(),
      durationMinutes: Number(payload.durationMinutes) || 60,
      price: Number(payload.price) || 0,
      maxCapacity: Number(payload.maxCapacity) || 25,
      meetingRoomId,
      meetingUrl: `https://meet.jit.si/${meetingRoomId}`,
      status: 'scheduled',
      enrolledLearners: [],
      createdAt: new Date().toISOString(),
    };

    this.db.liveClasses.unshift(newClass);
    this.save();
    return { success: true, message: 'Live class scheduled successfully', data: newClass };
  }

  // --- Payments & Bookings ---
  public createOrder(payload: any, user: any) {
    const { itemType, itemId } = payload;
    let amount = 0;
    let title = '';
    let teacherId = null;

    if (itemType === 'course') {
      const course = this.db.courses.find((c) => c._id === itemId || c.id === itemId);
      if (!course) throw new Error('Course not found');
      amount = course.price;
      title = course.title;
      teacherId = course.teacher?._id || course.teacher?.id || course.teacher;
    } else if (itemType === 'live_class') {
      const lc = this.db.liveClasses.find((x) => x._id === itemId || x.id === itemId);
      if (!lc) throw new Error('Live class not found');
      amount = lc.price;
      title = lc.title;
      teacherId = lc.teacher?._id || lc.teacher?.id || lc.teacher;
    } else if (itemType === 'subscription') {
      amount = itemId === 'pro' ? 2499 : 999;
      title = `SkillSync ${itemId.toUpperCase()} Plan`;
      teacherId = user._id;
    }

    if (amount === 0 && itemType !== 'subscription') {
      // Free enrollment
      const booking = {
        _id: `bkg_${Date.now()}`,
        id: `bkg_${Date.now()}`,
        learner: user,
        teacher: teacherId,
        course: itemType === 'course' ? itemId : undefined,
        liveClass: itemType === 'live_class' ? itemId : undefined,
        type: itemType === 'course' ? 'course_enrollment' : 'live_class',
        status: 'confirmed',
        amount: 0,
        createdAt: new Date().toISOString(),
      };
      this.db.bookings.unshift(booking);

      if (itemType === 'course') {
        this.db.enrollments.push({
          _id: `enr_${Date.now()}`,
          id: `enr_${Date.now()}`,
          learner: user._id,
          course: itemId,
          status: 'active',
          enrolledAt: new Date().toISOString(),
        });
        const c = this.db.courses.find((x) => x._id === itemId);
        if (c) c.enrolledCount = (c.enrolledCount || 0) + 1;
      }
      this.save();
      return { success: true, isFree: true, message: 'Enrolled successfully for free!', bookingId: booking._id };
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const payment = {
      _id: `pay_${Date.now()}`,
      id: `pay_${Date.now()}`,
      user: user._id,
      orderId,
      amount,
      currency: 'INR',
      status: 'created',
      itemType,
      itemId,
      createdAt: new Date().toISOString(),
    };
    this.db.payments.unshift(payment);

    const booking = {
      _id: `bkg_${Date.now()}`,
      id: `bkg_${Date.now()}`,
      learner: user,
      teacher: teacherId,
      course: itemType === 'course' ? itemId : undefined,
      liveClass: itemType === 'live_class' ? itemId : undefined,
      type: itemType === 'course' ? 'course_enrollment' : 'live_class',
      status: 'pending',
      amount,
      payment: payment._id,
      createdAt: new Date().toISOString(),
    };
    this.db.bookings.unshift(booking);
    this.save();

    return {
      success: true,
      isFree: false,
      orderId,
      amount,
      currency: 'INR',
      keyId: 'rzp_test_SkillSync2026',
      paymentId: payment._id,
      bookingId: booking._id,
      itemTitle: title,
    };
  }

  public verifyPayment(payload: any, user: any) {
    const { razorpay_order_id, bookingId, paymentId } = payload;
    const payment = this.db.payments.find((p) => p.orderId === razorpay_order_id || p._id === paymentId);
    if (payment) {
      payment.status = 'paid';
      payment.paymentId = payload.razorpay_payment_id || `pay_${Date.now()}`;
    }

    const booking = this.db.bookings.find((b) => b.payment === payment?._id || b._id === bookingId);
    if (booking) {
      booking.status = 'confirmed';
      if (booking.course) {
        this.db.enrollments.push({
          _id: `enr_${Date.now()}`,
          id: `enr_${Date.now()}`,
          learner: user._id,
          course: booking.course,
          status: 'active',
          enrolledAt: new Date().toISOString(),
        });
        const c = this.db.courses.find((x) => x._id === booking.course);
        if (c) c.enrolledCount = (c.enrolledCount || 0) + 1;
      }
      if (booking.liveClass) {
        const lc = this.db.liveClasses.find((x) => x._id === booking.liveClass);
        if (lc) {
          if (!lc.enrolledLearners) lc.enrolledLearners = [];
          lc.enrolledLearners.push({ learner: user });
        }
      }
    }
    this.save();
    return { success: true, message: 'Payment verified and booking confirmed successfully!' };
  }

  // --- Reviews ---
  public createReview(payload: any, user: any) {
    const course = this.db.courses.find((c) => c._id === payload.courseId);
    if (!course) throw new Error('Course not found');

    const newRev = {
      _id: `rev_${Date.now()}`,
      id: `rev_${Date.now()}`,
      user,
      course: course._id,
      teacher: course.teacher?._id || course.teacher?.id || course.teacher,
      rating: Number(payload.rating) || 5,
      comment: payload.comment || '',
      isVerifiedLearner: true,
      createdAt: new Date().toISOString(),
    };

    this.db.reviews.unshift(newRev);

    const allRevs = this.db.reviews.filter((r) => r.course === course._id);
    const avg = allRevs.reduce((acc, curr) => acc + curr.rating, 0) / allRevs.length;
    course.rating = Number(avg.toFixed(1));
    course.numReviews = allRevs.length;

    this.save();
    return { success: true, message: 'Review submitted successfully', data: newRev };
  }

  // --- Dashboards ---
  public getLearnerDashboard(userId: string) {
    const enrollments = this.db.enrollments.filter(
      (e) => e.learner === userId || e.learner?._id === userId
    );

    const enrolledCourses = enrollments.map((e) => {
      const c = this.db.courses.find((x) => x._id === (e.course?._id || e.course)) || e.course;
      const prog = this.db.progress.find(
        (p) => (p.learner === userId || p.learner?._id === userId) && p.course === (c?._id || c)
      );
      return {
        enrollmentId: e._id,
        enrolledAt: e.enrolledAt,
        status: e.status || 'active',
        course: c,
        progress: prog
          ? {
              percentage: prog.progressPercentage || 0,
              completedLessonsCount: (prog.completedLessons || []).length,
              isCompleted: prog.isCompleted || false,
              lastWatchedLesson: prog.lastWatchedLesson,
            }
          : {
              percentage: 0,
              completedLessonsCount: 0,
              isCompleted: false,
            },
      };
    });

    const upcomingLiveClasses = this.db.liveClasses.filter((lc) =>
      (lc.enrolledLearners || []).some(
        (el: any) => el.learner === userId || el.learner?._id === userId || el.learner?.id === userId
      )
    );

    const bookings = this.db.bookings.filter(
      (b) => b.learner === userId || b.learner?._id === userId || b.learner?.id === userId
    );

    const enrolledCourseIds = new Set(enrollments.map((e) => e.course?._id || e.course));
    const recommendedCourses = this.db.courses.filter((c) => !enrolledCourseIds.has(c._id)).slice(0, 6);

    return {
      success: true,
      data: {
        enrolledCourses,
        upcomingLiveClasses,
        bookings: bookings.slice(0, 10),
        payments: this.db.payments.slice(0, 10),
        savedCourses: this.db.courses.slice(0, 2),
        savedTeachers: this.db.teacherProfiles.slice(0, 2),
        notifications: this.db.notifications.slice(0, 5),
        recommendedCourses,
        stats: {
          totalEnrolled: enrollments.length,
          completedCourses: enrollments.filter((e) => e.status === 'completed').length,
          upcomingClassesCount: upcomingLiveClasses.length,
        },
      },
    };
  }

  public getTeacherDashboard(userId: string) {
    const profile = this.db.teacherProfiles.find(
      (tp) => tp.user?._id === userId || tp.user?.id === userId || tp.user === userId
    );

    const courses = this.db.courses.filter(
      (c) => c.teacher?._id === userId || c.teacher?.id === userId || c.teacher === userId
    );

    const liveClasses = this.db.liveClasses.filter(
      (lc) => lc.teacher?._id === userId || lc.teacher?.id === userId || lc.teacher === userId
    );

    const bookings = this.db.bookings.filter(
      (b) => b.teacher?._id === userId || b.teacher?.id === userId || b.teacher === userId
    );

    const totalEarnings = profile?.totalEarnings || 84000;
    const monthlyEarnings = Math.round(totalEarnings * 0.35);

    return {
      success: true,
      data: {
        profile: profile || {
          user: this.db.users.find((u) => u._id === userId),
          title: 'Master Instructor',
          bio: 'Passionate skill educator.',
          skills: ['Mentorship'],
          hourlyRate: 800,
          rating: 4.9,
          numReviews: 24,
          verificationStatus: 'verified',
          subscriptionTier: 'pro',
        },
        courses,
        liveClasses,
        bookings: bookings.slice(0, 15),
        notifications: this.db.notifications.slice(0, 6),
        stats: {
          totalEarnings,
          monthlyEarnings,
          totalStudents: profile?.totalStudentsCount || 142,
          activeCoursesCount: courses.length,
          avgRating: profile?.rating || 4.9,
          totalReviews: profile?.numReviews || 24,
          totalBookingsCount: bookings.length || 18,
        },
      },
    };
  }

  public getAdminStats() {
    const totalUsers = this.db.users.length;
    const totalTeachers = this.db.users.filter((u) => u.role === 'teacher').length;
    const totalLearners = this.db.users.filter((u) => u.role === 'learner').length;
    const totalCourses = this.db.courses.length;
    const totalVideos = this.db.videos.length;
    const totalBookings = this.db.bookings.length;
    const pendingVerifications = this.db.teacherProfiles.filter((t) => t.verificationStatus === 'pending').length;
    const pendingReports = this.db.reports.filter((r) => r.status === 'pending').length;
    const paidPayments = this.db.payments.filter((p) => p.status === 'paid');
    const totalRevenue = paidPayments.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      success: true,
      data: {
        totalUsers,
        totalTeachers,
        totalLearners,
        totalCourses,
        totalVideos,
        totalBookings,
        totalRevenue: totalRevenue || 1499,
        pendingVerifications,
        pendingReports,
        recentPayments: paidPayments.slice(0, 5),
      },
    };
  }
}

export const localDataService = new LocalDataService();
export default localDataService;
