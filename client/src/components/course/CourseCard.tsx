import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { Course } from '../../types/index.js';
import { StarRating } from '../common/StarRating.js';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition duration-300 flex flex-col overflow-hidden group">
      {/* Thumbnail */}
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
          <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-xs font-black text-purple-700 shadow-sm">
            {course.price === 0 ? 'FREE' : `₹${course.price}`}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Teacher */}
          <div className="flex items-center gap-2 mb-2.5">
            <img
              src={
                course.teacher?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
              }
              alt={course.teacher?.name}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
            />
            <span className="text-xs font-semibold text-slate-600 truncate">
              {course.teacher?.name}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-600 transition line-clamp-2 leading-snug">
            <Link to={`/courses/${course.slug || course._id}`}>{course.title}</Link>
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
            {course.description}
          </p>

          <div className="mt-3.5 flex items-center justify-between text-xs text-slate-500">
            <StarRating rating={course.rating || 5.0} reviewsCount={course.numReviews} size="sm" />
            <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 font-medium text-[11px] text-slate-600">
              {course.difficulty?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>{course.lessonsCount || 0} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{Math.round(course.durationMinutes / 60)} hrs</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{course.enrolledCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

