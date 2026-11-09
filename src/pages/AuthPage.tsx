
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Shield,
  Key,
  CheckCircle2,
  Loader2,
  Eye,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, viewAsGuest } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Tabs: CLIENT_SIGNIN | CLIENT_SIGNUP | ADMIN_LOGIN | FORGOT_PASSWORD
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<
    'CLIENT_SIGNIN' | 'CLIENT_SIGNUP' | 'ADMIN_LOGIN' | 'FORGOT_PASSWORD'
  >(
    tabParam === 'signup'
      ? 'CLIENT_SIGNUP'
      : tabParam === 'admin'
      ? 'ADMIN_LOGIN'
      : tabParam === 'forgot'
      ? 'FORGOT_PASSWORD'
      : 'CLIENT_SIGNIN'
  );

  useEffect(() => {
    if (tabParam === 'signup') {
      setActiveTab('CLIENT_SIGNUP');
    } else if (tabParam === 'admin') {
      setActiveTab('ADMIN_LOGIN');
    } else if (tabParam === 'forgot') {
      setActiveTab('FORGOT_PASSWORD');
    } else if (tabParam === 'signin') {
      setActiveTab('CLIENT_SIGNIN');
    }
  }, [tabParam]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // CLIENT SIGN IN
  const handleClientSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // RESEND EMAIL VERIFICATION
  const handleResendVerification = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMsg('Please enter your registered email address first.');
      return;
    }

    setResending(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await api.resendVerification(normalizedEmail);

      setSuccessMsg(
        response.message ||
          'If an unverified account exists, a verification email will be sent.'
      );
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          'Unable to resend verification email. Please try again.'
      );
    } finally {
      setResending(false);
    }
  };

  // CLIENT SIGN UP
  const handleClientSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await register({
        name,
        email: email.trim(),
        password,
        phone,
      });

      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  // ADMIN LOGIN
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const emailToUse = adminEmail.trim() || 'kunlex4star@gmail.com';

      await login(emailToUse, adminPassword);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg('Invalid Administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setSuccessMsg(
        `If an account is associated with ${
          email || 'your email'
        }, password reset instructions have been dispatched.`
      );
    } catch (err: any) {
      setErrorMsg('Failed to dispatch reset link.');
    } finally {
      setLoading(false);
    }
  };

  // CONTINUE AS GUEST
  const handleContinueAsGuest = () => {
    viewAsGuest();
    navigate('/properties');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 mx-auto shadow-xl shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Building2 className="w-7 h-7 text-amber-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold font-serif-luxury text-white">
            {activeTab === 'CLIENT_SIGNIN' && 'Client / Buyer Sign In'}
            {activeTab === 'CLIENT_SIGNUP' && 'Client / Buyer Registration'}
            {activeTab === 'ADMIN_LOGIN' && 'Administrator Portal'}
            {activeTab === 'FORGOT_PASSWORD' && 'Reset Your Password'}
          </h2>

          <p className="text-xs text-slate-400">
            KunlexCity • PrimeNest Realty Listing & Management
          </p>
        </div>

        {/* Tab Selection Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => {
              setActiveTab('CLIENT_SIGNIN');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'CLIENT_SIGNIN'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('CLIENT_SIGNUP');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'CLIENT_SIGNUP'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ADMIN_LOGIN');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'ADMIN_LOGIN'
                ? 'bg-slate-800 text-amber-400 border border-amber-400/50 shadow-sm'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 text-red-200 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORM 1: CLIENT SIGN IN */}
          {activeTab === 'CLIENT_SIGNIN' && (
            <form onSubmit={handleClientSignIn} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Client / Buyer Email
                </label>

                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="buyer@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('FORGOT_PASSWORD');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />

                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* RESEND VERIFICATION EMAIL */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending || loading}
                  className="text-xs text-amber-400 hover:text-amber-300 hover:underline cursor-pointer disabled:opacity-50"
                >
                  {resending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending verification email...
                    </span>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading || resending}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}

                <span>Sign In as Client / Buyer</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                New buyer or investor?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('CLIENT_SIGNUP');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </div>
            </form>
          )}

          {/* FORM 2: CLIENT SIGN UP */}
          {activeTab === 'CLIENT_SIGNUP' && (
            <form onSubmit={handleClientSignUp} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300">
                Buyers and clients must register before purchasing properties or booking viewings.
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>

                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />

                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chinedu Eze"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number (WhatsApp)
                </label>

                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />

                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Create Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Create Password
                </label>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />

                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}

                <span>Register as Client / Buyer</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('CLIENT_SIGNIN');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* FORM 3: ADMIN LOGIN */}
          {activeTab === 'ADMIN_LOGIN' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Administrator Portal
                </span>

                <p className="text-[11px] text-slate-400">
                  Restricted access. Sign in with administrative credentials to manage property inventory, upload media, and audit buyer payments.
                </p>
              </div>

              {/* Administrator Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Administrator Email
                </label>

                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />

                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Enter administrator email"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Administrator Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Administrator Password
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('FORGOT_PASSWORD');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />

                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter administrator password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Admin Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}

                <span>Login to Admin Command Center</span>
              </button>
            </form>
          )}

          {/* FORM 4: FORGOT PASSWORD */}
          {activeTab === 'FORGOT_PASSWORD' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-400">
                Enter your registered email address (Client or Administrator) to receive instructions for resetting your password.
              </p>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. administrator@domain.com or buyer@domain.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Password Reset Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}

                <span>Send Password Reset Link</span>
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('CLIENT_SIGNIN');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Guest Browsing Link */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleContinueAsGuest}
              className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Continue & Browse Properties as Guest</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
