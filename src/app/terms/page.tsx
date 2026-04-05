export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 md:p-12 rounded-3xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
          <h1 className="text-3xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Terms of Service</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-faint)' }}>Last updated: March 17, 2026</p>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {[
              { title: '1. About PrimeJar', content: 'PrimeJar is an online marketplace platform that connects event organizers with event professionals and workers. We provide the technology infrastructure that enables organizers to find, hire, and manage event manpower — including photographers, videographers, DJs, decorators, caterers, lighting technicians, makeup artists, and event assistants — directly, without middlemen.' },
              { title: '2. Eligibility', content: 'You must be at least 18 years of age to use PrimeJar. By registering an account, you confirm that you are of legal age and that all information provided during registration is accurate and complete.' },
              { title: '3. User Accounts', content: 'PrimeJar offers two types of user accounts: Event Professionals (Workers) who offer their services for events, and Event Organizers who hire event professionals. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.' },
              { title: '4. Platform Usage', content: 'PrimeJar serves as a connection platform. We do not employ event workers nor do we organize events ourselves. All agreements for work are between the organizer and the worker. PrimeJar is not responsible for the quality of work, disputes, or payment issues between parties.' },
              { title: '5. Payments', content: 'PrimeJar currently operates as a connection platform. All payment negotiations and transactions are conducted directly between the event organizer and the event professional.' },
              { title: '6. Intellectual Property', content: 'All content, branding, and assets on PrimeJar are the intellectual property of PrimeJar. Users retain ownership of the content they upload but grant PrimeJar a license to display this content on the platform.' },
              { title: '7. Termination', content: 'PrimeJar reserves the right to suspend or terminate any account that violates these terms, engages in fraudulent activity, or is reported by other users for misconduct.' },
            ].map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-display font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{section.title}</h2>
                <p>{section.content}</p>
              </section>
            ))}
            <section>
              <h2 className="text-lg font-display font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>8. Contact</h2>
              <p>For any questions about these Terms of Service, please contact us at <a href="mailto:support@primejar.in" className="text-prime-500 hover:text-prime-400">support@primejar.in</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
