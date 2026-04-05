export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-24 pb-12" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 md:p-12 rounded-3xl border border-[var(--bg-card-border)] bg-[var(--bg-secondary)]">
          <h1 className="text-3xl font-display font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Privacy Policy</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-faint)' }}>Last updated: March 17, 2026</p>

          <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {[
              { title: '1. Information We Collect', content: 'When you create an account on PrimeJar, we collect personal information including: Full Name, Email Address, Phone Number, City, Bio & Skills, and Profile Photos & Portfolio Images.' },
              { title: '2. How We Use Your Data', content: 'We use your data to create and manage your account, display your profile to potential organizers or workers, facilitate communication, send notifications about jobs and applications, improve platform features, and prevent fraud.' },
              { title: '3. Firebase & Third-Party Services', content: 'PrimeJar uses Google Firebase for Authentication (email/password login), Cloud Firestore (data storage), and Firebase Storage (media files). These services are subject to Google\'s Terms of Service and Privacy Policy.' },
              { title: '4. Data Protection', content: 'All data is transmitted over HTTPS encrypted connections. Passwords are hashed and stored securely by Firebase Authentication. Firestore security rules restrict data access to authorized users only. We do not sell your personal data to third parties.' },
              { title: '5. Data Retention', content: 'Your data is retained as long as your account is active. If you choose to delete your account, we will remove your personal data from our systems within 30 days, except where required by law.' },
              { title: '6. Your Rights', content: 'You have the right to access your personal data, update or correct your information, request deletion of your account and data, and withdraw consent for data processing.' },
              { title: '7. Cookies', content: 'PrimeJar uses essential cookies and local storage to maintain your login session and preferences. We do not use tracking cookies or third-party advertising cookies.' },
            ].map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-display font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{section.title}</h2>
                <p>{section.content}</p>
              </section>
            ))}
            <section>
              <h2 className="text-lg font-display font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>8. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, contact us at <a href="mailto:support@primejar.in" className="text-prime-500 hover:text-prime-400">support@primejar.in</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
