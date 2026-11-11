import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  reviewsCount?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  showCount = true,
  reviewsCount,
}) => {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-semibold',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[...Array(maxStars)].map((_, i) => {
          const filled = i < Math.floor(rating);
          const half = !filled && i < rating;
          return (
            <Star
              key={i}
              className={`${iconSizes[size]} ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : half
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-slate-200 fill-slate-100'
              }`}
            />
          );
        })}
      </div>
      {showCount && (
        <span className={`font-bold text-slate-800 ${textSizes[size]}`}>
          {Number(rating).toFixed(1)}
          {reviewsCount !== undefined && (
            <span className="font-normal text-slate-500 ml-1">({reviewsCount})</span>
          )}
        </span>
      )}
    </div>
  );
};

