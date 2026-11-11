import React from 'react';
import { StarRating } from '../common/StarRating.js';
import { ShieldCheck, Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'David Miller',
      role: 'Learner & Developer',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
      courseName: 'Mastering the Violin with Elena',
      rating: 5,
      comment:
        'Elena’s live workshop broke down bowing technique in a way no YouTube video ever did. Being able to join live and get real-time posture corrections was worth 10x the price.',
    },
    {
      name: 'Sarah Connor',
      role: 'Learner & UX Designer',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
      courseName: 'Artisanal Italian Pasta with Antonio',
      rating: 5,
      comment:
        'Chef Antonio’s dough hydration ratios made my fresh tagliatelle restaurant-quality on the very first try. The integrated video player and downloadable notes made following along effortless.',
    },
    {
      name: 'Marcus Chen',
      role: 'Full-Stack Instructor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      courseName: 'Pro Tier Teacher',
      rating: 5,
      comment:
        'As an engineer, having automated Razorpay payouts, course analytics, and built-in Jitsi conference rooms without managing complex third-party tools allowed me to generate over ₹1.2L in my first 2 months.',
    },
  ];

  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Real Community Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1 tracking-tight">
            Loved by Learners & Trusted by Mentors
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Read verified feedback from students and instructors thriving on SkillSync.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-sm flex flex-col justify-between relative hover:border-purple-200 hover:shadow-md transition"
            >
              <Quote className="w-8 h-8 text-purple-200 absolute top-6 right-6" />
              <div>
                <div className="mb-4">
                  <StarRating rating={t.rating} size="sm" showCount={false} />
                </div>
                <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
                  "{t.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-100"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">{t.name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500">{t.role}</p>
                  <p className="text-[11px] text-purple-600 font-medium truncate max-w-[200px]">
                    {t.courseName}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

