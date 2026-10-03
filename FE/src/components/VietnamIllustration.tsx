// Tranh minh họa nhỏ ở cuối sidebar: núi, mái chùa, cây.
export default function VietnamIllustration({ width = 200 }: { width?: number }) {
  return (
    <svg width={width} viewBox="0 0 200 120" role="img" aria-label="Khám phá Việt Nam" fill="none">
      <ellipse cx="100" cy="108" rx="92" ry="8" fill="#DDF3E8" />
      <path d="M8 104 L52 44 L84 84 L112 52 L152 104 Z" fill="#CDEBDD" />
      <path d="M40 104 L78 60 L108 104 Z" fill="#A8DEC4" />
      <circle cx="160" cy="30" r="12" fill="#FFE7A8" />
      {/* mái chùa */}
      <rect x="62" y="78" width="60" height="26" fill="#F4FBF7" stroke="#5CC49A" strokeWidth="2" />
      <path d="M54 80 Q92 50 130 80 Z" fill="#43B88B" />
      <path d="M66 70 Q92 46 118 70 Z" fill="#6FD0A7" />
      <rect x="86" y="88" width="12" height="16" rx="2" fill="#5CC49A" />
      <rect x="68" y="86" width="9" height="9" rx="1" fill="#BFE8D4" />
      <rect x="107" y="86" width="9" height="9" rx="1" fill="#BFE8D4" />
      {/* cây */}
      <rect x="150" y="84" width="5" height="20" fill="#8A6A4F" />
      <circle cx="152" cy="74" r="16" fill="#4CBF8F" />
      <circle cx="140" cy="84" r="10" fill="#6FD0A7" />
      <rect x="28" y="88" width="4" height="16" fill="#8A6A4F" />
      <circle cx="30" cy="80" r="11" fill="#6FD0A7" />
    </svg>
  );
}
