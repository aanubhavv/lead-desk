import Link from "next/link";
import HeroSection from "@/components/landing/HeroSection";
import SocialProofBar from "@/components/landing/SocialProofBar";
import ServicesSection from "@/components/landing/ServicesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Nav */}
      <header className="w-full border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Lead<span className="text-indigo-400">Desk</span>
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <a
              href="#services"
              className="hidden sm:inline text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Services
            </a>
            <a
              href="#contact"
              className="hidden sm:inline text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Contact
            </a>
            <Link
              href="/admin/login"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Funnel sections */}
      <main className="flex-1">
        <HeroSection />
        <SocialProofBar />
        <ServicesSection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} LeadDesk</p>
          <p>
            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-400 transition-colors"
            >
              Built for Digital Heroes Training Task
            </a>
          </p>
          <Link
            href="/admin/login"
            className="hover:text-slate-400 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
