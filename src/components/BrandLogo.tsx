import React from 'react';
import { useLineBalancing } from '../context/LineContext';

interface BrandLogoProps {
  className?: string;
  imgClassName?: string;
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 bg-neutral-900 border border-neutral-200 dark:border-neutral-700/60 shrink-0 flex items-center justify-center',
  imgClassName = 'w-full h-full object-cover',
  alt = 'AI Production Line Balancer Logo',
}) => {
  const { customLogo } = useLineBalancing();

  if (customLogo) {
    return (
      <div className={className}>
        <img src={customLogo} alt={alt} className={imgClassName} />
      </div>
    );
  }

  return (
    <div className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        fill="none"
        className={imgClassName}
        role="img"
        aria-label={alt}
      >
        <defs>
          <linearGradient id="blBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="blFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="blSparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>

        {/* Base Squircle */}
        <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#blBgGrad)" />
        <rect x="24" y="24" width="464" height="464" rx="108" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="4" />

        {/* Technical Grid Overlay */}
        <g stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1.5">
          <line x1="80" y1="180" x2="432" y2="180" />
          <line x1="80" y1="260" x2="432" y2="260" />
          <line x1="80" y1="340" x2="432" y2="340" />
          <line x1="160" y1="100" x2="160" y2="420" />
          <line x1="256" y1="100" x2="256" y2="420" />
          <line x1="352" y1="100" x2="352" y2="420" />
        </g>

        {/* Factory Silhouette Accent */}
        <path d="M100 190 L100 150 L140 170 L140 150 L180 170 L180 140 L220 140 L220 190 Z" fill="#ffffff" fillOpacity="0.12" />

        {/* Conveyor Assembly Flow Track */}
        <path
          d="M 96 330 C 180 330, 160 210, 256 210 C 352 210, 332 330, 416 330"
          stroke="url(#blFlowGrad)"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 96 330 C 180 330, 160 210, 256 210 C 352 210, 332 330, 416 330"
          stroke="#ffffff"
          strokeWidth="6"
          strokeDasharray="14 10"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.9"
        />

        {/* Workstations / Yamazumi Balance Pillars */}
        {/* WS 1 */}
        <g transform="translate(110, 250)">
          <rect x="-18" y="0" width="36" height="110" rx="10" fill="#ffffff" fillOpacity="0.22" />
          <rect x="-18" y="30" width="36" height="80" rx="10" fill="#38bdf8" />
          <circle cx="0" cy="0" r="14" fill="#38bdf8" stroke="#ffffff" strokeWidth="4" />
        </g>

        {/* WS 2 Bottleneck Target */}
        <g transform="translate(256, 130)">
          <rect x="-22" y="0" width="44" height="230" rx="12" fill="#ffffff" fillOpacity="0.22" />
          <rect x="-22" y="50" width="44" height="180" rx="12" fill="#60a5fa" />
          <circle cx="0" cy="0" r="18" fill="#ffffff" stroke="#2563eb" strokeWidth="6" />
          <circle cx="0" cy="0" r="8" fill="#2563eb" />
        </g>

        {/* WS 3 */}
        <g transform="translate(402, 250)">
          <rect x="-18" y="0" width="36" height="110" rx="10" fill="#ffffff" fillOpacity="0.22" />
          <rect x="-18" y="20" width="36" height="90" rx="10" fill="#34d399" />
          <circle cx="0" cy="0" r="14" fill="#34d399" stroke="#ffffff" strokeWidth="4" />
        </g>

        {/* Takt Time Target Line */}
        <line x1="80" y1="210" x2="432" y2="210" stroke="#f87171" strokeWidth="4" strokeDasharray="8 6" strokeLinecap="round" opacity="0.85" />

        {/* AI Optimization Sparkles */}
        <g transform="translate(370, 110)">
          <path d="M 0 -36 Q 0 0 36 0 Q 0 0 0 36 Q 0 0 -36 0 Q 0 0 0 -36 Z" fill="url(#blSparkleGrad)" />
          <circle cx="0" cy="0" r="6" fill="#ffffff" />
        </g>
        <g transform="translate(420, 160) scale(0.45)">
          <path d="M 0 -36 Q 0 0 36 0 Q 0 0 0 36 Q 0 0 -36 0 Q 0 0 0 -36 Z" fill="#fef08a" />
        </g>
      </svg>
    </div>
  );
};
