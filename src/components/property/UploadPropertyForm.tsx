import React, { useState, useRef } from 'react';
import { api } from '../../services/api';
import { Property } from '../../types';
import {
  Upload,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Image as ImageIcon,
  RotateCcw,
  Check,
  Plus,
  Eye,
  Building,
} from 'lucide-react';

interface UploadPropertyFormProps {
  onSuccess?: (property: Property) => void;
  onCancel?: () => void;
  isCompactModal?: boolean;
}

const COMMON_ENCLAVES = [
  { area: 'Banana Island, Ikoyi', city: 'Lagos', state: 'Lagos', defaultAddress: 'Shoreline Drive, Banana Island, Ikoyi' },
  { area: 'Lekki Phase 1', city: 'Lagos', state: 'Lagos', defaultAddress: 'Admiralty Way Enclave, Lekki Phase 1' },
  { area: 'Victoria Island', city: 'Lagos', state: 'Lagos', defaultAddress: 'Ahmadu Bello Way, Victoria Island' },
  { area: 'Eko Atlantic City', city: 'Lagos', state: 'Lagos', defaultAddress: 'Marina Boulevard, Eko Atlantic City' },
  { area: 'Ikeja GRA', city: 'Lagos', state: 'Lagos', defaultAddress: 'Isaac John Corridor, Ikeja GRA' },
  { area: 'Maitama', city: 'Abuja', state: 'FCT Abuja', defaultAddress: 'Gana Street Extension, Maitama, Abuja' },
  { area: 'Guzape', city: 'Abuja', state: 'FCT Abuja', defaultAddress: 'Hilltop Crest Enclave, Guzape, Abuja' },
  { area: 'Old GRA', city: 'Port Harcourt', state: 'Rivers', defaultAddress: 'Forces Avenue, Old GRA, Port Harcourt' },
];

const POPULAR_AMENITIES = [
  '24/7 Power',
  'Swimming Pool',
  'Private Cinema',
  'Elevator',
  'Waterfront Jetty',
  'Smart Automation',
  "Governor's Consent",
  'C of O Title',
  'CCTV Security',
  'Fitted Kitchen',
  'Staff Quarters (BQ)',
  'Gym & Spa',
];

const PRESET_SAMPLE_IMAGES = [
  { label: 'Luxury Villa', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Smart Duplex', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Penthouse', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Terrace', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80' },
];

