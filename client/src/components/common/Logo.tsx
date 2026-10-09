import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'gold';
  showTagline?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'gold',
  showTagline = true,
  className = '',
  size = 'md',
}) => {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Decorative Brand Crest Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 rounded-full border border-[#B8955A]/40 bg-white/80 p-1.5 shadow-sm group-hover:border-[#B8955A] group-hover:shadow-luxury transition-all duration-300 ${
        isLarge ? 'w-12 h-12' : isSmall ? 'w-8 h-8' : 'w-10 h-10'
      }`}>
        <Sparkles className={`text-[#B8955A] transition-transform duration-500 group-hover:rotate-12 ${
          isLarge ? 'w-6 h-6' : isSmall ? 'w-4 h-4' : 'w-5 h-5'
        }`} />
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8955A] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B8955A]"></span>
        </span>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-serif tracking-wider font-bold uppercase transition-colors duration-300 leading-none ${
            isLarge ? 'text-2xl' : isSmall ? 'text-base' : 'text-lg md:text-xl'
          } ${
            variant === 'light'
              ? 'text-white'
              : variant === 'dark'
              ? 'text-[#24211F]'
              : 'text-[#24211F] group-hover:text-[#B8955A]'
          }`}
        >
          Sathuragiri
          <span className="text-[#B8955A] ml-1 font-semibold text-xs md:text-sm tracking-widest block sm:inline">DECORATION</span>
        </span>
        {showTagline && (
          <span className={`text-[10px] tracking-widest uppercase font-medium mt-0.5 ${
            variant === 'light' ? 'text-gray-300' : 'text-[#77716B]'
          }`}>
            Every Celebration, Beautifully Crafted
          </span>
        )}
      </div>
    </Link>
  );
};
