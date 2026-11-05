import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Property } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ScheduleInspectionModal } from '../components/property/ScheduleInspectionModal';
import { InquiryModal } from '../components/property/InquiryModal';
import { PropertyCard } from '../components/property/PropertyCard';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Heart,
  Calendar,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Calculator,
  Building,
  Car,
  Sparkles,
  ArrowLeft,
  Loader2,
  DollarSign,
  UserPlus,
  Lock,
} from 'lucide-react';

export const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, isGuest, user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  // Buy / Purchase modal state
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState('');
  const [purchaseError, setPurchaseError] = useState('');
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);
  const [guestActionName, setGuestActionName] = useState('purchase this property');

  // Mortgage Calculator state
  const [downPaymentPercent, setDownPaymentPercent] = useState(30);
  const [loanTenureYears, setLoanTenureYears] = useState(15);
  const [interestRate, setInterestRate] = useState(18);

  useEffect(() => {
    async function loadProperty() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.properties.getById(id);
        if (res.success && res.data) {
          setProperty(res.data);
          setActiveImageIdx(0);
        }
      } catch (err) {
        console.error('Error loading property:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProperty();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Retrieving verified property dossier...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 max-w-md">
          <h2 className="text-xl font-bold text-slate-900 font-serif-luxury">Property Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">The requested listing may have been sold or archived.</p>
          <Link
            to="/properties"
            className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Return to Listings
          </Link>
        </div>
      </div>
    );
  }

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const downPaymentAmount = (property.price * downPaymentPercent) / 100;
  const loanPrincipal = property.price - downPaymentAmount;
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTenureYears * 12;
  const estimatedMonthlyRepayment =
    property.listingType === 'SALE'
      ? (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : property.price / 12;

  const favorited = isFavorite(property.id);

  // Require Client/Buyer signup or login if guest tries to buy or inspect
  const handleInitiatePurchase = () => {
    if (isGuest) {
      setGuestActionName('purchase or submit an offer on this property');
      setGuestPromptOpen(true);
      return;
    }
    setPurchaseModalOpen(true);
  };

  const handleOpenInspect = () => {
    if (isGuest) {
      setGuestActionName('schedule an in-person or virtual property inspection');
      setGuestPromptOpen(true);
      return;
    }
    setInspectModalOpen(true);
  };

  const handleOpenInquiry = () => {
    if (isGuest) {
      setGuestActionName('send a direct inquiry to the administrator');
      setGuestPromptOpen(true);
      return;
    }
    setInquiryModalOpen(true);
  };

  // Submit client purchase order
  const handleConfirmPurchaseOrder = async () => {
    if (!user) return;
    setPurchaseLoading(true);
    setPurchaseError('');
    try {
      const res = await api.transactions.record({
        propertyId: property.id,
        transactionType: property.listingType,
        amount: property.price,
        buyerOrTenantName: user.name,
        buyerOrTenantEmail: user.email,
        buyerOrTenantPhone: user.phone || '',
        paymentStatus: 'PENDING', // PENDING confirmation by Admin!
        notes: `Purchase order placed online by ${user.name} for ${property.title}.`,
      });

      if (res.success) {
        setPurchaseSuccess(res.message);
        setTimeout(() => {
          setPurchaseModalOpen(false);
          setPurchaseSuccess('');
        }, 3000);
      }
    } catch (err: any) {
      setPurchaseError(err.message || 'Failed to place purchase order');
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-slate-900 text-slate-300 border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/properties"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Back to All Listings</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleFavorite(property.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                favorited
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
              <span>{favorited ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Title & Price Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider">
                For {property.listingType}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-800 font-semibold text-xs">
                {property.category}
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Title: Governor’s Consent / C of O
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-950 font-serif-luxury">
              {property.title}
            </h1>
            <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-2">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{property.address}</span>
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs uppercase tracking-widest text-slate-500 font-bold block">
              {property.listingType === 'RENT' ? 'Annual Rental Value' : 'Guide Asking Price'}
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-serif-luxury">
              {formatNaira(property.price)}
            </span>
            {property.listingType === 'RENT' && (
              <span className="text-xs text-slate-500 font-medium ml-1">/ year</span>
            )}
          </div>
        </div>

        {/* IMAGE GALLERY */}
        <div className="space-y-3">
          <div className="relative aspect-[16/9] md:aspect-[21/9] max-h-[520px] rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-200">
            <img
              src={property.images[activeImageIdx]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-semibold">
              Photo {activeImageIdx + 1} of {property.images.length}
            </div>
          </div>

          {property.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-24 h-16 sm:w-32 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImageIdx === idx
                      ? 'border-amber-500 ring-2 ring-amber-400/40 scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MAIN DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="p-3 bg-slate-50 rounded-xl">
                <Bed className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-lg font-bold text-slate-900 block">{property.bedrooms}</span>
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Bedrooms</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <Bath className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-lg font-bold text-slate-900 block">{property.bathrooms}</span>
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Bathrooms</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <Car className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-lg font-bold text-slate-900 block">{property.parkingSpaces}</span>
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Car Bays</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <Maximize2 className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-lg font-bold text-slate-900 block">{property.propertySize}</span>
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Square Meters</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xl font-bold font-serif-luxury text-slate-900">
                Property Overview & Architectural Highlights
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xl font-bold font-serif-luxury text-slate-900">
                Amenities & Infrastructural Specs
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mortgage Calculator */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-bold font-serif-luxury text-slate-900">
                  {property.listingType === 'SALE' ? 'Mortgage & Cashflow Estimator' : 'Rental Installment Breakdown'}
                </h3>
              </div>

              {property.listingType === 'SALE' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Down Payment: {downPaymentPercent}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="70"
                        step="5"
                        value={downPaymentPercent}
                        onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-900 block mt-1">
                        {formatNaira(downPaymentAmount)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tenure: {loanTenureYears} Years
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="25"
                        step="1"
                        value={loanTenureYears}
                        onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Interest Rate: {interestRate}%
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="26"
                        step="0.5"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block">Estimated Monthly Payment</span>
                      <span className="text-2xl font-bold text-amber-400 font-serif-luxury">
                        {formatNaira(estimatedMonthlyRepayment)} / month
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 max-w-xs text-right">
                      *Indicative amortization for institutional mortgage partners.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Equivalent Monthly Cost</span>
                    <span className="text-2xl font-bold text-amber-400 font-serif-luxury">
                      {formatNaira(property.price / 12)} / month
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Purchase & Action CTA */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5 sticky top-28">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                Acquisition & Viewings
              </span>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* PRIMARY PURCHASE BUTTON */}
                <button
                  onClick={handleInitiatePurchase}
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-amber-500/25"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>
                    {property.listingType === 'SALE' ? 'Purchase Property Now' : 'Rent / Lease Property'}
                  </span>
                </button>

                {/* SCHEDULE INSPECTION BUTTON */}
                <button
                  onClick={handleOpenInspect}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Schedule Private Inspection</span>
                </button>

                {/* INQUIRY BUTTON */}
                <button
                  onClick={handleOpenInquiry}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>Ask a Question</span>
                </button>
              </div>

              {/* Verification points */}
              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Governor’s Consent verified in state registry</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Escrow & Deed of Assignment provided</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar properties */}
        {property.similarProperties && property.similarProperties.length > 0 && (
          <div className="pt-12 border-t border-slate-200 space-y-6">
            <h3 className="text-2xl font-bold font-serif-luxury text-slate-900">
              Similar Verified Properties
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {property.similarProperties.map((sim) => (
                <PropertyCard key={sim.id} property={sim} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: GUEST MUST SIGN UP OR REGISTER NOTICE */}
      {guestPromptOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 py-8">
          <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-amber-500/40 shadow-2xl animate-fade-in text-center">
            <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif-luxury text-white">
                Client / Buyer Registration Required
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You are currently browsing as a <strong>Guest</strong>. To {guestActionName}, you must register as a Client/Buyer or sign in to your verified account.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <Link
                to="/auth?tab=signup"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register as Client / Buyer</span>
              </Link>

              <Link
                to="/auth?tab=signin"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center border border-slate-700 transition-all"
              >
                <span>Already have an account? Sign In</span>
              </Link>

              <button
                onClick={() => setGuestPromptOpen(false)}
                className="text-xs text-slate-400 hover:text-white pt-2 cursor-pointer"
              >
                Continue Browsing as Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CLIENT PURCHASE ORDER CONFIRMATION */}
      {purchaseModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 py-8">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-serif-luxury text-slate-900">
                Confirm Property Purchase Order
              </h3>
              <button onClick={() => setPurchaseModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            {purchaseSuccess ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">Purchase Order Placed!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{purchaseSuccess}</p>
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl font-medium">
                  Your purchase order is logged as <strong>PENDING</strong> in the Administrator Portal. Once wire/escrow funds are received, the Administrator confirms your payment as <strong>PAID</strong> and executes the Deed of Assignment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-sm text-slate-900">{property.title}</h4>
                  <p className="text-xs text-slate-500">{property.address}</p>
                  <div className="pt-2 flex items-baseline justify-between">
                    <span className="text-xs text-slate-600">Total Purchase Price:</span>
                    <span className="text-lg font-extrabold text-slate-950 font-serif-luxury">
                      {formatNaira(property.price)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <p><strong>Buyer:</strong> {user?.name} ({user?.email})</p>
                  <p className="text-[11px] text-slate-500">
                    Submitting this will register your purchase order in the Admin portal with status: <strong>PENDING PAYMENT</strong>.
                  </p>
                </div>

                {purchaseError && (
                  <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
                    {purchaseError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setPurchaseModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPurchaseOrder}
                    disabled={purchaseLoading}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {purchaseLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                    <span>Submit Purchase Order</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS */}
      <ScheduleInspectionModal
        property={property}
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
      />

      <InquiryModal
        property={property}
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />
    </div>
  );
};
