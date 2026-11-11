import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Category } from '../../types/index.js';

interface CourseFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;
  difficulty: string;
  onDifficultyChange: (val: string) => void;
  rating: string;
  onRatingChange: (val: string) => void;
  sort: string;
  onSortChange: (val: string) => void;
  onReset: () => void;
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  difficulty,
  onDifficultyChange,
  rating,
  onRatingChange,
  sort,
  onSortChange,
  onReset,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-purple-600" /> Filter Courses
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-purple-600 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Sort By
        </label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest Added</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Category
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === ''
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onSelectCategory(cat._id)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                selectedCategory === cat._id
                  ? 'bg-purple-50 text-purple-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{cat.name}</span>
              {cat.courseCount !== undefined && (
                <span className="text-[10px] text-slate-400">({cat.courseCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Price Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min (₹)"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          <input
            type="number"
            placeholder="Max (₹)"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-slate-50 outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Difficulty
        </label>
        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/20"
        >
          <option value="all">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Minimum Rating
        </label>
        <select
          value={rating}
          onChange={(e) => onRatingChange(e.target.value)}
          className="w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/20"
        >
          <option value="">Any Rating</option>
          <option value="4.5">4.5★ & above</option>
          <option value="4.0">4.0★ & above</option>
          <option value="3.5">3.5★ & above</option>
        </select>
      </div>
    </div>
  );
};

