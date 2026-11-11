import React from 'react';
import { Link } from 'react-router-dom';
import {
  Music,
  Activity,
  Code,
  Camera,
  Palette,
  Utensils,
  Flame,
  Globe,
  Scissors,
  ArrowRight,
} from 'lucide-react';

interface CategorySliderProps {
  categories: any[];
}

const iconMap: Record<string, React.ReactNode> = {
  Music: <Music className="w-6 h-6 text-purple-600" />,
  Dance: <Activity className="w-6 h-6 text-pink-600" />,
  Programming: <Code className="w-6 h-6 text-blue-600" />,
  Photography: <Camera className="w-6 h-6 text-indigo-600" />,
  'Drawing and Painting': <Palette className="w-6 h-6 text-amber-600" />,
  Cooking: <Utensils className="w-6 h-6 text-orange-600" />,
  Fitness: <Flame className="w-6 h-6 text-red-600" />,
  'Language Learning': <Globe className="w-6 h-6 text-teal-600" />,
  'Arts and Crafts': <Scissors className="w-6 h-6 text-violet-600" />,
};

export const CategorySlider: React.FC<CategorySliderProps> = ({ categories }) => {
  return (
    <section className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Skill Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Explore Popular Disciplines
            </h2>
          </div>
          <Link
            to="/explore"
            className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-purple-600 hover:text-purple-700 transition"
          >
            Browse all categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/explore?category=${cat._id}`}
              className="group p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-white hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col items-start"
            >
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-purple-50 transition transform">
                {iconMap[cat.name] || <Palette className="w-6 h-6 text-purple-600" />}
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-purple-600">
                <span>{cat.courseCount || 0} Courses</span>
                <span>•</span>
                <span>{cat.teacherCount || 0} Teachers</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

