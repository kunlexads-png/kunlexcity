import React, { useState } from 'react';
import { Search, MapPin, Home, DollarSign, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface FilterState {
  search: string;
  location: string;
  category: string;
  listingType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
}

interface PropertyFilterBarProps {
  initialFilters?: Partial<FilterState>;
  onFilterChange: (filters: FilterState) => void;
  isCompact?: boolean;
}

export const PropertyFilterBar: React.FC<PropertyFilterBarProps> = ({
  initialFilters = {},
  onFilterChange,
  isCompact = false,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: initialFilters.search || '',
    location: initialFilters.location || 'ALL',
    category: initialFilters.category || 'ALL',
    listingType: initialFilters.listingType || 'ALL',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    bedrooms: initialFilters.bedrooms || 'ANY',
  });

  const [showAdvanced, setShowAdvanced] = useState(!isCompact);

  const handleChange = (key: keyof FilterState, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    const resetValues: FilterState = {
      search: '',
      location: 'ALL',
      category: 'ALL',
      listingType: 'ALL',
      minPrice: '',
      maxPrice: '',
      bedrooms: 'ANY',
    };
    setFilters(resetValues);
    onFilterChange(resetValues);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xl border border-slate-200/90 text-slate-800 transition-all">
      {/* Top Type Switcher: Buy / Rent / Lease */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full">
          {[
            { id: 'ALL', label: 'All Listings' },
            { id: 'SALE', label: 'Buy / For Sale' },
            { id: 'RENT', label: 'Rent / Executive' },
            { id: 'LEASE', label: 'Commercial Lease' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => handleChange('listingType', type.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                filters.listingType === type.id
                  ? 'bg-slate-950 text-amber-400 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isCompact && (
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span>{showAdvanced ? 'Hide Filters' : 'More Filters'}</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="text-xs font-medium text-slate-500 hover:text-red-500 flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors"
            title="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Primary search inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-4">
        {/* Keyword Search */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Keyword or Title
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="e.g. Waterfront, Pool, Penthouse"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Location selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Prime Enclave / City
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-amber-500 absolute left-3 top-2.5 pointer-events-none" />
            <select
              value={filters.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">All Prime Locations (Nigeria)</option>
              <option value="Banana Island">Banana Island, Ikoyi</option>
              <option value="Ikoyi">Ikoyi, Lagos</option>
              <option value="Victoria Island">Victoria Island, Lagos</option>
              <option value="Lekki Phase 1">Lekki Phase 1, Lagos</option>
              <option value="Eko Atlantic">Eko Atlantic City</option>
              <option value="Ikeja GRA">Ikeja GRA, Lagos</option>
              <option value="Maitama">Maitama, Abuja</option>
              <option value="Guzape">Guzape District, Abuja</option>
              <option value="Old GRA">Old GRA, Port Harcourt</option>
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Property Category
          </label>
          <div className="relative">
            <Home className="w-4 h-4 text-amber-500 absolute left-3 top-2.5 pointer-events-none" />
            <select
              value={filters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">All Property Categories</option>
              <option value="Luxury Villa">Luxury Villa</option>
              <option value="Mansion">Ambassadorial Mansion</option>
              <option value="Penthouse">Duplex Penthouse</option>
              <option value="Contemporary Duplex">Contemporary Duplex</option>
              <option value="Terrace House">Terrace House</option>
              <option value="Commercial">Commercial Office</option>
            </select>
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Bedrooms
          </label>
          <select
            value={filters.bedrooms}
            onChange={(e) => handleChange('bedrooms', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="ANY">Any Bedrooms</option>
            <option value="3">3+ Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
            <option value="5">5+ Bedrooms</option>
            <option value="6">6+ Bedrooms</option>
          </select>
        </div>
      </div>

      {/* Advanced Price Range Filter */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Minimum Price (₦ Naira)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-amber-600">₦</span>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleChange('minPrice', e.target.value)}
                placeholder="e.g. 50,000,000"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Maximum Price (₦ Naira)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-amber-600">₦</span>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
                placeholder="e.g. 1,500,000,000"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
