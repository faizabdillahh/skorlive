// components/icons/SportIcons.tsx — Custom SVG icons untuk 5 cabang olahraga

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function FootballIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Sepak Bola"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      {/* Pentagon center */}
      <polygon points="12,7 15.5,9.5 14.2,13.5 9.8,13.5 8.5,9.5" fill="currentColor" stroke="none" opacity="0.3" />
      <polygon points="12,7 15.5,9.5 14.2,13.5 9.8,13.5 8.5,9.5" />
      {/* Lines from pentagon to edge */}
      <line x1="12" y1="7" x2="12" y2="2" />
      <line x1="15.5" y1="9.5" x2="20" y2="8" />
      <line x1="14.2" y1="13.5" x2="17.5" y2="17.5" />
      <line x1="9.8" y1="13.5" x2="6.5" y2="17.5" />
      <line x1="8.5" y1="9.5" x2="4" y2="8" />
    </svg>
  );
}

export function BasketballIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Basket"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      {/* Vertical center line */}
      <line x1="12" y1="2" x2="12" y2="22" />
      {/* Horizontal center line */}
      <line x1="2" y1="12" x2="22" y2="12" />
      {/* Left arc */}
      <path d="M 2 12 Q 7 5 12 12 Q 7 19 2 12" />
      {/* Right arc */}
      <path d="M 22 12 Q 17 5 12 12 Q 17 19 22 12" />
    </svg>
  );
}

export function FutsalIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Futsal"
      {...props}
    >
      {/* Goal post */}
      <rect x="2" y="8" width="20" height="12" rx="1" />
      <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="2 2" />
      {/* Net lines */}
      <line x1="5.5" y1="12" x2="5.5" y2="20" />
      <line x1="9" y1="12" x2="9" y2="20" />
      <line x1="12.5" y1="12" x2="12.5" y2="20" />
      <line x1="16" y1="12" x2="16" y2="20" />
      <line x1="19" y1="12" x2="19" y2="20" />
      {/* Ball */}
      <circle cx="12" cy="5" r="3" />
      <path d="M10 4 Q12 2 14 4" strokeWidth="1" />
    </svg>
  );
}

export function VolleyballIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Voli"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      {/* Three curved panels */}
      <path d="M 12 2 Q 18 7 18 12 Q 18 17 12 22" />
      <path d="M 12 2 Q 6 7 6 12 Q 6 17 12 22" />
      {/* Horizontal mid arc */}
      <path d="M 2.5 9 Q 12 13 21.5 9" />
    </svg>
  );
}

export function BadmintonIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Badminton"
      {...props}
    >
      {/* Racket handle */}
      <line x1="15" y1="15" x2="21" y2="21" strokeWidth="2" />
      {/* Racket head (oval) */}
      <ellipse cx="10" cy="10" rx="7" ry="8" transform="rotate(-30 10 10)" />
      {/* Strings horizontal */}
      <line x1="5" y1="8" x2="15" y2="6" strokeWidth="0.8" />
      <line x1="4" y1="11" x2="16" y2="9" strokeWidth="0.8" />
      <line x1="5" y1="14" x2="15" y2="12" strokeWidth="0.8" />
      {/* Strings vertical */}
      <line x1="7" y1="4" x2="6" y2="16" strokeWidth="0.8" />
      <line x1="10" y1="3" x2="9" y2="15" strokeWidth="0.8" />
      <line x1="13" y1="4" x2="12" y2="14" strokeWidth="0.8" />
    </svg>
  );
}

// Komponen universal — pilih icon berdasarkan sport type
import type { SportType } from '@/types/core';

export function SportIcon({
  sport,
  size = 24,
  className,
  style,
}: {
  sport: SportType;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const commonProps = { size, className, style };
  switch (sport) {
    case 'football':
      return <FootballIcon {...commonProps} />;
    case 'basketball':
      return <BasketballIcon {...commonProps} />;
    case 'futsal':
      return <FutsalIcon {...commonProps} />;
    case 'volleyball':
      return <VolleyballIcon {...commonProps} />;
    case 'badminton':
      return <BadmintonIcon {...commonProps} />;
  }
}
