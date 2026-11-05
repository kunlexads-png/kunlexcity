import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Property } from '../types';
import { api } from '../services/api';
import { PropertyCard } from '../components/property/PropertyCard';
import { PropertyFilterBar } from '../components/property/PropertyFilterBar';
import { ScheduleInspectionModal } from '../components/property/ScheduleInspectionModal';
import {
  ArrowUpDown,
  Building,
  Loader2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

interface PropertiesPageProps {
  onOpenAI?: () => void;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({ onOpenAI }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('newest');

  const [selectedPropertyForInspect, setSelectedPropertyForInspect] = useState<Property | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);

  // Read URL query params
  const locationParam = searchParams.get('location') || 'ALL';
  const categoryParam = searchParams.get('category') || 'ALL';
  const listingTypeParam = searchParams.get('listingType') || 'ALL';
  const searchParam = searchParams.get('search') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const bedroomsParam = searchParams.get('bedrooms') || 'ANY';

  const fetchProperties = async (page = 1, sort = sortOption) => {
    setLoading(true);
    try {
      const res = await api.properties.list({
        page,
        limit: 9,
        sort,
        search: searchParam,
        location: locationParam !== 'ALL' ? locationParam : undefined,
        category: categoryParam !== 'ALL' ? categoryParam : undefined,
        listingType: listingTypeParam !== 'ALL' ? listingTypeParam : undefined,
        minPrice: minPriceParam || undefined,
        maxPrice: maxPriceParam || undefined,
        bedrooms: bedroomsParam !== 'ANY' ? bedroomsParam : undefined,
      });

      if (res.success) {
        setProperties(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
        setCurrentPage(res.pagination.page);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(1, sortOption);
  }, [searchParams, sortOption]);

  const handleFilterChange = (filters: any) => {
    const nextParams = new URLSearchParams();
    if (filters.search) nextParams.set('search', filters.search);
    if (filters.location && filters.location !== 'ALL') nextParams.set('location', filters.location);
    if (filters.category && filters.category !== 'ALL') nextParams.set('category', filters.category);
    if (filters.listingType && filters.listingType !== 'ALL') nextParams.set('listingType', filters.listingType);
    if (filters.minPrice) nextParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) nextParams.set('maxPrice', filters.maxPrice);
    if (filters.bedrooms && filters.bedrooms !== 'ANY') nextParams.set('bedrooms', filters.bedrooms);

    setSearchParams(nextParams);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="max-w-2xl relative z-10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Verified Collection
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif-luxury">
              Luxury Property Listings
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Browse our curated portfolio of residential mansions, oceanfront penthouses, and commercial spaces across Nigeria's prime investment hubs.
            </p>
            {onOpenAI && (
              <div className="pt-2">
                <button
                  onClick={onOpenAI}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Consult PrimeNest AI Advisor (Budget, Specs, Locations)</span>
                </button>
              </div>
            )}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
            <Building className="w-full h-full text-amber-400" />
          </div>
        </div>

        {/* Filter Bar */}
        <PropertyFilterBar
          initialFilters={{
            search: searchParam,
            location: locationParam,
            category: categoryParam,
            listingType: listingTypeParam,
            minPrice: minPriceParam,
            maxPrice: maxPriceParam,
            bedrooms: bedroomsParam,
          }}
          onFilterChange={handleFilterChange}
        />

        {/* Results Bar: Total counts & Sorting */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b border-slate-200">
          <p className="text-sm text-slate-600 font-medium">
            Showing <strong className="text-slate-950">{properties.length}</strong> of{' '}
            <strong className="text-slate-950">{totalCount}</strong> verified properties
          </p>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-600">Sort By:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="size-desc">Largest Size (m²)</option>
              <option value="views-desc">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
            <p className="text-sm text-slate-500 font-medium">Loading verified properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
            <Building className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 font-serif-luxury">No properties matched your criteria</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Try adjusting your price range, location, or bedrooms filter, or consult PrimeNest AI for tailored options.
            </p>
            <button
              onClick={() => handleFilterChange({})}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onQuickInspect={(p) => {
                  setSelectedPropertyForInspect(p);
                  setInspectModalOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => fetchProperties(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="p-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => fetchProperties(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="p-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <ScheduleInspectionModal
        property={selectedPropertyForInspect}
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
      />
    </div>
  );
};
