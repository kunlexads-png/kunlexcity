import React, { useState } from 'react';
import { Property } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Video, MapPin, X, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

interface ScheduleInspectionModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ScheduleInspectionModal: React.FC<ScheduleInspectionModalProps> = ({
  property,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionTime, setInspectionTime] = useState('11:00 AM');
  const [inspectionType, setInspectionType] = useState<'IN_PERSON' | 'VIRTUAL_TOUR'>('IN_PERSON');
  const [clientName, setClientName] = useState(user?.name || '');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [clientPhone, setClientPhone] = useState(user?.phone || '+234 ');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectionDate) {
      setErrorMsg('Please choose an inspection date.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.appointments.schedule({
        propertyId: property.id,
        clientName,
        clientEmail,
        clientPhone,
        inspectionDate,
        inspectionTime,
        inspectionType,
        notes,
        userId: user?.id,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 2500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to schedule inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 py-8">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-fade-in">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              PrimeNest VIP Concierge
            </span>
            <h3 className="text-lg font-bold font-serif-luxury">Schedule Property Inspection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Property mini recap */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-16 h-12 object-cover rounded-lg"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">{property.title}</h4>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-500" />
                {property.area}, {property.city}
              </p>
            </div>
          </div>
          {!user && (
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-1 rounded-md shrink-0">
              Guest Booking
            </span>
          )}
        </div>

        {successMsg ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Inspection Confirmed!</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Inspection Mode Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Inspection Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInspectionType('IN_PERSON')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    inspectionType === 'IN_PERSON'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-amber-500" />
                  In-Person Physical Visit
                </button>
                <button
                  type="button"
                  onClick={() => setInspectionType('VIRTUAL_TOUR')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    inspectionType === 'VIRTUAL_TOUR'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Video className="w-4 h-4 text-amber-500" />
                  Live Virtual Video Tour
                </button>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Time Slot
                </label>
                <select
                  value={inspectionTime}
                  onChange={(e) => setInspectionTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none bg-white"
                >
                  <option value="10:00 AM">10:00 AM (Morning)</option>
                  <option value="11:30 AM">11:30 AM (Morning)</option>
                  <option value="02:00 PM">02:00 PM (Afternoon)</option>
                  <option value="03:30 PM">03:30 PM (Afternoon)</option>
                  <option value="05:00 PM">05:00 PM (Evening Sunset View)</option>
                </select>
              </div>
            </div>

            {/* Client info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. Dr. Kunle Alabi"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  placeholder="+234 812 654 9870"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Requests / Security Access Clearance
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bringing structural engineer, require north gate vehicle pass..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Confirm Inspection Appointment</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
