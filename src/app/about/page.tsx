import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-full bg-prime-950 dark:bg-prime-50 flex items-center justify-center mx-auto mb-6">
            <span className="text-white dark:text-prime-950 font-bold text-3xl">P</span>
          </div>
          <h1 className="section-title mb-4">About PrimeJar</h1>
          <p className="section-subtitle mx-auto">India&apos;s premier event manpower marketplace — connecting event organizers with skilled professionals, directly.</p>
        </div>

        <div className="glass-card p-8 md:p-10 mb-8 rounded-3xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
          <h2 className="text-2xl font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Our Mission</h2>
          <p style={{ color: 'var(--text-secondary)' }}>The Indian events industry relies heavily on informal WhatsApp groups, word-of-mouth referrals, and middlemen. This leads to unreliable hiring, inconsistent quality, and unfair commission structures.</p>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}><span className="font-medium" style={{ color: 'var(--text-primary)' }}>PrimeJar exists to change that.</span> We&apos;re building an organized, transparent marketplace where event organizers can find verified professionals — photographers, videographers, DJs, decorators, caterers, and more — and hire them directly, without middlemen.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: 'Direct Connection', desc: 'No middlemen. Organizers and workers communicate and agree on terms directly.', icon: '🤝' },
            { title: 'Trust & Transparency', desc: 'Verified profiles, genuine reviews, and complete transparency on rates.', icon: '✨' },
            { title: 'Empowering Professionals', desc: 'We help workers build their brand, showcase portfolios, and get discovered.', icon: '🚀' },
          ].map((val) => (
            <div key={val.title} className="glass-card p-6 rounded-3xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
              <div className="text-3xl mb-4">{val.icon}</div>
              <h3 className="font-display font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{val.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{val.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-8 md:p-10 mb-8 rounded-3xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
          <h2 className="text-2xl font-display font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Browse and filter workers by skill, city, and rating',
              'Post event jobs with detailed requirements',
              'Direct messaging between organizers and workers',
              'Professional profiles with portfolios and reviews',
              'Event groups for networking and opportunities',
              'Dashboards for workers and organizers',
              'Admin-moderated content for safety',
              'Mobile-responsive, fast-loading platform',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-input)]">
                <span className="text-emerald-500">✓</span>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 md:p-10 mb-8 rounded-3xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
          <h2 className="text-2xl font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Company Info</h2>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Company', value: 'PrimeJar' },
              { label: 'Location', value: 'Ahmedabad, Gujarat, India' },
              { label: 'Industry', value: 'Events & Manpower Marketplace' },
              { label: 'Founded', value: '2026' },
            ].map((item) => (
              <div key={item.label} className="flex gap-6">
                <span className="w-28 flex-shrink-0" style={{ color: 'var(--text-faint)' }}>{item.label}</span>
                <span style={{ color: 'var(--text-primary)' }}>{item.value}</span>
              </div>
            ))}
            <div className="flex gap-6">
              <span className="w-28 flex-shrink-0" style={{ color: 'var(--text-faint)' }}>Email</span>
              <a href="mailto:support@primejar.in" className="text-prime-500 hover:text-prime-400">support@primejar.in</a>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-display font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Join the PrimeJar Community</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Whether you&apos;re an event professional or organizer, PrimeJar is built for you.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="gradient-btn rounded-full">Get Started Free</Link>
            <Link href="/contact" className="btn-secondary rounded-full">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
