import React from 'react';
import { Link } from 'react-router-dom';
import decorationLogo from '../../assets/Decoration_Logo.png';

interface LogoProps {
  variant?: 'light' | 'dark' | 'gold';
  showTagline?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onlyIcon?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'gold',
  showTagline = true,
  className = '',
  size = 'md',
  onlyIcon = false,
}) => {
  const isLarge = size === 'lg';
  const isXLarge = size === 'xl';
  const isSmall = size === 'sm';

  const badgeSize = isXLarge
    ? 'w-16 h-16'
    : isLarge
    ? 'w-12 h-12'
    : isSmall
    ? 'w-8 h-8'
    : 'w-10 h-10';

  return (
    <Link to="/" className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* Authentic Sathuragiri Decoration Emblem with Brand Artwork */}
      <div
        className={`relative flex items-center justify-center shrink-0 rounded-2xl border border-[#B8955A]/50 bg-gradient-to-br from-white via-[#FAF7F2] to-[#F3ECE2] p-1 shadow-sm group-hover:border-[#B8955A] group-hover:shadow-md transition-all duration-300 overflow-hidden ${badgeSize}`}
      >
        <img
          src={decorationLogo}
          alt="Sathuragiri Decoration Logo"
          className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
          loading="eager"
        />
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8955A] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B8955A]"></span>
        </span>
      </div>

      {!onlyIcon && (
        <div className="flex flex-col">
          <span
            className={`font-serif tracking-wider font-bold uppercase transition-colors duration-300 leading-tight ${
              isXLarge
                ? 'text-3xl'
                : isLarge
                ? 'text-2xl'
                : isSmall
                ? 'text-base'
                : 'text-lg md:text-xl'
            } ${
              variant === 'light'
                ? 'text-white'
                : variant === 'dark'
                ? 'text-[#28231F]'
                : 'text-[#28231F] group-hover:text-[#B8955A]'
            }`}
          >
            Sathuragiri
            <span className="text-[#B8955A] ml-1.5 font-semibold text-xs md:text-sm tracking-widest block sm:inline">
              DECORATION
            </span>
          </span>
          {showTagline && (
            <span
              className={`text-[10px] tracking-widest uppercase font-medium mt-0.5 ${
                variant === 'light' ? 'text-gray-300' : 'text-[#77716B]'
              }`}
            >
              Every Celebration, Beautifully Crafted
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
