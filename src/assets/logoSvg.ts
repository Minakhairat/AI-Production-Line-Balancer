/**
 * Default Engineered Logo Vector Definition and Data URI
 * Embedded directly so it works 100% reliably on GitHub Pages, Cloud Run,
 * and custom sub-paths without network requests or relative path 404 issues.
 */

export const DEFAULT_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="appLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
    <linearGradient id="appLogoFlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#60a5fa" />
      <stop offset="100%" stop-color="#34d399" />
    </linearGradient>
    <linearGradient id="appLogoSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#facc15" />
      <stop offset="100%" stop-color="#fb923c" />
    </linearGradient>
  </defs>
  <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#appLogoBg)" />
  <rect x="24" y="24" width="464" height="464" rx="108" stroke="#ffffff" stroke-opacity="0.22" stroke-width="4" />
  <g stroke="#ffffff" stroke-opacity="0.08" stroke-width="1.5">
    <line x1="80" y1="180" x2="432" y2="180" />
    <line x1="80" y1="260" x2="432" y2="260" />
    <line x1="80" y1="340" x2="432" y2="340" />
    <line x1="160" y1="100" x2="160" y2="420" />
    <line x1="256" y1="100" x2="256" y2="420" />
    <line x1="352" y1="100" x2="352" y2="420" />
  </g>
  <path d="M100 190 L100 150 L140 170 L140 150 L180 170 L180 140 L220 140 L220 190 Z" fill="#ffffff" fill-opacity="0.12" />
  <path d="M 96 330 C 180 330, 160 210, 256 210 C 352 210, 332 330, 416 330" 
        stroke="url(#appLogoFlow)" stroke-width="18" stroke-linecap="round" fill="none" />
  <path d="M 96 330 C 180 330, 160 210, 256 210 C 352 210, 332 330, 416 330" 
        stroke="#ffffff" stroke-width="6" stroke-dasharray="14 10" stroke-linecap="round" fill="none" stroke-opacity="0.9" />
  <g transform="translate(110, 250)">
    <rect x="-18" y="0" width="36" height="110" rx="10" fill="#ffffff" fill-opacity="0.22" />
    <rect x="-18" y="30" width="36" height="80" rx="10" fill="#38bdf8" />
    <circle cx="0" cy="0" r="14" fill="#38bdf8" stroke="#ffffff" stroke-width="4" />
  </g>
  <g transform="translate(256, 130)">
    <rect x="-22" y="0" width="44" height="230" rx="12" fill="#ffffff" fill-opacity="0.22" />
    <rect x="-22" y="50" width="44" height="180" rx="12" fill="#60a5fa" />
    <circle cx="0" cy="0" r="18" fill="#ffffff" stroke="#2563eb" stroke-width="6" />
    <circle cx="0" cy="0" r="8" fill="#2563eb" />
  </g>
  <g transform="translate(402, 250)">
    <rect x="-18" y="0" width="36" height="110" rx="10" fill="#ffffff" fill-opacity="0.22" />
    <rect x="-18" y="20" width="36" height="90" rx="10" fill="#34d399" />
    <circle cx="0" cy="0" r="14" fill="#34d399" stroke="#ffffff" stroke-width="4" />
  </g>
  <line x1="80" y1="210" x2="432" y2="210" stroke="#f87171" stroke-width="4" stroke-dasharray="8 6" stroke-linecap="round" opacity="0.85" />
  <g transform="translate(370, 110)">
    <path d="M 0 -36 Q 0 0 36 0 Q 0 0 0 36 Q 0 0 -36 0 Q 0 0 0 -36 Z" fill="url(#appLogoSparkle)" />
    <circle cx="0" cy="0" r="6" fill="#ffffff" />
  </g>
  <g transform="translate(420, 160) scale(0.45)">
    <path d="M 0 -36 Q 0 0 36 0 Q 0 0 0 36 Q 0 0 -36 0 Q 0 0 0 -36 Z" fill="#fef08a" />
  </g>
</svg>`;

export const DEFAULT_LOGO_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(DEFAULT_LOGO_SVG)}`;
