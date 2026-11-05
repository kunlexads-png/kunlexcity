import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Sparkles,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Shield,
  Eye,
  UserPlus,
  Key,
  Plus,
} from 'lucide-react';

interface NavbarProps {
  onOpenAI: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAI }) => {
  const { user, isAdmin, logout, viewAsGuest } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Properties', path: '/properties' },
    { label: 'Compare', path: '/compare' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white font-serif-luxury">
                  KunlexCity
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                  PrimeNest
                </span>
              </div>
              <p className="text-[10px] tracking-wider text-slate-400 uppercase font-medium">
                Luxury Real Estate & Investments
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-amber-400 bg-slate-800/80 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* PrimeNest AI Assistant Button */}
            <button
              onClick={onOpenAI}
              className="relative group flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold text-xs tracking-wide shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>PrimeNest AI</span>
            </button>

            {/* Dashboard / Portal link for logged in users */}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    location.pathname.startsWith('/dashboard') && !location.search.includes('tab=upload')
                      ? 'bg-amber-400/10 border-amber-400 text-amber-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  {isAdmin ? <Shield className="w-4 h-4 text-amber-400" /> : <LayoutDashboard className="w-4 h-4 text-emerald-400" />}
                  <span>{isAdmin ? 'Admin Portal' : 'Client Dashboard'}</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/dashboard?tab=upload"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
                    title="Upload New Property Listing"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Property</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/40"
                  />
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* Keep only Admin Access in the desktop navbar.
                 Sign In / Register is provided by the separate top action area. */
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                <Link
                  to="/auth?tab=admin"
                  className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Admin Access"
                >
                  <Key className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenAI}
              className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-400/30"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2.5 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname === item.path
                  ? 'text-amber-400 bg-slate-800'
                  : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* AI Assistant launch from mobile menu */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAI();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 text-amber-300 font-semibold text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ask PrimeNest AI Advisor</span>
            </div>
            <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded">Gemini</span>
          </button>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800 text-amber-400 font-semibold text-xs border border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    {isAdmin ? <Shield className="w-4 h-4 text-amber-400" /> : <LayoutDashboard className="w-4 h-4 text-emerald-400" />}
                    <span>{isAdmin ? 'Admin Portal' : 'Client Dashboard'}</span>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded uppercase font-bold">
                    {user.role}
                  </span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/dashboard?tab=upload"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>Upload New Property</span>
                  </Link>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      viewAsGuest();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>View as Guest</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/auth?tab=signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold border border-slate-700"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/auth?tab=signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register</span>
                  </Link>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    to="/auth?tab=admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 py-1"
                  >
                    <Key className="w-3 h-3" />
                    <span>Administrator Portal</span>
                  </Link>

                  <button
                    onClick={() => {
                      viewAsGuest();
                      setMobileMenuOpen(false);
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 py-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Guest Mode</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
