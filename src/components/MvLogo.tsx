import React from 'react';

interface MvLogoProps {
  className?: string;
  size?: number;
}

export const MvLogo: React.FC<MvLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient id="mvBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0b0f19" />
        </linearGradient>

        {/* Squircle Border Gradient */}
        <linearGradient id="mvBorderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        {/* Primary MV Neon Gradient */}
        <linearGradient id="mvNeonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="60%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        {/* Shield Glow Filter */}
        <filter id="mvGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Squircle Background Base */}
      <rect
        x="6"
        y="6"
        width="108"
        height="108"
        rx="26"
        fill="url(#mvBgGradient)"
        stroke="url(#mvBorderGradient)"
        strokeWidth="3.5"
        strokeOpacity="0.8"
      />

      {/* Subtle Document Header Silhouette */}
      <path
        d="M48 24H68C71.3137 24 74 26.6863 74 30V38H46V30C46 26.6863 48.6863 24 52 24Z"
        fill="#38bdf8"
        fillOpacity="0.18"
      />
      <line x1="52" y1="31" x2="68" y2="31" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="52" y1="36" x2="64" y2="36" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />

      {/* Stylized "M" Monogram */}
      <path
        d="M28 84V44L52 68L66 54L80 68L92 56V84"
        stroke="url(#mvNeonGradient)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#mvGlow)"
      />

      {/* Stylized Descending "V" & Checkmark Anchor */}
      <path
        d="M44 68L60 96L76 68"
        stroke="#38bdf8"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cryptographic Shield Badge with Checkmark */}
      <g transform="translate(68, 56) scale(0.48)">
        {/* Shield Shape */}
        <path
          d="M30 4L54 14V34C54 52 30 64 30 64C30 64 6 52 6 34V14L30 4Z"
          fill="#1e3a8a"
          fillOpacity="0.85"
          stroke="#38bdf8"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Shield Checkmark */}
        <path
          d="M18 32L26 40L42 22"
          stroke="#ffffff"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
