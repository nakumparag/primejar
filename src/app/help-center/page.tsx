import Link from 'next/link';

const faqs = [
  { q: 'How do I create an account?', a: 'Click "Get Started" or "Sign Up" on the homepage. Choose your role (Event Professional or Organizer), fill in your details, and create your account with email and password.' },
  { q: 'How do I find event jobs?', a: 'Go to the Jobs page. You can filter jobs by event type and city, sort by date or budget. Click on any job to see details and apply.' },
  { q: 'How do I hire workers for my event?', a: 'As an organizer, go to "Post an Event" to create a job listing. Workers will apply and you can review, shortlist, and hire them from your dashboard.' },
  { q: 'Is there a fee to use PrimeJar?', a: 'PrimeJar is currently free to use for both workers and organizers. There are no platform fees or commission on payments.' },
  { q: 'How do payments work?', a: 'All payments are handled directly between the organizer and the worker. PrimeJar does not process payments in this version.' },
  { q: 'How do I verify my profile?', a: 'Complete your profile with accurate information, upload portfolio images, and your profile will be reviewed for verification by the PrimeJar team.' },
  { q: 'What are Event Groups?', a: 'Event Groups are communities where workers and organizers can share opportunities, discuss events, and network.' },
  { q: 'How do I report a problem?', a: 'Contact us at support@primejar.in or use the Contact Us page to report any issues.' },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="section-title mb-3">Help Center</h1>
          <p className="section-subtitle mx-auto">Find answers to commonly asked questions</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Getting Started', icon: '🚀', href: '/how-it-works' },
            { label: 'Contact Support', icon: '📧', href: '/contact' },
            { label: 'Browse Jobs', icon: '📋', href: '/jobs' },
            { label: 'Find Professionals', icon: '👥', href: '/users' },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="glass-card-hover p-4 text-center rounded-3xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
              <div className="text-2xl mb-2">{link.icon}</div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{link.label}</p>
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Frequently Asked Questions</h2>
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
              <h3 className="font-semibold mb-2 flex items-start gap-3" style={{ color: 'var(--text-primary)' }}>
                <span className="text-prime-500 font-display">Q{i + 1}.</span>
                {faq.q}
              </h3>
              <p className="text-sm leading-relaxed pl-8" style={{ color: 'var(--text-muted)' }}>{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 glass-card p-8 text-center mesh-gradient rounded-3xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
          <h3 className="text-xl font-display font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Still Need Help?</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Our support team is available Monday–Saturday, 10 AM – 6:30 PM IST</p>
          <Link href="/contact" className="gradient-btn rounded-full inline-flex">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
