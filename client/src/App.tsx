import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { Navbar } from './components/common/Navbar.js';
import { Footer } from './components/common/Footer.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';

// Pages
import { LandingPage } from './pages/LandingPage.js';
import { ExploreCoursesPage } from './pages/ExploreCoursesPage.js';
import { CourseDetailPage } from './pages/CourseDetailPage.js';
import { CourseLearnPage } from './pages/CourseLearnPage.js';
import { TeachersDirectoryPage } from './pages/TeachersDirectoryPage.js';
import { TeacherProfilePage } from './pages/TeacherProfilePage.js';
import { ShowcaseFeedPage } from './pages/ShowcaseFeedPage.js';
import { LiveClassesPage } from './pages/LiveClassesPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { ResetPasswordPage } from './pages/ResetPasswordPage.js';
import { LearnerDashboard } from './pages/LearnerDashboard.js';
import { TeacherDashboard } from './pages/TeacherDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isLearnPage = location.pathname.startsWith('/learn/');

  return (
    <div className="flex flex-col min-h-screen">
      {!isLearnPage && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExploreCoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route
            path="/learn/:id"
            element={
              <ProtectedRoute roles={['learner', 'teacher', 'admin']}>
                <CourseLearnPage />
              </ProtectedRoute>
            }
          />
          <Route path="/teachers" element={<TeachersDirectoryPage />} />
          <Route path="/teachers/:id" element={<TeacherProfilePage />} />
          <Route path="/showcase" element={<ShowcaseFeedPage />} />
          <Route path="/live" element={<LiveClassesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Role-Protected Dashboards */}
          <Route
            path="/dashboard/learner"
            element={
              <ProtectedRoute roles={['learner', 'admin']}>
                <LearnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/teacher"
            element={
              <ProtectedRoute roles={['teacher', 'admin']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>
      {!isLearnPage && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

