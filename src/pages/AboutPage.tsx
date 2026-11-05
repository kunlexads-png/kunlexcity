import React from 'react';
import { Building2, ShieldCheck, Award, Users, CheckCircle2, Target, HeartHandshake, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero */}
      <section className="bg-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-850 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            About KunlexCity & PrimeNest Realty
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold font-serif-luxury">
            Find Your Place. Build Your Future.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Forging institutional excellence, legal title certainty, and architectural beauty across Nigeria’s high-growth luxury property landscape.
          </p>
        </div>
      </section>

      {/* Main Story & Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Our Heritage & Vision
            </span>
            <h2 className="text-3xl font-bold font-serif-luxury text-slate-950">
              Transforming Luxury Real Estate in West Africa
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Founded under the visionary leadership of Olusegun Adekunle, KunlexCity PrimeNest Realty was established to eliminate the friction, opacity, and legal risks traditionally associated with real estate in Nigeria.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              We specialize in trophy residential assets and prime commercial real estate in Ikoyi, Banana Island, Lekki, Victoria Island, Maitama Abuja, and Old GRA Port Harcourt. By pairing licensed NIESV surveying standards with state-of-the-art Gemini AI property valuation, we empower buyers, landlords, and institutional investors to execute transactions with absolute peace of mind.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <Target className="w-6 h-6 text-amber-500 mb-2" />
                <h4 className="font-bold text-sm text-slate-900">Our Mission</h4>
                <p className="text-xs text-slate-500 mt-1">To deliver flawless title-cleared real estate backed by transparency and world-class management.</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-200">
                <HeartHandshake className="w-6 h-6 text-amber-500 mb-2" />
                <h4 className="font-bold text-sm text-slate-900">Our Vision</h4>
                <p className="text-xs text-slate-500 mt-1">To be Africa’s most trusted luxury real estate development and technology ecosystem.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80"
              alt="PrimeNest Architecture"
              className="rounded-3xl shadow-2xl border border-slate-200 object-cover w-full h-[450px]"
            />
            <div className="absolute -bottom-6 -left-6 bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-amber-400/40 hidden sm:block max-w-xs">
              <div className="text-2xl font-bold text-amber-400 font-serif-luxury">100% C of O</div>
              <p className="text-xs text-slate-300 mt-1">All properties backed by certified Governor’s Consent and verified Survey Beacon coordinates.</p>
            </div>
          </div>
        </div>

        {/* Leadership Team */}
        <div className="space-y-8 pt-8 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Executive Leadership
            </span>
            <h2 className="text-3xl font-bold font-serif-luxury mt-1 text-slate-950">
              Meet the Advisory Board & Executives
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Olusegun Adekunle',
                role: 'Founder & Managing Director',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                bio: '18+ years leading institutional property acquisitions and waterfront developments across Lagos.',
              },
              {
                name: 'Folashade Balogun',
                role: 'Head of Legal & Due Diligence',
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
                bio: 'Specialist in Lagos State Lands Bureau registry clearances and international escrow compliance.',
              },
              {
                name: 'Chidi Okafor',
                role: 'Partner, Waterfront Portfolio',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                bio: 'Banana Island and Ikoyi private residential advisor with ₦20B+ in transaction volume.',
              },
              {
                name: 'Amara Danladi',
                role: 'Partner, Northern Region (Abuja)',
                avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
                bio: 'Maitama and Guzape diplomat advisory consultant representing foreign missions and conglomerates.',
              },
            ].map((member, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-amber-400/30"
                />
                <div>
                  <h4 className="font-bold text-slate-950 text-base">{member.name}</h4>
                  <p className="text-xs font-semibold text-amber-600">{member.role}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accreditations Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-serif-luxury">Registered & Licensed by National Bodies</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Strict adherence to Real Estate Developers Association of Nigeria (REDAN) standards, Nigerian Institution of Estate Surveyors and Valuers (NIESV), and Federal Ministry of Housing regulations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400">
              NIESV Member #0492
            </span>
            <span className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400">
              REDAN Lic. #8812
            </span>
            <span className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400">
              EFCC SCUML Compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
