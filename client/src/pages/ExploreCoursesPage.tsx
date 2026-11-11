import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api.js';
import { Course, Category } from '../types/index.js';
import { CourseCard } from '../components/course/CourseCard.js';
import { CourseFilters } from '../components/course/CourseFilters.js';
import { Search, Compass, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export const ExploreCoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state initialized from URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || 'all');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'popular');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 9,
        sort,
      };

      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (difficulty && difficulty !== 'all') params.difficulty = difficulty;
      if (rating) params.rating = rating;

      const res = await API.get('/courses', { params });
      if (res.data.success) {
        setCourses(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalCount(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, category, minPrice, maxPrice, difficulty, rating, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setDifficulty('all');
    setRating('');
    setSort('popular');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" /> Skill Discovery Marketplace
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Explore Courses & Skills
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover {totalCount} production-grade masterclasses taught by verified practitioners.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200/80 p-2 flex items-center">
            <Search className="w-5 h-5 text-purple-600 ml-3 mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by skill name, course title, or keywords..."
              className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none pr-3"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-slate-400 hover:text-slate-600 mr-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <CourseFilters
              categories={categories}
              selectedCategory={category}
              onSelectCategory={(id) => {
                setCategory(id);
                setPage(1);
              }}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={(val) => {
                setMinPrice(val);
                setPage(1);
              }}
              onMaxPriceChange={(val) => {
                setMaxPrice(val);
                setPage(1);
              }}
              difficulty={difficulty}
              onDifficultyChange={(val) => {
                setDifficulty(val);
                setPage(1);
              }}
              rating={rating}
              onRatingChange={(val) => {
                setRating(val);
                setPage(1);
              }}
              sort={sort}
              onSortChange={(val) => setSort(val)}
              onReset={handleResetFilters}
            />
          </div>

          {/* Courses Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No courses match your filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your search query or adjusting your price and difficulty filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

