'use client';

import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="section-title mb-3">Contact Us</h1>
          <p className="section-subtitle mx-auto">We&apos;d love to hear from you. Reach out anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {[
              { icon: '🏢', title: 'Company', lines: ['PrimeJar', 'Event Manpower Marketplace'] },
              { icon: '📍', title: 'Location', lines: ['Ahmedabad, Gujarat, India'] },
              { icon: '📧', title: 'Email', lines: ['support@primejar.in'], isEmail: true },
              { icon: '🕐', title: 'Support Hours', lines: ['Monday – Saturday', '10:00 AM – 6:30 PM IST'] },
            ].map((item) => (
              <div key={item.title} className="glass-card p-5 flex items-start gap-4 rounded-3xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg bg-prime-500/10 text-prime-500">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  {item.lines.map((line, i) => (
                    item.isEmail ? (
                      <a key={i} href={`mailto:${line}`} className="text-prime-500 hover:text-prime-400 text-sm">{line}</a>
                    ) : (
                      <p key={i} className="text-sm" style={{ color: 'var(--text-muted)' }}>{line}</p>
                    )
                  ))}
                </div>
              </div>
            ))}

            {/* Social */}
            <div className="glass-card p-5 rounded-3xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
              <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Follow Us</h3>
              <div className="grid grid-cols-2 gap-3">
                <a href="https://instagram.com/primejar" target="_blank" rel="noopener noreferrer" className="glass-card-hover p-3 flex items-center gap-3 rounded-2xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
                  <span>📸</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Instagram</p>
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>@primejar</p>
                  </div>
                </a>
                {[{ icon: '💼', name: 'LinkedIn' }, { icon: '🐦', name: 'Twitter / X' }, { icon: '📘', name: 'Facebook' }].map((s) => (
                  <div key={s.name} className="glass-card p-3 flex items-center gap-3 opacity-60 rounded-2xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
                    <span>{s.icon}</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Coming Soon</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-6 md:p-8 h-fit rounded-3xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
            <h2 className="text-xl font-display font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Send a Message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                <input type="text" placeholder="Your name" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input type="email" placeholder="you@example.com" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                <select className="input-field appearance-none cursor-pointer">
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Message</label>
                <textarea placeholder="How can we help?" className="input-field h-32 resize-none" />
              </div>
              <button type="submit" className="gradient-btn rounded-full w-full">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