export const UploadPropertyForm: React.FC<UploadPropertyFormProps> = ({
  onSuccess,
  onCancel,
  isCompactModal = false,
}) => {
  const [uploadMode, setUploadMode] = useState<'FILE' | 'URL'>('FILE');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Luxury Villa',
    listingType: 'SALE' as 'SALE' | 'RENT' | 'LEASE',
    price: 350000000,
    area: 'Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos',
    address: 'Admiralty Way, Lekki Phase 1, Lagos',
    bedrooms: 5,
    bathrooms: 5,
    toilets: 6,
    parkingSpaces: 4,
    propertySize: 600,
    description: '',
    amenities: ['24/7 Power', 'Swimming Pool', 'CCTV Security', 'Fitted Kitchen'],
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast('Image file exceeds 15MB limit. Please select a smaller photo.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImagePreview(result);
        showToast('Picture uploaded successfully and ready to publish!');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const selectEnclave = (enc: typeof COMMON_ENCLAVES[0]) => {
    setFormData((prev) => ({
      ...prev,
      area: enc.area,
      city: enc.city,
      state: enc.state,
      address: enc.defaultAddress,
    }));
  };

  const handleGenerateAIDescription = async () => {
    setAiGenerating(true);
    try {
      const res = await api.gemini.generateDescription({
        title: formData.title || `${formData.bedrooms}-Bedroom ${formData.category}`,
        category: formData.category,
        listingType: formData.listingType,
        location: `${formData.area}, ${formData.city}`,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        price: formData.price,
        amenities: formData.amenities,
      });

      if (res.success && res.description) {
        setFormData((prev) => ({ ...prev, description: res.description }));
        showToast('PrimeNest AI description generated!');
      }
    } catch (err) {
      showToast('AI generation unavailable, please type description.', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please enter a property title.', 'error');
      return;
    }

    setLoading(true);
    try {
      const finalImage =
        uploadMode === 'FILE' && uploadedImagePreview
          ? uploadedImagePreview
          : formData.imageUrl || PRESET_SAMPLE_IMAGES[0].url;

      const res = await api.properties.create({
        title: formData.title,
        description: formData.description || `Exquisite ${formData.bedrooms}-bedroom ${formData.category} in ${formData.area}. Fully verified title documents and luxury fittings.`,
        category: formData.category,
        listingType: formData.listingType,
        price: Number(formData.price),
        area: formData.area,
        address: formData.address,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        toilets: Number(formData.toilets),
        parkingSpaces: Number(formData.parkingSpaces),
        propertySize: Number(formData.propertySize),
        amenities: formData.amenities,
        images: [finalImage],
      });

      if (res.success) {
        showToast('Property published successfully to live inventory!', 'success');
        if (onSuccess) {
          onSuccess(res.data);
        }
      } else {
        throw new Error(res.message || 'Failed to upload property');
      }
    } catch (err: any) {
      showToast(err.message || 'Error uploading property', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatNaira = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const activeImage =
    uploadMode === 'FILE' && uploadedImagePreview
      ? uploadedImagePreview
      : formData.imageUrl || PRESET_SAMPLE_IMAGES[0].url;

  return (
    <div className={`bg-white rounded-2xl ${isCompactModal ? 'p-4 sm:p-5' : 'p-5 sm:p-6 shadow-sm border border-slate-200'}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`mb-4 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700 ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold font-serif-luxury text-slate-900">
              Upload New Property Listing
            </h3>
            <span className="text-[10px] bg-amber-400/20 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
              Admin Full Access
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fast, responsive property publisher with image upload and instant live preview.
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Close"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Grid: Left side Inputs, Right side Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN: Form Inputs (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* 1. Picture Source (File vs URL) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Property Picture</span>
                </label>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setUploadMode('FILE')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      uploadMode === 'FILE'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('URL')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      uploadMode === 'URL'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>Image URL</span>
                  </button>
                </div>
              </div>

              {uploadMode === 'FILE' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-slate-300 hover:border-amber-500 bg-white rounded-xl p-3 text-center cursor-pointer transition-colors"
                  >
                    {uploadedImagePreview ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={uploadedImagePreview}
                          alt="Preview"
                          className="w-16 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 truncate">
                            <Check className="w-3.5 h-3.5" /> Picture selected
                          </p>
                          <p className="text-[10px] text-slate-400">Click to change picture</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-1.5 text-xs text-slate-600">
                        <Upload className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-slate-700">Click or tap to choose picture file</span>
                        <span className="text-[10px] text-slate-400">(JPG, PNG, WEBP)</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  {/* Preset quick image links */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[10px]">
                    <span className="text-slate-400 shrink-0">Presets:</span>
                    {PRESET_SAMPLE_IMAGES.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                        className="px-2 py-0.5 rounded bg-slate-200/80 hover:bg-amber-100 hover:text-amber-900 text-slate-700 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-7">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Property Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. The Sovereign: 5-Bedroom Waterfront Villa"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="Luxury Villa">Luxury Villa</option>
                  <option value="Mansion">Ambassadorial Mansion</option>
                  <option value="Penthouse">Duplex Penthouse</option>
                  <option value="Contemporary Duplex">Contemporary Duplex</option>
                  <option value="Terrace Duplex">Terrace Duplex</option>
                  <option value="Apartment">Luxury Apartment</option>
                  <option value="Commercial">Commercial Office</option>
                </select>
              </div>
            </div>

            {/* 3. Listing Type, Price & Instant Naira formatted counter */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Type</label>
                <select
                  value={formData.listingType}
                  onChange={(e) => setFormData({ ...formData, listingType: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-semibold cursor-pointer"
                >
                  <option value="SALE">For Sale</option>
                  <option value="RENT">For Rent</option>
                  <option value="LEASE">Commercial Lease</option>
                </select>
              </div>

              <div className="sm:col-span-8">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700">Price (₦ Naira)</label>
                  <span className="text-[11px] font-bold text-amber-600 font-mono">
                    {formatNaira(formData.price)} {formData.listingType === 'RENT' ? '/yr' : ''}
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min={1000000}
                  step={500000}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            {/* 4. Enclave Quick Select & Address */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">Prime Enclave / Location</label>
                <span className="text-[10px] text-slate-400">1-click popular hubs:</span>
              </div>

              {/* Quick enclave chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] scrollbar-thin">
                {COMMON_ENCLAVES.map((enc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectEnclave(enc)}
                    className={`px-2 py-0.5 rounded-md border transition-all whitespace-nowrap cursor-pointer ${
                      formData.area === enc.area
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {enc.area}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enclave / Area (e.g. Banana Island, Ikoyi)"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Full Street Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* 5. Specs Grid (Beds, Baths, Toilets, Parking, Size) */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Beds</label>
                <input
                  type="number"
                  min={0}
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                  className="w-full text-center px-1 py-1 border border-slate-300 rounded-md text-xs font-bold bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Baths</label>
                <input
                  type="number"
                  min={0}
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                  className="w-full text-center px-1 py-1 border border-slate-300 rounded-md text-xs font-bold bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Toilets</label>
                <input
                  type="number"
                  min={0}
                  value={formData.toilets}
                  onChange={(e) => setFormData({ ...formData, toilets: Number(e.target.value) })}
                  className="w-full text-center px-1 py-1 border border-slate-300 rounded-md text-xs font-bold bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Parking</label>
                <input
                  type="number"
                  min={0}
                  value={formData.parkingSpaces}
                  onChange={(e) => setFormData({ ...formData, parkingSpaces: Number(e.target.value) })}
                  className="w-full text-center px-1 py-1 border border-slate-300 rounded-md text-xs font-bold bg-white"
                />
              </div>
              <div className="col-span-4 sm:col-span-1">
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Size (m²)</label>
                <input
                  type="number"
                  min={10}
                  value={formData.propertySize}
                  onChange={(e) => setFormData({ ...formData, propertySize: Number(e.target.value) })}
                  className="w-full text-center px-1 py-1 border border-slate-300 rounded-md text-xs font-bold bg-white"
                />
              </div>
            </div>

            {/* 6. Description & AI Generator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">Property Description</label>
                <button
                  type="button"
                  onClick={handleGenerateAIDescription}
                  disabled={aiGenerating}
                  className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {aiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  <span>Generate with AI</span>
                </button>
              </div>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Architectural features, Carrara marble, Savant smart automation, legal titles..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* 7. Quick Clickable Amenities */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Amenities & Verified Features ({formData.amenities.length} selected)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_AMENITIES.map((am, i) => {
                  const isSelected = formData.amenities.includes(am);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleAmenity(am)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5 text-slate-400" />}
                      <span>{am}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Interactive Preview Card (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3 bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Live Listing Preview
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Ready to Publish
                </span>
              </div>

              {/* Mock Card Preview */}
              <div className="mt-3 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-lg">
                <div className="relative h-40 sm:h-44 overflow-hidden">
                  <img
                    src={activeImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                    {formData.listingType}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {formData.category}
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <div className="text-base font-bold text-amber-400 font-mono">
                    {formatNaira(formData.price)}
                    {formData.listingType === 'RENT' && <span className="text-xs text-slate-400">/yr</span>}
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {formData.title || 'Untitled Property'}
                  </h4>

                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{formData.area}, {formData.city}</span>
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-300 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3 text-amber-400" /> {formData.bedrooms} Beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3 h-3 text-amber-400" /> {formData.bathrooms} Baths
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize className="w-3 h-3 text-amber-400" /> {formData.propertySize} m²
                    </span>
                  </div>

                  {formData.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {formData.amenities.slice(0, 3).map((a, i) => (
                        <span key={i} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {a}
                        </span>
                      ))}
                      {formData.amenities.length > 3 && (
                        <span className="text-[9px] text-amber-400 font-bold px-1">
                          +{formData.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick helper tip */}
            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
              💡 <strong className="text-slate-300">Admin Tip:</strong> Properties published here appear instantly in the live search, on the homepage, and are automatically indexed by the PrimeNest AI Advisor.
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500">
            Mandatory: Title & Price. Photo is uploaded automatically.
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Plus className="w-4 h-4 text-slate-950" />}
              <span>Publish Property Listing</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
