import React, { useState } from 'react';
import { api } from '../services/api';
import {
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  Loader2,
  Building2,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+234 ');
  const [subject, setSubject] = useState('Acquisition / General Inquiry');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.inquiries.submit({
        propertyId: 'prop-001', // General inquiry routed via flagship asset desk
        name,
        email,
        phone,
        message: `[Subject: ${subject}] ${message}`,
        preferredContactMethod: 'WHATSAPP',
      });

      if (res.success) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit contact request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero */}
      <section className="bg-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Client Advisory & Inspection Concierge
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-luxury">
            Contact PrimeNest Realty
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Our luxury property specialists in Victoria Island and Maitama are on standby to coordinate your private viewings.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md">
            <h2 className="text-2xl font-bold font-serif-luxury text-slate-950 mb-2">
              Send an Executive Message
            </h2>
            <p className="text-xs text-slate-500 mb-8">
              Fill in your inquiry details below. Our senior client partners respond within two hours during business hours.
            </p>

            {submitted ? (
              <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Message Dispatched Successfully</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Thank you! An executive broker from our Victoria Island or Abuja desk has been assigned to your request.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Kunle Alabi"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 812 654 9870"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="executive@company.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="Acquisition / Buy">Property Acquisition / Outright Purchase</option>
                      <option value="Rent / Executive Lease">Executive Tenancy / Penthouse Lease</option>
                      <option value="List Property / Landlord">Listing a Luxury Asset (Owner / Developer)</option>
                      <option value="Joint Venture / Investment">Joint Venture Development in Lagos/Abuja</option>
                      <option value="Inspection Coordination">Inspection & Airport Chauffeur Request</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message & Requirements</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Specify budget, target location (Ikoyi, Banana Island, Maitama), preferred bedrooms, or specific questions..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Transmit Inquiry to PrimeNest</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Col: Offices & WhatsApp */}
          <div className="space-y-6">
            {/* Direct WhatsApp Callout */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 shadow-xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg font-serif-luxury">Instant WhatsApp Desk</h3>
                <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                  Chat directly with our on-duty senior property partner for real-time video tours and title verification files.
                </p>
              </div>
              <a
                href="https://wa.me/2348126549870?text=Hello%20PrimeNest%20Realty%2C%20I%20am%20inquiring%20about%20luxury%20properties%20in%20Nigeria."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-md"
              >
                <span>Launch WhatsApp (+234 812 654 9870)</span>
              </a>
            </div>

            {/* Offices Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                Office Locations
              </span>

              {/* Lagos */}
              <div className="space-y-1.5 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Lagos Headquarters (Victoria Island)</span>
                </div>
                <p className="text-xs text-slate-400 pl-6">
                  24 Ahmadu Bello Way, Victoria Island, Lagos State, Nigeria
                </p>
              </div>

              {/* Abuja */}
              <div className="space-y-1.5 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Abuja Diplomatic Branch (Maitama)</span>
                </div>
                <p className="text-xs text-slate-400 pl-6">
                  12 Gana Street Extension, Maitama, Abuja FCT, Nigeria
                </p>
              </div>

              {/* Business Hours */}
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Executive Business Hours</span>
                </div>
                <p className="pl-6">Monday - Friday: 08:00 AM – 06:30 PM</p>
                <p className="pl-6">Saturday: 09:30 AM – 04:00 PM (By Inspection Appointment)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
