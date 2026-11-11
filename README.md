# SkillSync – Full-Stack Skill Sharing Marketplace Platform

> **"Discover Skills. Share Talent. Grow Together."**

SkillSync is a production-ready, full-stack, two-way skill-sharing marketplace connecting passionate mentors and teachers with ambitious learners worldwide. Built with a modern, high-performance architecture, SkillSync enables teachers to monetize their talent through recorded masterclasses, live interactive video sessions, and showcase reels, while learners enjoy personalized learning pathways, interactive quizzes, assignments, and verified ratings.

---

## 🌟 Key Features

### 1. Dual-Mode Database Architecture
- **MongoDB Atlas / Local MongoDB Mode:** Enterprise Mongoose ODM with strictly typed schemas, population, relational joins, indexing, and input validation.
- **Zero-Config Resilient Fallback Mode:** In-memory fallback (`localStore.ts`) pre-seeded with 4 realistic master teachers, 3 learners, an administrator, 9 skill categories, published courses, interactive quizzes, student assignments, showcase reels, live classes, bookings, and payments. Works instantly out of the box with zero external dependencies.

### 2. User Authentication & Role-Based Access Control (RBAC)
- **JWT & bcrypt Authentication:** Secure JSON Web Tokens with encrypted password hashing.
- **Three Distinct Roles:**
  - **Learner:** Course discovery, video feed, enrollments, learning progress tracker, live class bookings, verified reviews.
  - **Teacher:** Course creation studio, lesson curriculum management, showcase video publisher, live class scheduler, revenue analytics.
  - **Admin:** Platform statistics, user moderation, teacher verification approval, content moderation, transaction audits.
- Profile management with avatar uploads, password reset, and password modification.

### 3. Skill Discovery & Marketplace
- **Categories:** Music, Dance, Programming, Photography, Drawing & Painting, Cooking, Fitness, Language Learning, Arts & Crafts.
- **Rich Filtering & Sorting:** Real-time search query, category filtering, difficulty level (`beginner`, `intermediate`, `advanced`), price range slider, star rating filtering, and sorting (`popular`, `price_asc`, `price_desc`, `rating`, `newest`).

### 4. Interactive Learning Management System (LMS)
- **Course Player:** Video streaming player with lesson navigation and duration tracking.
- **Access Control:** Free previews accessible publicly; full lessons, materials, quizzes, and assignments strictly guarded by server-side enrollment checks.
- **Interactive Quizzes:** Timed multi-choice evaluations with instant grading, passing score thresholds, and answer feedback.
- **Student Assignments:** Assignment briefs with deadline reminders, student submission box, and file attachments.
- **Learning Progress Tracker:** Percentage completion bar, lesson completion tracking, and automatic completion certificate notifications.

### 5. Skill Showcase Reels & Video Feed
- Short-form vertical/horizontal skill reels showcasing teacher talent and teaching style.
- Interactive engagement: Likes counter, bookmarks/saves, view counter, direct course purchase links, and moderation reporting.

### 6. Live Interactive Classes & Video Conferencing
- Real-time video conferencing integrated with **Jitsi Meet** (`meet.jit.si`).
- Dynamic unique room generation (`SkillSync_<title>_<teacherId>_<uuid>`).
- Live class scheduling with date/time picker, capacity limits, enrollment roster, and student joining permissions.
- In-app meeting modal with camera/microphone controls, screen sharing, and teacher host privileges.

### 7. Razorpay Payments & Webhook Engine
- **Server-Side Order Creation:** Secure Razorpay order generation with receipt tokens and tamper protection.
- **HMAC SHA-256 Verification:** Cryptographic signature verification on server endpoints before any enrollment or booking is confirmed.
- **Webhook Handling:** Listens to `order.paid`, `payment.captured`, and `refund.processed` events.
- **Automatic Split:** 85% instructor earnings, 15% platform commission tracked in real-time.
- **Free Enrollments:** Seamless bypass and automatic confirmation for ₹0 workshops and introductory courses.

### 8. Subscription Tiers for Teachers
- **Basic Starter (Free Forever):** 3 courses, 5 showcase videos, 15% commission.
- **Instructor Premium (₹999/month):** Verified badge eligibility, 15 courses, 30 videos, 10% commission, live classes up to 50 students.
- **Master Pro (₹2,499/month):** Spotlight homepage placement, 50 courses, 100 videos, 5% commission, advanced revenue & retention analytics.

