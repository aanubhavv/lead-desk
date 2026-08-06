"use client";

/**
 * Client logos as an infinite-scrolling ticker marquee.
 * The track is duplicated so the animation loops seamlessly.
 * Replace the SVG icons with real logo assets when available.
 */

const CLIENTS = [
  {
    name: "Nexova",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M4 4h6v6H4V4z" fill="currentColor" opacity={0.6} />
        <path d="M14 4h6v6h-6V4z" fill="currentColor" opacity={0.4} />
        <path d="M4 14h6v6H4v-6z" fill="currentColor" opacity={0.4} />
        <path d="M14 14h6v6h-6v-6z" fill="currentColor" opacity={0.8} />
      </svg>
    ),
  },
  {
    name: "Pylon Studios",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" stroke="currentColor" strokeWidth={1.5} />
        <path d="M12 7v10M8 9.5l8 5M16 9.5l-8 5" stroke="currentColor" strokeWidth={1} opacity={0.5} />
      </svg>
    ),
  },
  {
    name: "Clearbit",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity={0.7} />
        <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity={0.4} />
        <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity={0.4} />
        <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity={0.7} />
      </svg>
    ),
  },
  {
    name: "Stackline",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <path d="M4 18h16M4 14h12M4 10h14M4 6h10" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Meridian",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.5} />
        <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth={1} opacity={0.5} />
        <circle cx="12" cy="12" r="3" fill="currentColor" opacity={0.6} />
      </svg>
    ),
  },
  {
    name: "Cortex AI",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="3" fill="currentColor" opacity={0.8} />
        <circle cx="12" cy="4" r="2" fill="currentColor" opacity={0.4} />
        <circle cx="12" cy="20" r="2" fill="currentColor" opacity={0.4} />
        <circle cx="5" cy="8" r="2" fill="currentColor" opacity={0.4} />
        <circle cx="19" cy="8" r="2" fill="currentColor" opacity={0.4} />
        <circle cx="5" cy="16" r="2" fill="currentColor" opacity={0.4} />
        <circle cx="19" cy="16" r="2" fill="currentColor" opacity={0.4} />
        <path d="M12 6v4M12 14v4M7 9l3 2M14 13l3 2M7 15l3-2M14 11l3-2" stroke="currentColor" strokeWidth={0.75} opacity={0.3} />
      </svg>
    ),
  },
];

const STATS = [
  { value: "50+", label: "Projects Delivered" },
  { value: "5+", label: "Years Experience" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "24hr", label: "Response Time" },
];

export default function SocialProofBar() {
  const logoSet = CLIENTS.map((client) => (
    <span
      key={client.name}
      className="flex-shrink-0 flex items-center gap-2.5 text-slate-500/60 text-base sm:text-lg font-semibold tracking-tight select-none px-8 sm:px-12"
    >
      {client.icon}
      {client.name}
    </span>
  ));

  return (
    <section className="py-16 sm:py-20 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-xs text-slate-500 text-center uppercase tracking-widest mb-8 font-medium">
          Trusted by teams at
        </p>
      </div>

      {/* Full-width ticker — no max-width constraint */}
      <div className="relative overflow-hidden mb-16 ticker-mask">
        <div className="flex w-max animate-ticker">
          {/* First set */}
          <div className="flex items-center">{logoSet}</div>
          {/* Duplicate for seamless loop */}
          <div className="flex items-center" aria-hidden="true">
            {logoSet}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
