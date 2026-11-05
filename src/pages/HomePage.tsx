import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Property, User } from '../types';
import { api } from '../services/api';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyFilterBar } from '../components/property/PropertyFilterBar';
import { ScheduleInspectionModal } from '../components/property/ScheduleInspectionModal';
import {
  Sparkles,
  ShieldCheck,
  Award,
  TrendingUp,
  MapPin,
  ArrowRight,
  Phone,
  MessageSquare,
  CheckCircle,
  Star,
  Building,
  Key,
} from 'lucide-react';

interface HomePageProps {
  onOpenAI: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenAI }) => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [latestProperties, setLatestProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyForInspect, setSelectedPropertyForInspect] = useState<Property | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const propsRes = await api.properties.list({ limit: 8 });

        if (propsRes.success) {
          const featured = propsRes.data.filter((p) => p.featured);
          setFeaturedProperties(featured.length > 0 ? featured : propsRes.data.slice(0, 3));
          setLatestProperties(propsRes.data.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFilterSearch = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.location && filters.location !== 'ALL') params.append('location', filters.location);
    if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters.listingType && filters.listingType !== 'ALL') params.append('listingType', filters.listingType);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.bedrooms && filters.bedrooms !== 'ANY') params.append('bedrooms', filters.bedrooms);

    navigate(`/properties?${params.toString()}`);
  };

  const handleOpenInspect = (property: Property) => {
    setSelectedPropertyForInspect(property);
    setInspectModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HERO SECTION */}
      <section className="relative min-h-[640px] lg:min-h-[720px] bg-slate-950 flex flex-col justify-center overflow-hidden">
        {/* Background Image with luxury dark gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85"
            alt="Prime Luxury Villa"
            className="w-full h-full object-cover object-center opacity-45 scale-105 animate-pulse duration-[12000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-amber-500/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>KunlexCity • PrimeNest Realty</span>
              <span className="text-slate-400">|</span>
              <span className="text-white">Find Your Place. Build Your Future.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15] font-serif-luxury">
              Discover Properties That <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">Match Your Lifestyle</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              Nigeria’s most discerning portfolio of verified waterfront villas, ambassadorial mansions, executive penthouses, and high-yield commercial assets across Lagos, Abuja, and Port Harcourt.
            </p>

            {/* AI Call to Action Chip */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenAI}
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/25 hover:scale-105 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Ask PrimeNest AI Advisor</span>
              </button>
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700/80 transition-all backdrop-blur-md"
              >
                <span>Browse All Listings</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
            </div>
          </div>

          {/* Floating Search & Filter Bar */}
          <div className="mt-12 max-w-5xl shadow-2xl">
            <PropertyFilterBar onFilterChange={handleFilterSearch} />
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL TRUST METRICS */}
      <section className="bg-slate-900 text-white border-y border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="border-r border-slate-800/80 last:border-none p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-serif-luxury">₦4.8B+</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Verified Real Estate Value</div>
          </div>
          <div className="border-r border-slate-800/80 last:border-none p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-serif-luxury">100%</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">C of O & Governor’s Consent</div>
          </div>
          <div className="border-r border-slate-800/80 last:border-none p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-serif-luxury">18+ Years</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Prime Leadership & Escrow</div>
          </div>
          <div className="p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-serif-luxury">Gemini AI</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Intelligent Recommendation</div>
          </div>
        </div>
      </section>

      {/* FEATURED LUXURY PROPERTIES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Signature Residences</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 font-serif-luxury mt-1">
              Featured Luxury Properties
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-xl">
              Handpicked trophy residences with verified Governor’s Consent titles, independent power, and bespoke finishing.
            </p>
          </div>
          <Link
            to="/properties"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700"
          >
            <span>Explore Entire Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onQuickInspect={handleOpenInspect}
            />
          ))}
        </div>
      </section>

      {/* POPULAR PRIME LOCATIONS SHOWCASE */}
      <section className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Elite Nigerian Destinations
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-luxury mt-1 text-white">
              Explore Popular Locations
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Browse premier enclaves known for premier capital appreciation, unmatched security, and serene waterfront living.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Banana Island, Ikoyi',
                city: 'Lagos',
                image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
                count: 'Waterfront Villas',
                url: '/properties?location=Banana%20Island',
              },
              {
                name: 'Maitama Diplomatic Zone',
                city: 'Abuja FCT',
                image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80',
                count: 'Ambassadorial Mansions',
                url: '/properties?location=Maitama',
              },
              {
                name: 'Lekki Phase 1',
                city: 'Lagos',
                image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=600&q=80',
                count: 'Contemporary Duplexes',
                url: '/properties?location=Lekki',
              },
              {
                name: 'Victoria Island Oceanfront',
                city: 'Lagos',
                image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
                count: 'Sky Penthouses',
                url: '/properties?location=Victoria%20Island',
              },
            ].map((loc, idx) => (
              <Link
                key={idx}
                to={loc.url}
                className="group relative h-80 rounded-2xl overflow-hidden border border-slate-800 shadow-lg block"
              >
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30">
                    {loc.city}
                  </span>
                  <h3 className="text-xl font-bold font-serif-luxury text-white mt-1 group-hover:text-amber-400 transition-colors">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{loc.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE PRIMENEST REALTY */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Institutional Distinction
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif-luxury mt-1 text-slate-950">
            Why Choose PrimeNest Realty
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            We blend rigorous title perfection with AI intelligence and VIP concierge property management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif-luxury text-slate-900 mb-2">
              100% Title Perfection & Escrow
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every property undergoes thorough legal verification with the Lagos State Lands Bureau and Abuja Geographic Information Systems (AGIS). Zero third-party dispute risk.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif-luxury text-slate-900 mb-2">
              PrimeNest AI Assistant
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Powered by Google Gemini 3.8 Flash, our assistant provides data-backed property matching, neighborhood rental yields, and side-by-side investment comparisons in seconds.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif-luxury text-slate-900 mb-2">
              VIP Inspection Concierge
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              From security gate pass pre-authorizations to private speedboats for lagoon waterfront villas and live 4K virtual walkthroughs for international diaspora buyers.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED AGENTS SECTION */}
      <section className="bg-slate-100/70 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
                Direct Portfolio Management
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif-luxury mt-1 text-slate-950">
                Administrator & Acquisition Concierge Desk
              </h2>
              <p className="text-slate-600 text-sm mt-2">
                All property uploads and title verifications are directly coordinated by our senior administration.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
              alt="Kunle Alabi"
              className="w-28 h-28 rounded-2xl object-cover ring-2 ring-amber-400/50 shrink-0"
            />
            <div className="space-y-3 flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h3 className="text-xl font-bold text-slate-900">Kunle Alabi</h3>
                <span className="text-[11px] bg-amber-500 text-slate-950 font-bold px-2.5 py-0.5 rounded-full">
                  Administrator & Lead Broker
                </span>
                <span className="text-[11px] text-slate-500">brokerage@primenest.ng</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Directly overseeing all property uploads, Governor’s Consent title clearances, and client purchase transactions. Contact our direct executive line or chat on WhatsApp for private briefings.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                <a
                  href="https://wa.me/2348126549870?text=Hello%20Administrator%2C%20I%20am%20inquiring%20about%20properties%20on%20KunlexCity%20PrimeNest."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Direct WhatsApp (+234 812 654 9870)</span>
                </a>
                <Link
                  to="/auth?tab=signup"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Register as Client / Buyer</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLIENT TESTIMONIALS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Client Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif-luxury mt-1 text-slate-950">
            Trusted by Leaders & Discerning Families
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Dr. Kunle Alabi',
              title: 'Diaspora Investor (London / Lagos)',
              content:
                'PrimeNest AI matched our exact requirement for a private waterfront villa in Banana Island. Their legal team verified the title within 48 hours, and the virtual walkthrough with Chidi was flawlessly coordinated.',
              rating: 5,
              property: 'Banana Island Waterfront Villa',
            },
            {
              name: 'Chief Ibrahim Lawal',
              title: 'Portfolio Landlord & Developer',
              content:
                'Listing my luxury properties on KunlexCity gives me high-net-worth tenant vetting and real-time transaction oversight. Best real estate management platform in West Africa.',
              rating: 5,
              property: 'Maitama Presidential Heights',
            },
            {
              name: 'Zainab Kalu',
              title: 'Executive Tenant, Victoria Island',
              content:
                'From lease execution to maintenance request handling, PrimeNest sets the standard for 5-star residential hospitality in Lagos.',
              rating: 5,
              property: 'Blue Horizon Penthouse',
            },
          ].map((t, i) => (
            <div key={i} className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed mb-6">
                  "{t.content}"
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                <p className="text-xs text-slate-500">{t.title}</p>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">Ref: {t.property}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INSPECTION MODAL */}
      <ScheduleInspectionModal
        property={selectedPropertyForInspect}
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
      />
    </div>
  );
};
