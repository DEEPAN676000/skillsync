import React from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface BadgeProps {
  type?: 'verified' | 'pro' | 'premium' | 'basic' | 'warning' | 'neutral';
  text?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  type = 'neutral',
  text,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (type === 'verified') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full ${sizeClasses} ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        {text || 'Verified Teacher'}
      </span>
    );
  }

  if (type === 'pro') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-full ${sizeClasses} ${className}`}
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
        {text || 'PRO'}
      </span>
    );
  }

  if (type === 'premium') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full ${sizeClasses} ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
        {text || 'PREMIUM'}
      </span>
    );
  }

  if (type === 'warning') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full ${sizeClasses} ${className}`}
      >
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        {text || 'Pending'}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium text-slate-600 bg-slate-100 rounded-full ${sizeClasses} ${className}`}
    >
      {text}
    </span>
  );
};

