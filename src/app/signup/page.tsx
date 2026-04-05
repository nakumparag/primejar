'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { logUserSignup } from '@/lib/activity';
import { Mail, Lock, User, Phone, MapPin, Building2, Briefcase, IndianRupee, ArrowRight, ArrowLeft, Check, CheckCircle2 } from 'lucide-react';

const skillOptions = [
  'Photographer', 'Videographer', 'DJ', 'Anchor', 'Decorator',
  'Caterer', 'Lighting Technician', 'Sound Engineer', 'Makeup Artist',
  'Event Assistant', 'Helper', 'Manager'
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Goa', 'Chandigarh', 'Kochi', 'Udaipur', 'Indore'
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'user' | 'organizer' | ''>('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', city: '',
    skills: [] as string[], experience: '', bio: '',
    dailyRate: '', companyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault(); // ✅ Prevent page reload
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) { setError('Email and password are required.'); setLoading(false); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
    if (!formData.name || !formData.city) { setError('Name and city are required.'); setLoading(false); return; }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const finalRole = formData.email.toLowerCase() === 'admin@primejar.in' ? 'admin' : (role || 'user');

      const userData: any = {
        name: formData.name, email: formData.email, phone: formData.phone,
        city: formData.city, role: finalRole,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };

      if (finalRole === 'user' || finalRole === 'admin') {
        userData.bio = formData.bio;
        userData.skills = formData.skills;
        userData.experience = formData.experience;
        userData.dailyRate = formData.dailyRate ? Number(formData.dailyRate) : 0;
        userData.photoURL = '';
        userData.portfolioImages = [];
        userData.availability = [];
        userData.rating = 0;
        userData.reviewCount = 0;
        userData.verified = false;
      }

      if (finalRole === 'organizer') {
        userData.companyName = formData.companyName;
      }

      await setDoc(doc(db, 'users', user.uid), userData);

      // Log activity
      await logUserSignup(user.uid, formData.name, role || 'user');

      // Send Verification Email
      try {
        await sendEmailVerification(user);
      } catch (e) {
        console.error("Failed to send verification email", e);
      }
      
      // Brief wait before redirecting
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/verify-email');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setError('This email is already registered. Please login instead.');
      else if (err.code === 'auth/invalid-email') setError('Please enter a valid email address.');
      else if (err.code === 'auth/weak-password') setError('Password must be at least 6 characters.');
      else setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Illustration (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-orange-50 dark:bg-[#1a1512] relative overflow-hidden flex-col justify-center p-12 lg:p-24">
        {/* Soft geometric background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-orange-200/40 dark:bg-orange-900/20 blur-3xl mix-blend-multiply dark:mix-blend-lighten animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-yellow-200/40 dark:bg-yellow-900/20 blur-3xl mix-blend-multiply dark:mix-blend-lighten animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
          <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[80%] rounded-full bg-orange-300/30 dark:bg-orange-800/20 blur-3xl mix-blend-multiply dark:mix-blend-lighten animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
        </div>
        
        <div className="relative z-10 max-w-lg">
          <Link href="/" className="inline-flex items-center gap-3 mb-16 text-prime-600 dark:text-prime-400 font-display font-bold text-2xl hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-prime-600 dark:bg-prime-500 text-white flex items-center justify-center text-xl shadow-lg shadow-prime-600/20">P</div>
            PrimeJar
          </Link>
          
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Start your journey with PrimeJar today.
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
            Create an account to join the network of top event organizers and professionals building the future of events.
          </p>
          
          {/* Trust indicator */}
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl inline-block">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[
                  'https://i.pravatar.cc/100?img=1',
                  'https://i.pravatar.cc/100?img=2',
                  'https://i.pravatar.cc/100?img=3',
                  'https://i.pravatar.cc/100?img=4'
                ].map((src, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-orange-50 dark:border-[#1a1512] bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <img src={src} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Trusted by 5,000+ top professionals
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-24 bg-white dark:bg-[#0f0c0a] relative z-10 lg:shadow-[-20px_0_40px_-5px_rgba(0,0,0,0.05)] dark:lg:shadow-[-20px_0_40px_-5px_rgba(0,0,0,0.5)] overflow-y-auto">
        
        {/* Mobile Header / Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10 w-full justify-center">
            <div className="w-10 h-10 rounded-xl bg-prime-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-prime-600/20">P</div>
            <span className="font-display font-bold text-2xl text-gray-900 dark:text-white">PrimeJar</span>
        </div>

        <div className="w-full max-w-[480px] mx-auto pb-10">
          
          {/* Form Tabs (Only show on Step 1) */}
          {step === 1 && (
            <div className="flex items-center mb-10 border-b border-gray-200 dark:border-gray-800">
              <Link href="/login" className="flex-1 pb-4 text-center font-medium text-gray-400 hover:text-gray-800 dark:text-gray-500 dark:hover:text-gray-300 border-b-2 border-transparent transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="flex-1 pb-4 text-center font-semibold text-prime-600 dark:text-prime-500 border-b-2 border-prime-600 dark:border-prime-500 transition-colors">
                Create Account
              </Link>
            </div>
          )}

          {/* Simple Step Indicator for Step 2 and 3 */}
          {step > 1 && (
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2">
                 {[1, 2, 3].map((s) => (
                   <div key={s} className="flex items-center">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                       step === s ? 'bg-prime-600 text-white shadow-md shadow-prime-600/30' : 
                       step > s ? 'bg-prime-100 dark:bg-prime-900/30 text-prime-600 dark:text-prime-400' : 
                       'bg-gray-100 dark:bg-gray-800 text-gray-400'
                     }`}>
                       {step > s ? <Check className="w-4 h-4" /> : s}
                     </div>
                     {s < 3 && <div className={`w-6 sm:w-10 h-1 rounded-full mx-1 sm:mx-2 ${step > s ? 'bg-prime-600' : 'bg-gray-100 dark:bg-gray-800'}`} />}
                   </div>
                 ))}
               </div>
               <button onClick={() => setStep(step - 1)} className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 flex items-center gap-1">
                 <ArrowLeft className="w-4 h-4" /> Back
               </button>
             </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: ROLE */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Join PrimeJar</h2>
                <p className="text-gray-500 dark:text-gray-400">Choose how you want to use the platform.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: 'user' as const, title: 'Event Professional', desc: 'Find event work and build your portfolio.', icon: User, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', borderActive: 'border-blue-500', ring: 'ring-blue-500/20' },
                  { value: 'organizer' as const, title: 'Event Organizer', desc: 'Hire top professionals for your events.', icon: Building2, color: 'text-prime-500', bg: 'bg-prime-50 dark:bg-prime-500/10', borderActive: 'border-prime-500', ring: 'ring-prime-500/20' },
                ].map((option) => {
                  const Icon = option.icon;
                  const isActive = role === option.value;
                  return (
                    <button 
                      key={option.value} 
                      onClick={() => setRole(option.value)}
                      className={`p-5 rounded-2xl text-left transition-all duration-200 border-2 outline-none focus:ring-4 ${option.ring} ${
                        isActive 
                          ? `${option.borderActive} bg-gray-50 dark:bg-[#1a1512]` 
                          : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f0c0a] hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${option.bg} ${option.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-1">{option.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{option.desc}</p>
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => { if (role) { setError(''); setStep(2); } }} 
                disabled={!role} 
                className="w-full mt-4 py-3.5 px-4 bg-prime-600 hover:bg-prime-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-prime-600/25 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                Continue Setup <ArrowRight className="w-4 h-4" />
              </button>

              {/* Social Login Divider */}
              <div className="mt-8 flex items-center justify-center">
                 <div className="border-t border-gray-200 dark:border-gray-800 flex-1" />
                 <span className="px-4 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-white dark:bg-[#0f0c0a]">Or continue with</span>
                 <div className="border-t border-gray-200 dark:border-gray-800 flex-1" />
              </div>

              <button type="button" className="mt-6 w-full py-3.5 px-4 bg-white dark:bg-[#1a1512] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#251e19] text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all flex items-center justify-center gap-3">
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                 </svg>
                 Sign up with Google
              </button>
            </div>
          )}

          {/* STEP 2: INFO */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
                  {role === 'user' ? 'Create Your Profile' : 'Set Up Your Account'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Tell us a bit about yourself.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter your full name" className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1512] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-prime-500/20 focus:border-prime-500 transition-all outline-none text-gray-900 dark:text-white" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1512] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-prime-500/20 focus:border-prime-500 transition-all outline-none text-gray-900 dark:text-white" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Minimum 6 characters" className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1512] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-prime-500/20 focus:border-prime-500 transition-all outline-none text-gray-900 dark:text-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                  <div className="relative flex">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 border-r border-gray-200 dark:border-gray-700 pr-2">
                      <span className="text-gray-500 text-sm font-medium">+91</span>
                    </div>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="9999999999" className="w-full pl-14 pr-4 py-3 bg-gray-50 dark:bg-[#1a1512] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-prime-500/20 focus:border-prime-500 transition-all outline-none text-gray-900 dark:text-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                    <select value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1512] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-prime-500/20 focus:border-prime-500 transition-all outline-none flex-1 appearance-none cursor-pointer text-gray-900 dark:text-white">
                      <option value="">Select city</option>
                      {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                </div>

                {role === 'organizer' && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Name</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                      <input type="text" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="Your company or brand name" className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#1a1512] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-prime-500/20 focus:border-prime-500 transition-all outline-none text-gray-900 dark:text-white" />
                    </div>
                  </div>
                )}

                {role === 'user' && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Short Bio</label>
                    <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell event organizers about you..." className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1512] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-prime-500/20 focus:border-prime-500 transition-all outline-none h-24 resize-none text-gray-900 dark:text-white" />
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  setError('');
                  if (!formData.name || !formData.email || !formData.password || formData.password.length < 6 || !formData.city) { 
                    setError('Please fill in all required fields marked with * and ensure password is > 6 characters.'); 
                    return; 
                  }
                  setStep(3);
                }} 
                className="w-full py-3.5 px-4 bg-prime-600 hover:bg-prime-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-prime-600/25 flex items-center justify-center gap-2 mt-4"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: SKILLS/CONFIRM */}
          {step === 3 && (
            <form onSubmit={handleSignup} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {role === 'user' ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Professional Details</h2>
                    <p className="text-gray-500 dark:text-gray-400">Select your expertise and rates.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Skills (Multiple) *</label>
                    <div className="flex flex-wrap gap-2">
                      {skillOptions.map((skill) => {
                        const isSelected = formData.skills.includes(skill);
                        return (
                          <button 
                            key={skill} 
                            type="button" 
                            onClick={() => toggleSkill(skill)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-prime-600 text-white shadow-md shadow-prime-600/20 border border-prime-600'
                                : 'bg-white dark:bg-[#1a1512] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            {skill}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Years of Experience</label>
                      <select value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1512] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-prime-500/20 focus:border-prime-500 transition-all outline-none appearance-none cursor-pointer text-gray-900 dark:text-white">
                        <option value="">Select experience</option>
                        <option value="0-1">0-1 years</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Daily Rate (₹)</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                        <input type="number" value={formData.dailyRate} onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })} placeholder="e.g. 5000" className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#1a1512] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-prime-500/20 focus:border-prime-500 transition-all outline-none text-gray-900 dark:text-white" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-6 pt-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-prime-50 dark:bg-prime-900/20">
                    <CheckCircle2 className="w-10 h-10 text-prime-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Almost Done!</h2>
                    <p className="text-gray-500 dark:text-gray-400">Review your details and create your account.</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1a1512] rounded-2xl p-6 text-left border border-gray-100 dark:border-gray-800 space-y-3">
                    {[
                      { label: 'Name', value: formData.name },
                      { label: 'Email', value: formData.email },
                      { label: 'City', value: formData.city },
                      { label: 'Company', value: formData.companyName || 'N/A' },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center text-sm border-b border-gray-200 dark:border-gray-800 last:border-0 pb-2 last:pb-0">
                        <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                id="signup-submit-btn"
                disabled={loading || (role === 'user' && formData.skills.length === 0)}
                className="w-full py-3.5 px-4 bg-prime-600 hover:bg-prime-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-prime-600/25 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
