// Ben Kimim? kart türü çizimleri: tek renk (beyaz), farklı saydamlıkta katmanlar.
const A = {
  'Türk ünlü': (
    <>
      <path d="M78 14 A46 46 0 1 0 78 106 A36 36 0 1 1 78 14Z" opacity=".5" />
      <polygon points="92,38 97,52 112,52 100,61 105,75 92,66 79,75 84,61 72,52 87,52" opacity=".75" />
    </>
  ),
  'Tarihten': (
    <>
      <polygon points="8,42 60,12 112,42" opacity=".6" />
      {[20, 44, 68, 92].map((x) => <rect key={x} x={x} y="48" width="12" height="50" opacity=".42" />)}
      <rect x="8" y="100" width="104" height="10" opacity=".6" />
    </>
  ),
  'Bilim ve sanat': (
    <>
      {[0, 60, 120].map((r) => <ellipse key={r} cx="60" cy="60" rx="50" ry="18" fill="none" stroke="currentColor" strokeWidth="6" opacity=".5" transform={`rotate(${r} 60 60)`} />)}
      <circle cx="60" cy="60" r="10" opacity=".8" />
    </>
  ),
  'Müzik': (
    <>
      <ellipse cx="38" cy="92" rx="18" ry="13" opacity=".6" transform="rotate(-20 38 92)" />
      <rect x="50" y="22" width="9" height="68" opacity=".6" />
      <path d="M59 22 Q96 28 92 62 Q80 46 59 46Z" opacity=".45" />
    </>
  ),
  'Sporcu': (
    <>
      <circle cx="60" cy="60" r="46" opacity=".32" />
      <polygon points="60,36 82,52 74,78 46,78 38,52" opacity=".7" />
      <path d="M60 36V14M82 52l22-8M74 78l14 18M46 78L32 96M38 52L16 44" stroke="currentColor" strokeWidth="5" opacity=".5" />
    </>
  ),
  'Çizgi film': (
    <>
      <circle cx="32" cy="34" r="20" opacity=".5" />
      <circle cx="88" cy="34" r="20" opacity=".5" />
      <circle cx="60" cy="70" r="36" opacity=".38" />
      <circle cx="48" cy="64" r="5" opacity=".85" />
      <circle cx="72" cy="64" r="5" opacity=".85" />
      <ellipse cx="60" cy="80" rx="8" ry="6" opacity=".85" />
    </>
  ),
  'Film ve dizi': (
    <>
      <rect x="12" y="52" width="96" height="54" rx="4" opacity=".4" />
      <path d="M10 46 L6 22 L102 6 L106 30Z" opacity=".65" />
      <path d="M30 42l-5-18M52 38l-5-18M74 34l-5-18M96 30l-5-18" stroke="currentColor" strokeWidth="7" opacity=".4" />
      <polygon points="52,66 52,94 78,80" opacity=".8" />
    </>
  ),
  'Hayvan': (
    <>
      <ellipse cx="60" cy="84" rx="26" ry="22" opacity=".55" />
      {[[26, 56], [46, 34], [74, 34], [94, 56]].map(([x, y]) => <ellipse key={x} cx={x} cy={y} rx="11" ry="14" opacity=".5" />)}
    </>
  ),
  'Meslek': (
    <g transform="rotate(35 60 60)">
      <path fillRule="evenodd" opacity=".6" d="M60 8a26 26 0 1 0 .01 0ZM51 4h18v32H51Z" />
      <rect x="51" y="52" width="18" height="62" rx="9" opacity=".5" />
    </g>
  ),
};

export default function KimimArt({ cat }) {
  return (
    <svg className="km-art" viewBox="0 0 120 120" fill="currentColor" aria-hidden="true" focusable="false">
      {A[cat] || <text x="60" y="88" textAnchor="middle" fontSize="80" fontWeight="800" opacity=".5">?</text>}
    </svg>
  );
}
