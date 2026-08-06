import LeadForm from "@/components/LeadForm";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="px-4 sm:px-6 py-20 sm:py-28 border-t border-white/5"
    >
      <div className="max-w-xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Start Your Project
          </h2>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Tell us about your project and budget. We&apos;ll get back to you
            within 24 hours with a tailored proposal.
          </p>
        </div>

        {/* Form card */}
        <div className="glass rounded-2xl p-6 sm:p-8 glow">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
