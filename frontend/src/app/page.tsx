import LeadForm from "@/components/LeadForm";
import Link from "next/link";

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
          <Link
            href="/admin/login"
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Hero + Form */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <div className="w-full max-w-xl animate-fade-in">
          {/* Hero text */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              We&apos;re taking new projects
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Let&apos;s build something{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                great together
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-md mx-auto leading-relaxed">
              Tell us about your project and budget. We&apos;ll get back to you within 24 hours with a tailored proposal.
            </p>
          </div>

          {/* Form card */}
          <div className="glass rounded-2xl p-6 sm:p-8 glow">
            <LeadForm />
          </div>
        </div>
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
