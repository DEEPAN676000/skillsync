import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, BookOpen, Users, ArrowRight } from 'lucide-react';
import { Course } from '../../types/index.js';
import { StarRating } from '../common/StarRating.js';

interface TrendingCoursesProps {
  courses: Course[];
}

export const TrendingCourses: React.FC<TrendingCoursesProps> = ({ courses }) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> High-Impact Learning
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trending Masterclasses & Courses
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-xl">
              Comprehensive curriculums with practical lessons, interactive quizzes, and verified certificates.
            </p>
          </div>
          <Link
            to="/explore"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition"
          >
            Explore All Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.slice(0, 4).map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition duration-300 flex flex-col overflow-hidden group"
            >
              {/* Thumbnail Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-[11px] font-bold text-white shadow-sm">
                    {course.category?.name || 'Skill'}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-xs font-black text-purple-700 shadow-sm">
                    {course.price === 0 ? 'FREE' : `₹${course.price}`}
                  </span>
                </div>
              </div>

              {/* Course Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={course.teacher?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                      alt={course.teacher?.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-xs font-medium text-slate-500 truncate">
                      {course.teacher?.name}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-purple-600 transition line-clamp-2 leading-snug">
                    <Link to={`/courses/${course.slug || course._id}`}>{course.title}</Link>
                  </h3>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <StarRating rating={course.rating || 5.0} reviewsCount={course.numReviews} size="sm" />
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-100 font-medium text-[11px]">
                      {course.difficulty?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.lessonsCount || 0} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.enrolledCount || 0} students</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

