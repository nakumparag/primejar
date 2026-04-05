import Link from 'next/link';

const steps = [
  { step: 1, title: 'Create Your Account', desc: 'Sign up and build your professional profile with skills, portfolio, and rates.', forWorker: 'Add your skills, set your daily rate, and upload portfolio images.', forOrganizer: 'Add your company name and describe the types of events you organize.', icon: '👤' },
  { step: 2, title: 'Browse or Post', desc: 'Workers browse available event jobs and apply. Organizers post their event requirements.', forWorker: 'Browse the Job Marketplace, filter by city and event type, and apply to jobs.', forOrganizer: 'Post your event with details like date, location, required skills, and budget.', icon: '🔍' },
  { step: 3, title: 'Connect & Communicate', desc: 'Use the built-in messaging system to discuss event details and negotiate.', forWorker: 'Chat directly with organizers about event requirements and availability.', forOrganizer: 'Review applications, shortlist candidates, and finalize your event team.', icon: '💬' },
  { step: 4, title: 'Work & Grow', desc: 'Complete events, receive reviews, build your reputation on the platform.', forWorker: 'Complete events, get 5-star reviews, and attract more work.', forOrganizer: 'Rate workers after events and build a list of reliable professionals.', icon: '⭐' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="section-title mb-3">How PrimeJar Works</h1>
          <p className="section-subtitle mx-auto">Connect directly with event professionals and organizers. No middlemen, no commissions.</p>
        </div>

        <div className="space-y-6 mb-16">
          {steps.map((s) => (
            <div key={s.step} className="glass-card p-6 md:p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl flex-shrink-0 bg-prime-950 dark:bg-prime-50 dark:text-prime-950 text-white">
                  {s.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Step 0{s.step}</span>
                    <div className="h-px flex-1" style={{ background: 'var(--divider)' }} />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 rounded-3xl" style={{ background: 'rgba(46, 46, 46, 0.05)', border: '1px solid rgba(46, 46, 46, 0.1)' }}>
                      <p className="text-prime-950 dark:text-prime-50 text-xs font-semibold mb-1">For Workers</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.forWorker}</p>
                    </div>
                    <div className="p-4 rounded-3xl" style={{ background: 'rgba(212, 170, 125, 0.15)', border: '1px solid rgba(212, 170, 125, 0.2)' }}>
                      <p className="text-[#977b5a] text-xs font-semibold mb-1">For Organizers</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.forOrganizer}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-8 md:p-12 text-center mesh-gradient">
          <h2 className="text-2xl font-display font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Ready to Get Started?</h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Join thousands of event professionals and organizers on PrimeJar</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="gradient-btn">Create Free Account</Link>
            <Link href="/jobs" className="btn-secondary">Browse Jobs</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
