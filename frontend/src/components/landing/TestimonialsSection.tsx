"use client";

/**
 * Testimonial quotes from past clients.
 * All quotes are PLACEHOLDERS — replace with real client testimonials.
 */

const TESTIMONIALS = [
  {
    quote:
      "They took our vague idea and turned it into a product that our customers actually love. The whole process was transparent — no surprises, no scope creep.",
    name: "Sarah Chen",
    role: "CEO",
    company: "Nexova",
  },
  {
    quote:
      "Our Shopify app went from concept to app store in under 8 weeks. The team was responsive, technically sharp, and genuinely cared about getting it right.",
    name: "Marcus Rivera",
    role: "Head of Product",
    company: "Stackline",
  },
  {
    quote:
      "We've worked with agencies before, but this was different. Clear communication, realistic timelines, and a final product that exceeded expectations.",
    name: "Emily Nordström",
    role: "Founder",
    company: "Meridian",
  },
];

const HIGHLIGHTS = [
  {
    project: "E-commerce Platform Rebuild",
    result: "3× conversion rate improvement",
    timeline: "10 weeks",
  },
  {
    project: "Shopify Inventory App",
    result: "12,000+ active installs",
    timeline: "8 weeks",
  },
  {
    project: "Healthcare Scheduling App",
    result: "40% reduction in no-shows",
    timeline: "14 weeks",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="px-4 sm:px-6 py-20 sm:py-28 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            What Clients Say
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            We let our work and relationships speak for themselves.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="glass rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
            >
              {/* Quote */}
              <blockquote className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Attribution */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {t.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Case study highlights */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-white mb-6">
            Recent Results
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HIGHLIGHTS.map((h) => (
              <div key={h.project}>
                <div className="text-sm font-medium text-white mb-1">
                  {h.project}
                </div>
                <div className="text-sm text-indigo-400 font-medium mb-0.5">
                  {h.result}
                </div>
                <div className="text-xs text-slate-500">
                  Delivered in {h.timeline}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