### 9. Multi-Channel Notifications
- In-app notification center with real-time unread badges.
- Nodemailer email notifications for order receipts, class reschedules, course completions, and teacher verifications.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide React, Axios |
| **Backend** | Node.js, Express.js, TypeScript, RESTful APIs |
| **Database** | MongoDB with Mongoose ODM + Dual-mode in-memory resilient fallback (`localStore.ts`) |
| **Authentication** | JWT (jsonwebtoken), bcryptjs, Role-Based Route Guards |
| **Video Conferencing** | Jitsi Meet Web SDK (`meet.jit.si`) |
| **Payments** | Razorpay Node.js SDK (Orders, Verification, Webhooks) |
| **Media Storage** | Cloudinary API + Local disk fallback (`/uploads`) |
| **Email Delivery** | Nodemailer (SMTP transport) |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js:** v18.0.0 or later (Tested on Node v24)
- **npm:** v9.0.0 or later
- **MongoDB:** (Optional) Local MongoDB on `mongodb://localhost:27017/skillsync` or MongoDB Atlas URI. If omitted, the application runs seamlessly in in-memory mode with full seed data.

### 1. Installation

Clone or enter the project directory:
```bash
cd skillsync
```

Install root, backend, and frontend dependencies:
```bash
# Server dependencies
npm --prefix server install

# Client dependencies
npm --prefix client install
```

### 2. Environment Configuration

The repository includes pre-configured `.env` files for immediate local development.

