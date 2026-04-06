'use client';

import Link from 'next/link';
import { Zap, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';

const footerLinks = {
  'For Workers': [
    { label: 'Create Profile', href: '/signup' },
    { label: 'Browse Events', href: '/jobs' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Join Groups', href: '/groups' },
  ],
  'For Organizers': [
    { label: 'Post an Event', href: '/jobs/create' },
    { label: 'Find Professionals', href: '/users' },
    { label: 'Pricing', href: '/about' },
    { label: 'Create Group', href: '/groups' },
  ],
  'Support': [
    { label: 'Help Center', href: '/help-center' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact Us', href: '/contact' },
  ],
};

const socials = [
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com/primejar' },
  { label: 'Twitter', icon: Twitter, href: '#' },
  { label: 'LinkedIn', icon: Linkedin, href: '#' },
  { label: 'Facebook', icon: Facebook, href: '#' },
];

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-default)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand — spans 2 cols on LG */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
              >
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text-primary)' }}>
                Prime<span style={{ color: '#2563EB' }}>Jar</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)', maxWidth: '280px' }}>
              India&apos;s premier event discovery platform. Connect directly with 10,000+ verified professionals — photographers, DJs, decorators & more.
            </p>

            <div className="flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#2563EB';
                    (e.currentTarget as HTMLElement).style.color = '#2563EB';
                    (e.currentTarget as HTMLElement).style.background = '#EFF6FF';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)';
                  }}
                  aria-label={s.label}
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {['10,000+ Vendors', 'Verified Profiles', '50+ Cities'].map(badge => (
                <span
                  key={badge}
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4
                className="font-semibold text-sm mb-4"
                style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text-primary)' }}
              >
                {heading}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#2563EB'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
            © 2026 PrimeJar Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex gap-5">
            {[
              { label: 'Terms', href: '/terms' },
              { label: 'Privacy', href: '/privacy-policy' },
              { label: 'Contact', href: '/contact' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs transition-colors"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#2563EB'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
