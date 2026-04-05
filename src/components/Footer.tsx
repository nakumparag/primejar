import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--divider)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-prime-500 to-prime-600">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="font-display font-bold text-xl text-[var(--text-primary)]">
                Prime<span className="text-prime-500">Jar</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              India&apos;s premier event manpower marketplace. Connect directly with top event professionals — no middlemen.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com/primejar" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 bg-[var(--bg-card)] border border-[var(--bg-card-border)]" aria-label="Instagram">
                <span className="text-xs font-semibold text-[var(--text-muted)]">IG</span>
              </a>
              {['Li', 'X', 'Fb'].map((s) => (
                <span key={s} className="w-9 h-9 rounded-full flex items-center justify-center cursor-not-allowed bg-[var(--bg-card)] border border-[var(--bg-card-border)]" title="Coming Soon">
                  <span className="text-xs font-semibold text-[var(--text-faint)]">{s}</span>
                </span>
              ))}
            </div>
          </div>

          {/* For Workers */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-[var(--text-primary)]">For Workers</h4>
            <ul className="space-y-3">
              {[
                { label: 'Create Profile', href: '/signup' },
                { label: 'Browse Jobs', href: '/jobs' },
                { label: 'Join Groups', href: '/groups' },
                { label: 'How It Works', href: '/how-it-works' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-prime-500 text-[var(--text-muted)]">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Organizers */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-[var(--text-primary)]">For Organizers</h4>
            <ul className="space-y-3">
              {[
                { label: 'Post an Event', href: '/jobs/create' },
                { label: 'Find Professionals', href: '/users' },
                { label: 'Create Group', href: '/groups' },
                { label: 'About Us', href: '/about' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-prime-500 text-[var(--text-muted)]">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-[var(--text-primary)]">Support</h4>
            <ul className="space-y-3">
              {[
                { label: 'Help Center', href: '/help-center' },
                { label: 'Privacy Policy', href: '/privacy-policy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-prime-500 text-[var(--text-muted)]">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[var(--divider)]">
          <p className="text-sm text-[var(--text-faint)]">
            © 2026 PrimeJar. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm transition-colors hover:text-prime-500 text-[var(--text-faint)]">Terms</Link>
            <Link href="/privacy-policy" className="text-sm transition-colors hover:text-prime-500 text-[var(--text-faint)]">Privacy</Link>
            <Link href="/contact" className="text-sm transition-colors hover:text-prime-500 text-[var(--text-faint)]">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