**Server Configuration (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/skillsync
JWT_SECRET=skillsync_jwt_super_secure_secret_key_2026_dev
JWT_EXPIRE=7d

# Razorpay (Pre-configured for Sandbox Test Mode)
RAZORPAY_KEY_ID=rzp_test_SkillSync2026
RAZORPAY_KEY_SECRET=rzp_secret_skillsync_test_mock
RAZORPAY_WEBHOOK_SECRET=rzp_webhook_secret_dev

# Cloudinary (Optional - falls back to local /uploads)
CLOUDINARY_CLOUD_NAME=skillsync
CLOUDINARY_API_KEY=mock_key
CLOUDINARY_API_SECRET=mock_secret

# Email / SMTP
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=mock_user
SMTP_PASS=mock_pass
FROM_EMAIL=notifications@skillsync.com
FROM_NAME=SkillSync Platform
```

**Client Configuration (`client/.env`):**
```env
VITE_API_URL=/api
VITE_RAZORPAY_KEY_ID=rzp_test_SkillSync2026
```

### 3. Running the Application

You can start the backend and frontend in separate terminal windows:

**Terminal 1: Start Backend API Server**
```bash
npm --prefix server run dev
# Server boots on http://localhost:5000
```

**Terminal 2: Start Frontend Application**
```bash
npm --prefix client run dev
# Frontend boots on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser to start exploring SkillSync!

---

## 🔑 Pre-Seeded Demo Accounts

The platform includes pre-configured demo credentials across all user tiers:

| Role | Name | Email | Password | Features Accessible |
|---|---|---|---|---|
| **Platform Admin** | SkillSync Admin | `admin@skillsync.com` | `admin123` | Platform analytics, user manager, teacher verification review, content moderation |
| **Teacher (Music)** | Elena Rostova | `elena.violin@skillsync.com` | `password123` | Teacher studio, live class scheduler, course curriculum manager, earnings report |
| **Teacher (Code)** | Marcus Chen | `marcus.code@skillsync.com` | `password123` | Published courses, student grading, showcase reels |
| **Teacher (Dance)** | Priya Sharma | `priya.dance@skillsync.com` | `password123` | Dance choreography courses, live group workshops |
| **Teacher (Chef)** | Chef Antonio | `antonio.chef@skillsync.com` | `password123` | Culinary masterclasses, Italian pasta workshops |
| **Learner** | David Miller | `david@example.com` | `password123` | Course player, quiz taker, assignment submissions, live class attendee |
| **Learner** | Demo Learner | `learner@skillsync.com` | `password123` | Free and paid course enrollments, bookmarking, reviews |

*(You can also click "Register" on the top navigation to create brand-new Learner or Teacher accounts on the fly!)*

---

## 🧪 Automated End-to-End Test Suite

SkillSync includes an automated 23-point end-to-end test suite that verifies all critical system workflows without requiring external network ports:

```bash
npm test
```

**Verified Test Checkpoints:**
1. `GET /api/health` - API server heartbeat check
2. `GET /api/categories` - 9 skill categories with course/instructor counts
3. `GET /api/courses` - Course catalog with filtering and search
4. `GET /api/courses/:id` - Full course details, sanitized curriculum, quizzes
5. `GET /api/teachers` - Public instructors directory with hourly rates and badges
6. `GET /api/teachers/:id` - Public teacher profile, qualifications, course listings
7. `GET /api/videos` - Showcase video reels feed
8. `GET /api/live-classes` - Upcoming scheduled live classes
9. `GET /api/live-classes/:id` - Live class details and Jitsi meeting room configuration
10. `GET /api/subscriptions/plans` - Basic, Premium, and Pro instructor subscription tiers
11. `POST /api/auth/login` (Admin) - JWT generation and role validation
12. `GET /api/admin/stats` - Total platform revenue, active users, course counts
13. `POST /api/auth/login` (Teacher) - Instructor authentication
14. `GET /api/users/teacher-dashboard` - Real-time instructor revenue analytics and course list
15. `POST /api/live-classes` - Schedule live class with automated Jitsi room creation
16. `POST /api/auth/login` (Learner) - Learner authentication
17. `GET /api/users/learner-dashboard` - Enrolled courses and learning statistics
18. `POST /api/payments/create-order` - Razorpay order creation and pending booking initialization
19. `POST /api/payments/verify` - Cryptographic signature verification and enrollment activation
20. `POST /api/lessons/:id/complete` - Learning progress tracker and percentage recalculation
21. `POST /api/progress/quiz/:id/submit` - Interactive quiz grading and feedback
22. `POST /api/reviews` - Verified student course review submission and rating updates
23. `GET /api/notifications` - In-app notification center alerts

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create new learner or teacher account
- `POST /api/auth/login` - Authenticate user & receive JWT token
- `GET /api/auth/me` - Get profile of authenticated user
- `PUT /api/auth/update-profile` - Update profile name, phone, bio, avatar
- `PUT /api/auth/change-password` - Modify account password
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password/:token` - Reset password with token

### Skill Marketplace & Courses (`/api/courses`)
- `GET /api/courses` - Browse courses with search, category, difficulty, price, and rating filters
- `GET /api/courses/:id` - Retrieve course details, curriculum, quizzes, and verified reviews
- `POST /api/courses` - Create new course (Teacher only)
- `PUT /api/courses/:id` - Update course metadata (Teacher/Admin)
- `DELETE /api/courses/:id` - Delete course and associated lessons (Teacher/Admin)
- `POST /api/courses/:courseId/lessons` - Add lesson to course curriculum

### Showcase Video Feed (`/api/videos`)
- `GET /api/videos` - Retrieve video reels feed with category filters
- `GET /api/videos/:id` - View video details and increment view count
- `POST /api/videos` - Upload new showcase reel (Teacher only)
- `POST /api/videos/:id/like` - Toggle like on video
- `POST /api/videos/:id/save` - Bookmark video to learner profile

### Live Masterclasses (`/api/live-classes`)
- `GET /api/live-classes` - List upcoming public live classes
- `GET /api/live-classes/:id` - Get live class details and check join authorization
- `POST /api/live-classes` - Schedule new live masterclass with Jitsi room (Teacher only)
- `PUT /api/live-classes/:id` - Reschedule or update live class
- `POST /api/live-classes/:id/cancel` - Cancel live session & alert participants

### Payments & Bookings (`/api/payments` & `/api/bookings`)
- `POST /api/payments/create-order` - Create Razorpay order for course, live class, or subscription
- `POST /api/payments/verify` - Verify Razorpay payment signature and activate enrollment
- `POST /api/payments/webhook` - Handle automated payment gateway events
- `GET /api/payments/transactions` - View personal transaction history
- `GET /api/bookings` - Retrieve user's bookings (learner or teacher view)
- `POST /api/bookings/:id/cancel` - Cancel booking and process refund

### Learning Progress & Reviews (`/api/progress` & `/api/reviews`)
- `GET /api/progress/:courseId` - Get student's completed lessons and quiz scores
- `POST /api/lessons/:id/complete` - Mark lesson as finished
- `POST /api/progress/quiz/:id/submit` - Submit quiz answers for grading
- `POST /api/progress/assignment/:id/submit` - Submit assignment work
- `POST /api/reviews` - Submit verified student course review
- `POST /api/reviews/report` - Report inappropriate content for admin review

### Administration (`/api/admin`)
- `GET /api/admin/stats` - Platform aggregate statistics (revenue, users, courses)
- `GET /api/admin/users` - Search and filter registered users
- `PUT /api/admin/users/:id` - Modify user role
- `DELETE /api/admin/users/:id` - Remove user account
- `GET /api/admin/verifications` - View pending teacher verification submissions
- `PUT /api/admin/verifications/:id` - Approve or reject teacher verified badge
- `GET /api/admin/reports` - Review reported content and take moderation actions

---

## 🔒 Security Best Practices
- **Password Protection:** Passwords salted and hashed with `bcryptjs` (cost factor 10).
- **JWT Authorization:** Stateless Bearer tokens with expiration.
- **Role-Based Guards:** Server middleware checks user permissions on all sensitive mutations.
- **Payment Tamper Prevention:** Razorpay payment signatures are validated with cryptographic HMAC-SHA256 before grant of course access.
- **CORS & HTTP Headers:** Configured via `cors` and `helmet` with strict origin allowlists.

---

## 📄 License
This project is licensed under the MIT License. Developed for modern skill sharing, flexible learning, and educator empowerment.

