import React from 'react';
import { Link } from 'react-router-dom';
import { Property } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Heart,
  Car,
  Calendar,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onQuickInspect?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onQuickInspect }) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const favorited = isFavorite(property.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30 pointer-events-none" />

        {/* Badges on top */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider text-white shadow-sm ${
              property.listingType === 'SALE'
                ? 'bg-amber-600'
                : property.listingType === 'RENT'
                ? 'bg-emerald-600'
                : 'bg-indigo-600'
            }`}
          >
            For {property.listingType}
          </span>
          {property.featured && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider bg-slate-950/80 text-amber-400 border border-amber-400/40 backdrop-blur-md">
              ★ Featured
            </span>
          )}
          {property.status === 'UNDER_OFFER' && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider bg-purple-600 text-white">
              Under Offer
            </span>
          )}
        </div>

        {/* Save to Favorites Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer ${
            favorited
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-slate-950/60 hover:bg-slate-950 text-white hover:text-red-400'
          }`}
          title={favorited ? 'Remove from saved' : 'Save to favourites'}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
        </button>

        {/* Category Pill on bottom image */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="text-[11px] font-medium bg-slate-950/80 backdrop-blur-md text-slate-200 px-2.5 py-1 rounded-md border border-slate-700/60">
            {property.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight font-serif-luxury">
              {formatPrice(property.price)}
            </span>
            {property.listingType === 'RENT' && (
              <span className="text-xs text-slate-500 font-medium">/ annum</span>
            )}
          </div>

          {/* Title */}
          <Link to={`/properties/${property.id}`} className="block group-hover:text-amber-600 transition-colors">
            <h3 className="font-bold text-slate-900 text-base line-clamp-1 leading-snug">
              {property.title}
            </h3>
          </Link>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{property.area}, {property.city}</span>
          </div>

          {/* Specs / Features Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 mt-3 border-y border-slate-100 text-xs text-slate-700">
            <div className="flex items-center gap-1.5" title={`${property.bedrooms} Bedrooms`}>
              <Bed className="w-4 h-4 text-slate-400" />
              <span><strong>{property.bedrooms}</strong> Beds</span>
            </div>
            <div className="flex items-center gap-1.5" title={`${property.bathrooms} Bathrooms`}>
              <Bath className="w-4 h-4 text-slate-400" />
              <span><strong>{property.bathrooms}</strong> Baths</span>
            </div>
            <div className="flex items-center gap-1.5" title={`${property.propertySize} sqm Area`}>
              <Maximize2 className="w-4 h-4 text-slate-400" />
              <span><strong>{property.propertySize}</strong> m²</span>
            </div>
          </div>
        </div>

        {/* Footer info: Action buttons */}
        <div className="mt-4 pt-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            ✓ Verified Title
          </span>

          <div className="flex items-center gap-1.5">
            {onQuickInspect && (
              <button
                onClick={() => onQuickInspect(property)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                title="Book inspection date"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Inspect</span>
              </button>
            )}

            <Link
              to={`/properties/${property.id}`}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <span>Details</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
