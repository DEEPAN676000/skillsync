import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import { Hero } from '../components/home/Hero.js';
import { CategorySlider } from '../components/home/CategorySlider.js';
import { FeaturedTeachers } from '../components/home/FeaturedTeachers.js';
import { TrendingCourses } from '../components/home/TrendingCourses.js';
import { HowItWorks } from '../components/home/HowItWorks.js';
import { Testimonials } from '../components/home/Testimonials.js';
import { Category, Course, TeacherProfile } from '../types/index.js';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, teachRes, courseRes] = await Promise.all([
          API.get('/categories'),
          API.get('/teachers?limit=4'),
          API.get('/courses?limit=4&sort=popular'),
        ]);

        if (catRes.data.success) setCategories(catRes.data.data);
        if (teachRes.data.success) setTeachers(teachRes.data.data);
        if (courseRes.data.success) setCourses(courseRes.data.data);
      } catch (err) {
        console.error('Error fetching landing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      <CategorySlider categories={categories} />
      <FeaturedTeachers teachers={teachers} />
      <TrendingCourses courses={courses} />
      <HowItWorks />
      <Testimonials />

      {/* Bottom CTA Banner */}
      <section className="py-20 bg-gradient-brand text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Discover or Share Your Talent?
          </h2>
          <p className="text-purple-100 text-base sm:text-lg max-w-2xl mx-auto">
            Join thousands of skilled teachers and eager learners on SkillSync today. Setup takes under 2 minutes.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base text-purple-900 bg-white hover:bg-slate-100 shadow-xl transition"
            >
              Start Learning Now
            </Link>
            <Link
              to="/register?role=teacher"
              className="px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white border-2 border-white/80 hover:bg-white/10 transition"
            >
              Become a Verified Teacher
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

