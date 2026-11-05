import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { api } from '../services/api';
import {
  Scale,
  Sparkles,
  CheckCircle2,
  XCircle,
  Building,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ComparePage: React.FC = () => {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(['prop-001', 'prop-004']);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [notice, setNotice] = useState<string>('');

  useEffect(() => {
    async function loadProps() {
      try {
        const res = await api.properties.list({ limit: 50 });
        if (res.success) {
          setAllProperties(res.data);
        }
      } catch (err) {
        console.error('Error loading properties for comparison:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProps();
  }, []);

  const selectedProperties = allProperties.filter((p) => selectedIds.includes(p.id));

  const handleAddProperty = (id: string) => {
    if (selectedIds.length >= 3) {
      setNotice('You can compare a maximum of 3 properties side-by-side.');
      return;
    }
    if (!selectedIds.includes(id)) {
      setNotice('');
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveProperty = (id: string) => {
    if (selectedIds.length <= 1) {
      setNotice('Keep at least 1 property in the comparison table.');
      return;
    }
    setNotice('');
    setSelectedIds(selectedIds.filter((pId) => pId !== id));
  };

  const handleRunAIComparison = async () => {
    if (selectedIds.length < 2) {
      setNotice('Please select at least 2 properties to generate an AI comparison.');
      return;
    }
    setNotice('');
    setAiLoading(true);
    setAiAnalysis('');
    try {
      const res = await api.gemini.compare(selectedIds);
      if (res.success && res.data) {
        setAiAnalysis(res.data.analysis);
      }
    } catch (err: any) {
      console.error('AI comparison error:', err);
      setAiAnalysis('Could not generate comparative assessment at this time.');
    } finally {
      setAiLoading(false);
    }
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
              <Scale className="w-4 h-4" />
              <span>Investment Evaluation Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif-luxury">
              Side-by-Side Property Comparison
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Analyze capital value, price per square meter, luxury amenities, and location yields across your shortlist.
            </p>
          </div>

          <button
            onClick={handleRunAIComparison}
            disabled={aiLoading || selectedIds.length < 2}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>Evaluate with PrimeNest AI</span>
          </button>
        </div>

        {/* Notice Message */}
        {notice && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center justify-between text-sm shadow-sm">
            <span>{notice}</span>
            <button
              onClick={() => setNotice('')}
              className="text-amber-800 hover:text-amber-950 font-bold ml-4 cursor-pointer text-xs uppercase"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Property Selector Bar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Add Property to Compare:</span>
            <select
              onChange={(e) => {
                if (e.target.value) handleAddProperty(e.target.value);
              }}
              defaultValue=""
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="" disabled>Select from available properties...</option>
              {allProperties
                .filter((p) => !selectedIds.includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.area} - {formatNaira(p.price)})
                  </option>
                ))}
            </select>
          </div>
          <span className="text-xs text-slate-500">
            Comparing <strong>{selectedProperties.length}</strong> of 3 properties
          </span>
        </div>

        {/* AI Analysis Report Card (if generated) */}
        {aiLoading && (
          <div className="p-8 bg-slate-900 text-white rounded-3xl border border-amber-500/30 text-center space-y-3 shadow-xl">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
            <h4 className="font-bold text-base text-amber-300">PrimeNest AI analyzing market metrics...</h4>
            <p className="text-xs text-slate-400">Benchmarking price-per-square-meter, rental yield, and neighborhood security...</p>
          </div>
        )}

        {aiAnalysis && (
          <div className="p-8 bg-slate-900 text-slate-100 rounded-3xl border border-amber-500/40 shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-400 pb-2 border-b border-slate-800">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-lg font-serif-luxury">PrimeNest AI Comparative Assessment</h3>
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-line text-slate-200">
              {aiAnalysis}
            </div>
          </div>
        )}

        {/* Comparison Matrix Table */}
        <div className="space-y-2">
          <p className="text-[11px] text-slate-500 sm:hidden flex items-center gap-1 italic">
            <span>← Swipe horizontally to review all property specifications →</span>
          </p>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[650px]">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200">
                  <th className="p-5 font-bold text-slate-900 w-1/4">Specification</th>
                {selectedProperties.map((p) => (
                  <th key={p.id} className="p-5 font-bold text-slate-900 w-1/4 align-top">
                    <div className="space-y-2">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 shadow-sm">
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveProperty(p.id)}
                          className="absolute top-2 right-2 p-1.5 bg-slate-950/80 text-white hover:text-red-400 rounded-full transition-colors cursor-pointer"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <Link to={`/properties/${p.id}`} className="font-bold text-slate-950 hover:text-amber-600 block line-clamp-1">
                        {p.title}
                      </Link>
                      <span className="text-base font-extrabold text-amber-600 font-serif-luxury block">
                        {formatNaira(p.price)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Listing Type</td>
                {selectedProperties.map((p) => (
                  <td key={p.id} className="p-4 font-bold text-slate-800">
                    For {p.listingType}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Category</td>
                {selectedProperties.map((p) => (
                  <td key={p.id} className="p-4">
                    {p.category}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Location / Enclave</td>
                {selectedProperties.map((p) => (
                  <td key={p.id} className="p-4">
                    <strong>{p.area}</strong>, {p.city}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Price Per Sqm (m²)</td>
                {selectedProperties.map((p) => {
                  const perSqm = Math.round(p.price / p.propertySize);
                  return (
                    <td key={p.id} className="p-4 font-bold text-slate-900">
                      {formatNaira(perSqm)} / m²
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Bedrooms & Baths</td>
                {selectedProperties.map((p) => (
                  <td key={p.id} className="p-4">
                    {p.bedrooms} Beds • {p.bathrooms} Baths • {p.toilets} Toilets
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Floor Space & Land</td>
                {selectedProperties.map((p) => (
                  <td key={p.id} className="p-4">
                    {p.propertySize} m² {p.landSize ? `(Plot: ${p.landSize} m²)` : ''}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Parking Spaces</td>
                {selectedProperties.map((p) => (
                  <td key={p.id} className="p-4">
                    {p.parkingSpaces} Vehicles
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Key Amenities</td>
                {selectedProperties.map((p) => (
                  <td key={p.id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {p.amenities.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700">
                          {a}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Action</td>
                {selectedProperties.map((p) => (
                  <td key={p.id} className="p-4">
                    <Link
                      to={`/properties/${p.id}`}
                      className="px-4 py-2 rounded-xl bg-slate-950 text-white hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition-colors inline-block"
                    >
                      View Property Details
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
};
