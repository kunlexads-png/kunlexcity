import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Upper newsletter & brand banner */}
      <div className="border-b border-slate-850 bg-slate-900/60 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h3 className="text-2xl font-bold text-white font-serif-luxury">
              Stay Informed on High-Yield Nigerian Real Estate
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Receive exclusive off-market listings, prime architectural releases, and institutional market intelligence in Lagos & Abuja.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your executive email"
              required
              className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 w-full sm:w-72"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          {subscribed && (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Thank you! You are subscribed to PrimeNest Executive Briefings.
            </div>
          )}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
                <Building2 className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white font-serif-luxury">KunlexCity</span>
                <span className="ml-2 text-xs font-bold text-amber-400 uppercase tracking-widest">PrimeNest</span>
              </div>
            </div>
            <p className="text-amber-400 font-serif-luxury text-sm italic">
              "Find Your Place. Build Your Future."
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              PrimeNest Realty is a premier full-service Nigerian real estate development, brokerage, and luxury property advisory firm. Delivering institutional integrity, verified Governor's Consent titles, and bespoke concierge management.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300">
                ✓ NIESV Certified
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300">
                ✓ REDAN Licensed
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300">
                ✓ SCUML Compliant
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-amber-400 transition-colors">Luxury Listings</Link>
              </li>
              <li>
                <Link to="/properties?listingType=RENT" className="hover:text-amber-400 transition-colors">Executive Rentals</Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-amber-400 transition-colors">Property Comparison</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-400 transition-colors">About Our Firm</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">Contact & Inspection</Link>
              </li>
            </ul>
          </div>

          {/* Prime Locations */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Prime Enclaves</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/properties?location=Banana%20Island" className="hover:text-amber-400 transition-colors">Banana Island, Ikoyi</Link>
              </li>
              <li>
                <Link to="/properties?location=Lekki" className="hover:text-amber-400 transition-colors">Lekki Phase 1</Link>
              </li>
              <li>
                <Link to="/properties?location=Victoria%20Island" className="hover:text-amber-400 transition-colors">Victoria Island Waterfront</Link>
              </li>
              <li>
                <Link to="/properties?location=Maitama" className="hover:text-amber-400 transition-colors">Maitama Diplomatic Zone</Link>
              </li>
              <li>
                <Link to="/properties?location=Guzape" className="hover:text-amber-400 transition-colors">Guzape Hilltop, Abuja</Link>
              </li>
              <li>
                <Link to="/properties?location=Port%20Harcourt" className="hover:text-amber-400 transition-colors">Old GRA, Port Harcourt</Link>
              </li>
            </ul>
          </div>

          {/* Head Offices */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact & Offices</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Lagos HQ:</strong> 24 Ahmadu Bello Way, Victoria Island, Lagos
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Abuja:</strong> 12 Gana Street Extension, Maitama, Abuja FCT
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+234 812 654 9870 / +234 803 111 2233</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>inquiries@primenest.ng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} KunlexCity | PrimeNest Realty Ltd. All rights reserved. Registered RC-1498221.</p>
          <div className="flex items-center space-x-6">
            <span>Terms of Brokerage</span>
            <span>Privacy Policy</span>
            <span>Anti-Money Laundering (AML)</span>
            <span className="text-amber-400 font-medium">Powered by Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
