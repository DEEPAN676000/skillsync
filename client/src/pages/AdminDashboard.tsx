import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  Flag,
  DollarSign,
  BookOpen,
  Video,
  FileText,
  Search,
  Check,
  Trash2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'verifications' | 'reports'>('stats');

  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, verRes, repRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/verifications'),
        API.get('/admin/reports'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (verRes.data.success) setVerifications(resSafe(verRes.data.data));
      if (repRes.data.success) setReports(resSafe(repRes.data.data));
    } catch (err) {
      console.error('Failed to load admin console:', err);
    } finally {
      setLoading(false);
    }
  };

  const resSafe = (val: any) => (Array.isArray(val) ? val : []);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerification = async (profileId: string, status: 'verified' | 'rejected', note?: string) => {
    try {
      const res = await API.put(`/admin/verifications/${profileId}`, { status, note });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification update failed');
    }
  };

  const handleReportAction = async (reportId: string, action: 'hide_content' | 'dismiss') => {
    try {
      const res = await API.put(`/admin/reports/${reportId}`, {
        status: action === 'dismiss' ? 'dismissed' : 'resolved',
        actionTaken: action,
        adminNotes: `Resolved by ${user?.name}`,
      });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Report action failed');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await API.put(`/admin/users/${userId}`, { role: newRole });
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await API.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Administrator Center
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">SkillSync Platform Control</h1>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'stats', label: 'Platform Statistics' },
            { id: 'verifications', label: `Teacher Verifications (${verifications.length})` },
            { id: 'reports', label: `Moderation Reports (${reports.length})` },
            { id: 'users', label: `User Management (${users.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Stats */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Users</span>
                <p className="text-3xl font-black text-slate-900">{stats.totalUsers}</p>
                <p className="text-[11px] text-slate-500">
                  {stats.totalTeachers} Teachers • {stats.totalLearners} Learners
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Gross Platform Volume</span>
                <p className="text-3xl font-black text-slate-900">
                  ₹{stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold">Processed via Razorpay</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Courses & Videos</span>
                <p className="text-3xl font-black text-slate-900">
                  {stats.totalCourses + stats.totalVideos}
                </p>
                <p className="text-[11px] text-slate-500">
                  {stats.totalCourses} Masterclasses • {stats.totalVideos} Reels
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Pending Actions</span>
                <p className="text-3xl font-black text-amber-600">
                  {stats.pendingVerifications + stats.pendingReports}
                </p>
                <p className="text-[11px] text-slate-500">
                  {stats.pendingVerifications} Verifications • {stats.pendingReports} Reports
                </p>
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 uppercase tracking-wider">
                Recent Completed Transactions
              </div>
              <div className="divide-y divide-slate-100">
                {stats.recentPayments?.map((p: any) => (
                  <div key={p._id} className="p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={p.user?.avatar} alt={p.user?.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-900">{p.user?.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {p.itemType.toUpperCase()} • Receipt #{p.receipt}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">₹{p.amount}</span>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase">{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Verifications Queue */}
        {activeTab === 'verifications' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 uppercase tracking-wider">
              Instructor Verification Requests
            </div>
            <div className="divide-y divide-slate-100">
              {verifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No pending verification requests.</div>
              ) : (
                verifications.map((item: any) => (
                  <div key={item._id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.user?.avatar}
                        alt={item.user?.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-100"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{item.user?.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.verificationStatus === 'verified'
                                ? 'bg-emerald-50 text-emerald-700'
                                : item.verificationStatus === 'rejected'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {item.verificationStatus}
                          </span>
                        </div>
                        <p className="text-xs text-purple-700 font-semibold">{item.title}</p>
                        <p className="text-xs text-slate-600 max-w-xl">{item.verificationNote || item.bio}</p>

                        {item.verificationDocuments?.map((doc: any, i: number) => (
                          <a
                            key={i}
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-purple-600 font-bold underline mt-1 mr-3"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Document {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleVerification(item._id, 'verified')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleVerification(item._id, 'rejected', 'Document does not meet requirements')}
                        className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Reports Queue */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 uppercase tracking-wider">
              Content Moderation Queue
            </div>
            <div className="divide-y divide-slate-100">
              {reports.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No moderation reports pending.</div>
              ) : (
                reports.map((r: any) => (
                  <div key={r._id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-bold text-[10px] uppercase">
                          Target: {r.targetType}
                        </span>
                        <span className="text-xs text-slate-400">
                          Reported by {r.reporter?.name || 'Anonymous User'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 font-bold">Reason: {r.reason}</p>
                      <p className="text-[11px] text-slate-400">Status: {r.status}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReportAction(r._id, 'hide_content')}
                        className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition"
                      >
                        Hide Content & Resolve
                      </button>
                      <button
                        onClick={() => handleReportAction(r._id, 'dismiss')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
                      >
                        Dismiss Report
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 outline-none"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 p-2 bg-slate-50 text-slate-700 outline-none"
              >
                <option value="all">All Roles</option>
                <option value="learner">Learners</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u: any) => (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-slate-500 text-[11px]">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="text-xs font-semibold rounded-lg border border-slate-200 px-2 py-1 bg-white"
                        >
                          <option value="learner">Learner</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

