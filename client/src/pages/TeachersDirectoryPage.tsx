import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import { TeacherProfile, Category } from '../types/index.js';
import { StarRating } from '../components/common/StarRating.js';
import { Search, ShieldCheck, Users, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export const TeachersDirectoryPage: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [rating, setRating] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data.success) setCategories(res.data.data);
      } catch (e) {
        // ignore
      }
    };
    fetchCategories();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 8,
        sort,
      };
      if (search) params.search = search;
      if (category) params.category = category;
      if (minRate) params.minRate = minRate;
      if (maxRate) params.maxRate = maxRate;
      if (rating) params.rating = rating;
      if (verifiedOnly) params.verifiedOnly = 'true';

      const res = await API.get('/teachers', { params });
      if (res.data.success) {
        setTeachers(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalCount(res.data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [search, category, minRate, maxRate, rating, verifiedOnly, sort, page]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" /> Instructor Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Find Verified Instructors & Mentors
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Connect directly with {totalCount} verified subject-matter experts for mentorship, courses, and workshops.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80 flex items-center bg-slate-50 rounded-xl border border-slate-200 px-3 py-2">
              <Search className="w-4 h-4 text-purple-600 mr-2 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search teacher name or skill..."
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent outline-none"
              />
            </div>

            {/* Quick dropdowns */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="text-xs rounded-xl border border-slate-200 p-2 bg-slate-50 text-slate-700 outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 p-2 bg-slate-50 text-slate-700 outline-none"
              >
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="rate_asc">Rate: Low to High</option>
                <option value="rate_desc">Rate: High to Low</option>
              </select>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => {
                    setVerifiedOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Verified Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <Users className="w-10 h-10 text-purple-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No teachers found</h3>
            <p className="text-xs text-slate-500">Try adjusting your category filter or search keywords.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teachers.map((t) => (
                <div
                  key={t._id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 text-center border-b border-slate-100 flex flex-col items-center">
                    <div className="relative mb-3">
                      <img
                        src={t.user?.avatar}
                        alt={t.user?.name}
                        className="w-20 h-20 rounded-2xl object-cover ring-4 ring-purple-50 shadow-md"
                      />
                      {t.verificationStatus === 'verified' && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base hover:text-purple-600 transition">
                      <Link to={`/teachers/${t.user?._id || t._id}`}>{t.user?.name}</Link>
                    </h3>
                    <p className="text-xs text-purple-600 font-semibold mt-0.5 line-clamp-1">
                      {t.title}
                    </p>

                    <div className="mt-2.5">
                      <StarRating rating={t.rating || 5.0} reviewsCount={t.numReviews} size="sm" />
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                        {t.bio}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {t.skills?.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">1-on-1 Rate</span>
                        <span className="text-sm font-bold text-slate-900">₹{t.hourlyRate}/hr</span>
                      </div>
                      <Link
                        to={`/teachers/${t.user?._id || t._id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-600 hover:text-white transition"
                      >
                        Profile
                      </Link>
                    </div>
                  </div>
                </div>
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
  );
};

