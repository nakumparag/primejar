'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, RefreshCw, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Handle countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Redirect if actually verified or no user
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.emailVerified) {
        router.replace(profile?.role === 'organizer' ? '/dashboard/organizer' : '/dashboard/worker');
      }
    }
  }, [user, profile, authLoading, router]);

  const handleResend = async () => {
    if (!user || resendCooldown > 0) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await sendEmailVerification(user);
      setMessage({ type: 'success', text: 'Verification email resent! Please check your inbox and spam folder.' });
      setResendCooldown(60); // 60 seconds cooldown
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        setMessage({ type: 'error', text: 'Too many requests. Please wait a moment before trying again.' });
      } else {
        setMessage({ type: 'error', text: error.message || 'Failed to send verification email.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!user) return;
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await user.reload(); // Force Firebase to refresh the user token/state
      if (user.emailVerified) {
        setMessage({ type: 'success', text: 'Email verified successfully! Redirecting...' });
        setTimeout(() => {
          router.push(profile?.role === 'organizer' ? '/dashboard/organizer' : '/dashboard/worker');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: 'Email is not verified yet. Please click the link in the email we sent.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error checking verification status.' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0c0a]">
        <div className="w-8 h-8 border-4 border-prime-500/30 border-t-prime-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null; // Will redirect

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0c0a] px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1512] rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 dark:border-gray-800 text-center animate-in fade-in zoom-in duration-300">
        
        <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-prime-500" />
        </div>

        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
          Verify your email
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          We&apos;ve sent a verification link to <br/>
          <span className="font-semibold text-gray-900 dark:text-white">{user.email}</span><br/>
          Please check your inbox to activate your account.
        </p>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 text-left ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <p>{message.text}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleCheckStatus}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-prime-600 hover:bg-prime-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-prime-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Check Verification Status'}
          </button>

          <button
            onClick={handleResend}
            disabled={loading || resendCooldown > 0}
            className="w-full py-3.5 px-4 bg-white dark:bg-[#1a1512] border-2 border-gray-200 dark:border-gray-800 hover:border-prime-500 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${resendCooldown > 0 ? '' : 'text-prime-500'}`} />
            {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend Verification Email'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
           <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-1">
             <ArrowRight className="w-4 h-4 rotate-180" /> Back to Login
           </Link>
        </div>
      </div>
    </div>
  );
}
