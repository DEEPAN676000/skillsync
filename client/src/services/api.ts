import axios, { AxiosRequestConfig } from 'axios';
import localDataService from './localDataService';

const getBaseURL = () => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }
  return '/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to get current authenticated user from localStorage
const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Route requests through local persistent database when backend is unreachable or throws a network/server failure
async function handleLocalFallback(config: AxiosRequestConfig): Promise<any> {
  const method = (config.method || 'get').toLowerCase();
  const url = (config.url || '').replace(/^\/api/, '');
  let body: any = null;

  if (config.data) {
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      body = config.data;
    }
  }

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?._id || currentUser?.id || 'usr_david';

  console.info(`[SkillSync Offline/Persistent Fallback] Handling ${method.toUpperCase()} ${url}`);

  // 1. Auth routes
  if (url === '/auth/login' && method === 'post') {
    return localDataService.login(body.email, body.password);
  }
  if (url === '/auth/register' && method === 'post') {
    return localDataService.register(body);
  }
  if (url === '/auth/me' && method === 'get') {
    return localDataService.getMe(currentUserId);
  }
  if (url === '/auth/update-profile' && method === 'put') {
    return localDataService.updateProfile(currentUserId, body);
  }
  if (url === '/auth/change-password' && method === 'put') {
    return { success: true, message: 'Password changed successfully' };
  }
  if (url === '/auth/forgot-password' && method === 'post') {
    return { success: true, message: 'Password reset link sent to your email.' };
  }
  if (url.startsWith('/auth/reset-password') && method === 'post') {
    return { success: true, message: 'Password reset successfully. Please log in.' };
  }

  // 2. Categories
  if (url === '/categories' && method === 'get') {
    return localDataService.getCategories();
  }

  // 3. Courses
  if (url === '/courses' && method === 'get') {
    return localDataService.getCourses(config.params);
  }
  if (url === '/courses' && method === 'post') {
    return localDataService.createCourse(body, currentUser);
  }
  if (url.match(/^\/courses\/[^/]+$/) && method === 'get') {
    const id = url.split('/')[2];
    return localDataService.getCourseById(id, currentUserId);
  }
  if (url.match(/^\/courses\/[^/]+$/) && method === 'put') {
    const id = url.split('/')[2];
    return localDataService.updateCourse(id, body);
  }
  if (url.match(/^\/courses\/[^/]+$/) && method === 'delete') {
    const id = url.split('/')[2];
    return localDataService.deleteCourse(id);
  }
  if (url.match(/^\/courses\/[^/]+\/lessons$/) && method === 'post') {
    const courseId = url.split('/')[2];
    return localDataService.addLesson(courseId, body);
  }

  // 4. Lessons
  if (url.match(/^\/lessons\/[^/]+\/complete$/) && method === 'post') {
    const lessonId = url.split('/')[2];
    return localDataService.markLessonComplete(lessonId, currentUserId);
  }

  // 5. Teachers
  if (url === '/teachers' && method === 'get') {
    return localDataService.getTeachers(config.params);
  }
  if (url.match(/^\/teachers\/[^/]+$/) && method === 'get') {
    const id = url.split('/')[2];
    return localDataService.getTeacherById(id);
  }
  if (url === '/teachers/profile' && method === 'put') {
    return localDataService.updateTeacherProfile(currentUserId, body);
  }
  if (url === '/teachers/verify-request' && method === 'post') {
    return { success: true, message: 'Verification application submitted for review' };
  }

  // 6. Videos
  if (url === '/videos' && method === 'get') {
    return localDataService.getVideos(config.params);
  }
  if (url === '/videos' && method === 'post') {
    return localDataService.createVideo(body, currentUser);
  }
  if (url.match(/^\/videos\/[^/]+\/like$/) && method === 'post') {
    const videoId = url.split('/')[2];
    return localDataService.toggleLikeVideo(videoId, currentUserId);
  }
  if (url.match(/^\/videos\/[^/]+\/save$/) && method === 'post') {
    return { success: true, saved: true };
  }

  // 7. Live Classes
  if (url === '/live-classes' && method === 'get') {
    return localDataService.getLiveClasses(config.params);
  }
  if (url === '/live-classes' && method === 'post') {
    return localDataService.createLiveClass(body, currentUser);
  }
  if (url.match(/^\/live-classes\/[^/]+$/) && method === 'get') {
    const id = url.split('/')[2];
    return localDataService.getLiveClassById(id, currentUserId);
  }

  // 8. Bookings & Payments
  if (url === '/payments/create-order' && method === 'post') {
    return localDataService.createOrder(body, currentUser);
  }
  if (url === '/payments/verify' && method === 'post') {
    return localDataService.verifyPayment(body, currentUser);
  }
  if (url === '/bookings' && method === 'get') {
    const db = localDataService.getDatabase();
    return { success: true, data: db.bookings };
  }
  if (url === '/payments/transactions' && method === 'get') {
    const db = localDataService.getDatabase();
    return { success: true, data: db.payments };
  }

  // 9. Subscriptions
  if (url === '/subscriptions/plans' && method === 'get') {
    return {
      success: true,
      data: [
        {
          id: 'basic',
          name: 'Basic Starter',
          price: 0,
          billingCycle: 'Free Forever',
          description: 'Ideal for new instructors starting out.',
          features: [
            'Free teacher profile',
            'Up to 3 published courses',
            'Up to 5 skill showcase videos',
            'Standard search discovery',
            '15% platform commission',
            'Basic learner messaging',
          ],
        },
        {
          id: 'premium',
          name: 'Instructor Premium',
          price: 999,
          billingCycle: 'per month',
          description: 'Accelerate your teaching career and reach thousands of students.',
          popular: true,
          features: [
            'Verified instructor badge eligibility',
            'Up to 15 published courses',
            'Up to 30 skill showcase videos',
            'Priority category search placement',
            '10% platform commission',
            'Live group classes up to 50 students',
            'Student assignment grading tools',
          ],
        },
        {
          id: 'pro',
          name: 'Master Pro',
          price: 2499,
          billingCycle: 'per month',
          description: 'Top-tier visibility, advanced analytics, and lowest commission.',
          features: [
            'Top homepage & search spotlight',
            'Up to 50 published courses',
            'Up to 100 skill showcase videos',
            'Lowest 5% platform commission',
            'Advanced revenue & retention analytics',
            'Custom 1-on-1 booking slots',
            'Priority 24/7 dedicated support',
          ],
        },
      ],
    };
  }
  if (url === '/subscriptions/my-subscription' && method === 'get') {
    return {
      success: true,
      data: {
        plan: 'pro',
        status: 'active',
        features: {
          maxCourses: 50,
          maxVideos: 100,
          commissionRate: 5,
          priorityDiscovery: true,
          analyticsEnabled: true,
        },
      },
    };
  }

  // 10. Reviews & Reports
  if (url === '/reviews' && method === 'post') {
    return localDataService.createReview(body, currentUser);
  }
  if (url === '/reviews/report' && method === 'post') {
    return { success: true, message: 'Report submitted successfully' };
  }

  // 11. Dashboards
  if (url === '/users/learner-dashboard' && method === 'get') {
    return localDataService.getLearnerDashboard(currentUserId);
  }
  if (url === '/users/teacher-dashboard' && method === 'get') {
    return localDataService.getTeacherDashboard(currentUserId);
  }
  if (url.match(/^\/users\/bookmark-course\/[^/]+$/) && method === 'post') {
    return { success: true, bookmarked: true };
  }

  // 12. Admin
  if (url === '/admin/stats' && method === 'get') {
    return localDataService.getAdminStats();
  }
  if (url === '/admin/users' && method === 'get') {
    return { success: true, data: localDataService.getDatabase().users };
  }
  if (url === '/admin/verifications' && method === 'get') {
    return { success: true, data: localDataService.getDatabase().teacherProfiles };
  }
  if (url === '/admin/reports' && method === 'get') {
    return { success: true, data: localDataService.getDatabase().reports };
  }

  // 13. Notifications
  if (url === '/notifications' && method === 'get') {
    const list = localDataService.getDatabase().notifications;
    return { success: true, data: list, unreadCount: list.filter((n: any) => !n.isRead).length };
  }
  if (url.match(/^\/notifications\/[^/]+\/read$/) && method === 'put') {
    return { success: true };
  }
  if ((url === '/notifications/read-all' || url === '/notifications/mark-all-read') && method === 'put') {
    return { success: true, message: 'All notifications marked as read' };
  }

  // 14. File/Image Upload
  if (url === '/upload' && method === 'post') {
    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
        public_id: `upload_${Date.now()}`,
      },
    };
  }

  // Fallback default
  return { success: true, data: [] };
}

// Response interceptor: handle 401 unauthorized or fallback gracefully on connection failure
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If unauthorized and has expired token, remove it
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('token') && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-logout'));
      }
      return Promise.reject(error);
    }

    // If server is not running or network failed, fallback to localDataService
    if (!error.response || [404, 500, 502, 503, 504].includes(error.response.status)) {
      try {
        const fallbackData = await handleLocalFallback(error.config);
        if (fallbackData !== undefined) {
          return {
            data: fallbackData,
            status: 200,
            statusText: 'OK (Persistent LocalStorage)',
            headers: {},
            config: error.config,
          };
        }
      } catch (fallbackError: any) {
        return Promise.reject(new Error(fallbackError.message || 'Operation failed'));
      }
    }

    return Promise.reject(error);
  }
);

export default API;
