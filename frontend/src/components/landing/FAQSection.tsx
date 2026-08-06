"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "What's your typical project timeline?",
    answer:
      "Most projects take between 4 and 12 weeks from kickoff to launch, depending on scope and complexity. We'll give you a realistic timeline in our initial proposal — not an optimistic one we can't hit.",
  },
  {
    question: "How does pricing work?",
    answer:
      "We quote per-project based on scope, not hourly. You'll receive a detailed statement of work with clear deliverables and milestones before any work begins. No hidden fees, no surprise invoices.",
  },
  {
    question: "Do you offer post-launch support?",
    answer:
      "Yes. Every project includes a 30-day bug-fix window after launch. For ongoing work, we offer monthly maintenance and support plans tailored to your needs.",
  },
  {
    question: "What tech stack do you use?",
    answer:
      "We're flexible, but our core stack includes Next.js, React, Node.js, and React Native for mobile. For e-commerce, we build on Shopify's platform. We'll recommend the right tools for your project — not just what's trendy.",
  },
  {
    question: "What if my project scope changes?",
    answer:
      "It happens, and we plan for it. We use an agile process with regular check-ins. If scope changes, we discuss the impact on timeline and budget openly — no surprises.",
  },
];

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base font-medium text-white group-hover:text-indigo-300 transition-colors duration-200 pr-4">
          {question}
        </span>
        <svg
          className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-60 opacity-100 pb-5" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-sm text-slate-400 leading-relaxed pr-8">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  return (
    <section className="px-4 sm:px-6 py-20 sm:py-28 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Common Questions
          </h2>
          <p className="text-slate-400 text-lg">
            Straight answers, no sales pitch.
          </p>
        </div>

        {/* Accordion */}
        <div className="glass rounded-2xl px-6 sm:px-8">
          {FAQ_ITEMS.map((item) => (
            <FAQItem
              key={item.question}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
