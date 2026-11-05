import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Property,
  Inquiry,
  Appointment,
  Transaction,
  DashboardAnalytics,
  User,
} from '../types';
import {
  LayoutDashboard,
  Building,
  Users,
  MessageSquare,
  Calendar,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Download,
  DollarSign,
  TrendingUp,
  Award,
  Loader2,
  MapPin,
  ExternalLink,
  Shield,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useSearchParams } from 'react-router-dom';
import { UploadPropertyForm } from '../components/property/UploadPropertyForm';

export const DashboardPage: React.FC = () => {
  const { user, isAdmin, isClient } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab initialized from query parameter (e.g. ?tab=upload) or default to 'overview'
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Data states
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [addPropertyModalOpen, setAddPropertyModalOpen] = useState(false);
  const [recordTxModalOpen, setRecordTxModalOpen] = useState(false);

  // Filter for Buyer payments (All, Paid, Pending)
  const [txFilter, setTxFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');

  // AI Description Generator state
  const [aiGenerating, setAiGenerating] = useState(false);

  // Property creation state with both Picture File Upload and URL option
  const [uploadMode, setUploadMode] = useState<'FILE' | 'URL'>('FILE');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProp, setNewProp] = useState({
    title: '',
    description: '',
    category: 'Luxury Villa',
    listingType: 'SALE' as 'SALE' | 'RENT' | 'LEASE',
    price: 350000000,
    area: 'Lekki Phase 1',
    address: 'Admiralty Way, Lekki Phase 1, Lagos',
    bedrooms: 5,
    bathrooms: 5,
    toilets: 6,
    parkingSpaces: 4,
    propertySize: 600,
    amenities: '24/7 Power, Swimming Pool, CCTV, Fitted Kitchen, Private Cinema',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  });

  // Transaction record state
  const [newTx, setNewTx] = useState({
    propertyId: '',
    transactionType: 'SALE',
    amount: 350000000,
    buyerOrTenantName: '',
    buyerOrTenantEmail: '',
    buyerOrTenantPhone: '',
    paymentStatus: 'PAID' as 'PAID' | 'PENDING',
    notes: '',
  });

  const [dashboardFeedback, setDashboardFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setDashboardFeedback({ message, type });
    setTimeout(() => setDashboardFeedback(null), 4500);
  };

  const loadAllDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, propsRes, inqRes, aptRes, txRes] = await Promise.all([
        api.analytics.getDashboard(),
        api.properties.list({ limit: 100, all: 'true' }),
        api.inquiries.list(),
        api.appointments.list(),
        api.transactions.list(),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (propsRes.success) setProperties(propsRes.data);
      if (inqRes.success) setInquiries(inqRes.data);
      if (aptRes.success) setAppointments(aptRes.data);
      if (txRes.success) setTransactions(txRes.data);

      if (isAdmin) {
        try {
          const clientsRes = await api.analytics.getClients();
          if (clientsRes.success) setClients(clientsRes.data);
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllDashboardData();
  }, [user]);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Image File Reader for Admin picture upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size exceeds 10MB. Please select an optimized image file.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAIDescription = async () => {
    setAiGenerating(true);
    try {
      const amenitiesArr = newProp.amenities.split(',').map((s) => s.trim());
      const res = await api.gemini.generateDescription({
        title: newProp.title || 'Luxury Residence',
        category: newProp.category,
        listingType: newProp.listingType,
        location: newProp.area,
        bedrooms: newProp.bedrooms,
        bathrooms: newProp.bathrooms,
        price: newProp.price,
        amenities: amenitiesArr,
      });

      if (res.success && res.description) {
        setNewProp({ ...newProp, description: res.description });
        showToast('Gemini AI description generated successfully!', 'success');
      }
    } catch (err) {
      showToast('Failed to generate description with Gemini AI', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreatePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amenitiesArr = newProp.amenities.split(',').map((s) => s.trim());
      const finalImage =
        uploadMode === 'FILE' && uploadedImagePreview
          ? uploadedImagePreview
          : newProp.imageUrl ||
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

      const res = await api.properties.create({
        title: newProp.title,
        description: newProp.description,
        category: newProp.category,
        listingType: newProp.listingType,
        price: Number(newProp.price),
        area: newProp.area,
        address: newProp.address,
        bedrooms: Number(newProp.bedrooms),
        bathrooms: Number(newProp.bathrooms),
        toilets: Number(newProp.toilets),
        parkingSpaces: Number(newProp.parkingSpaces),
        propertySize: Number(newProp.propertySize),
        amenities: amenitiesArr,
        images: [finalImage],
      });

      if (res.success) {
        showToast('Property uploaded and published to PrimeNest Realty successfully!', 'success');
        setAddPropertyModalOpen(false);
        setUploadedImagePreview('');
        await loadAllDashboardData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create property', 'error');
    }
  };

  const handleConfirmDeleteProperty = async () => {
    if (!propertyToDelete) return;
    try {
      await api.properties.delete(propertyToDelete.id);
      showToast(`Property "${propertyToDelete.title}" removed successfully.`, 'success');
      setPropertyToDelete(null);
      await loadAllDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete property', 'error');
    }
  };

  const handleUpdatePaymentStatus = async (txId: string, status: 'PAID' | 'PENDING') => {
    try {
      await api.transactions.updateStatus(txId, {
        paymentStatus: status,
        notes: status === 'PAID' ? 'Payment verified and confirmed by Administrator.' : 'Pending buyer bank transfer.',
      });
      showToast(`Payment status updated to ${status}.`, 'success');
      await loadAllDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update payment status', 'error');
    }
  };

  const handleRecordTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.transactions.record({
        propertyId: newTx.propertyId || properties[0]?.id,
        transactionType: newTx.transactionType,
        amount: Number(newTx.amount),
        buyerOrTenantName: newTx.buyerOrTenantName,
        buyerOrTenantEmail: newTx.buyerOrTenantEmail,
        buyerOrTenantPhone: newTx.buyerOrTenantPhone,
        paymentStatus: newTx.paymentStatus,
        notes: newTx.notes,
      });

      if (res.success) {
        showToast('Purchase order / transaction logged successfully!', 'success');
        setRecordTxModalOpen(false);
        await loadAllDashboardData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to record transaction', 'error');
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Reference,Property,BuyerName,BuyerEmail,Amount,Status,Date']
        .concat(
          transactions.map(
            (t) =>
              `"${t.referenceNumber}","${t.propertyTitle.replace(/"/g, '""')}","${t.buyerOrTenantName}","${t.buyerOrTenantEmail}","${t.amount}","${t.paymentStatus}","${t.transactionDate}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KunlexCity_Buyers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered transactions for paid or pending to buy
  const filteredTransactions = transactions.filter((t) => {
    if (txFilter === 'PAID') return t.paymentStatus === 'PAID';
    if (txFilter === 'PENDING') return t.paymentStatus === 'PENDING';
    return true;
  });

  const COLORS = ['#D4AF37', '#0F172A', '#10B981', '#6366F1', '#EC4899'];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20">
      {/* Top Banner */}
      <div className="bg-slate-950 text-white border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              {isAdmin ? <Shield className="w-6 h-6" /> : <LayoutDashboard className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-serif-luxury text-white">
                  {isAdmin ? 'Administrator Command Center' : 'Client / Buyer Dashboard'}
                </h1>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isAdmin ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 text-white'
                  }`}
                >
                  {isAdmin ? 'Full Admin Access' : 'Registered Buyer'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Logged in as <strong>{isAdmin ? (user?.name || 'Administrator') : (user?.name || user?.email)}</strong>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => setAddPropertyModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload New Property</span>
                </button>
                <button
                  onClick={() => setRecordTxModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Log Purchase Order</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Export CSV</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Overview & Analytics', icon: LayoutDashboard },
            ...(isAdmin ? [{ id: 'upload', label: 'Upload Property', icon: Plus }] : []),
            {
              id: 'purchases',
              label: isAdmin ? 'Buyer Orders & Payments (Paid / Pending)' : 'My Purchase Orders & Payments',
              icon: CreditCard,
              badge: transactions.length,
            },
            ...(isAdmin ? [{ id: 'properties', label: 'Property Inventory', icon: Building, badge: properties.length }] : []),
            { id: 'inquiries', label: 'Property Inquiries', icon: MessageSquare, badge: inquiries.length },
            { id: 'appointments', label: 'Scheduled Inspections', icon: Calendar, badge: appointments.length },
            ...(isAdmin ? [{ id: 'clients', label: 'Registered Clients Directory', icon: Users, badge: clients.length }] : []),
          ].map(({ id, label, icon: Icon, badge }: any) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-950 text-amber-400 shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{label}</span>
                {typeof badge === 'number' && badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Buyers Who Have Paid
                </span>
                <span className="text-2xl font-extrabold text-emerald-600 font-serif-luxury mt-1 block">
                  {analytics?.kpis.paidBuyersCount || transactions.filter((t) => t.paymentStatus === 'PAID').length}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {formatNaira(analytics?.kpis.totalPaidVolume || 465000000)} settled
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Pending to Buy / Pay
                </span>
                <span className="text-2xl font-extrabold text-amber-600 font-serif-luxury mt-1 block">
                  {analytics?.kpis.pendingBuyersCount || transactions.filter((t) => t.paymentStatus === 'PENDING').length}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {formatNaira(analytics?.kpis.totalPendingVolume || 1850000000)} pending
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Live Properties
                </span>
                <span className="text-2xl font-extrabold text-slate-900 font-serif-luxury mt-1 block">
                  {analytics?.kpis.activeListings || properties.length}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">Available on Portal</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Registered Clients
                </span>
                <span className="text-2xl font-extrabold text-indigo-600 font-serif-luxury mt-1 block">
                  {analytics?.kpis.totalClients || clients.length || 2}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Verified buyer accounts</span>
              </div>
            </div>

            {/* Visual Analytics */}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 font-serif-luxury">
                    Historical Sales & Revenue Performance
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.monthlyData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₦${(val / 1000000).toFixed(0)}M`} />
                        <Tooltip
                          formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Settled Revenue']}
                          contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#D4AF37" fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 font-serif-luxury">
                    Portfolio Categories
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.categoriesData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={45}
                          paddingAngle={3}
                        >
                          {analytics.categoriesData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: DEDICATED UPLOAD NEW PROPERTY (ADMIN) */}
        {activeTab === 'upload' && isAdmin && (
          <div className="space-y-4 animate-fade-in">
            <UploadPropertyForm
              onSuccess={(newProp) => {
                showToast(`Property "${newProp.title}" published successfully to PrimeNest live inventory!`, 'success');
                loadAllDashboardData();
                setActiveTab('properties');
              }}
              onCancel={() => setActiveTab('properties')}
            />
          </div>
        )}

        {/* TAB 2: BUYER ORDERS & PAYMENT STATUS (PAID OR PENDING TO BUY) */}
        {activeTab === 'purchases' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold font-serif-luxury text-slate-950">
                  {isAdmin ? 'Client / Buyer Purchase Orders & Payment Status' : 'My Purchase Orders'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAdmin
                    ? 'Track every Client/Buyer who has Paid or is currently Pending to buy the property.'
                    : 'Review the payment confirmation status of your property purchases.'}
                </p>
              </div>

              {/* Status Filter buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setTxFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    txFilter === 'ALL' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({transactions.length})
                </button>
                <button
                  onClick={() => setTxFilter('PAID')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    txFilter === 'PAID' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Paid ({transactions.filter((t) => t.paymentStatus === 'PAID').length})</span>
                </button>
                <button
                  onClick={() => setTxFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    txFilter === 'PENDING' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-amber-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending to Buy ({transactions.filter((t) => t.paymentStatus === 'PENDING').length})</span>
                </button>
              </div>
            </div>

            {/* Table of Buyers */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-semibold">
                    <th className="p-3">Reference #</th>
                    <th className="p-3">Property</th>
                    <th className="p-3">Client / Buyer</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payment Status</th>
                    <th className="p-3">Notes</th>
                    <th className="p-3">Date</th>
                    {isAdmin && <th className="p-3 text-right">Admin Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">{tx.referenceNumber}</td>
                      <td className="p-3 font-semibold text-slate-900 max-w-xs">{tx.propertyTitle}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{tx.buyerOrTenantName}</span>
                        <span className="text-[10px] text-slate-500">{tx.buyerOrTenantEmail}</span>
                      </td>
                      <td className="p-3 font-extrabold text-slate-950">{formatNaira(tx.amount)}</td>
                      <td className="p-3">
                        {tx.paymentStatus === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>PAID / COMPLETED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>PENDING TO BUY</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 text-[11px] max-w-xs truncate">{tx.notes}</td>
                      <td className="p-3 text-slate-400">
                        {new Date(tx.transactionDate).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <td className="p-3 text-right">
                          {tx.paymentStatus === 'PENDING' ? (
                            <button
                              onClick={() => handleUpdatePaymentStatus(tx.id, 'PAID')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                              title="Confirm full payment received"
                            >
                              Mark as Paid
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdatePaymentStatus(tx.id, 'PENDING')}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-semibold"
                              title="Revert to Pending"
                            >
                              Revert
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN PROPERTY MANAGEMENT */}
        {activeTab === 'properties' && isAdmin && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold font-serif-luxury text-slate-900">
                  Property Portfolio Management
                </h3>
                <p className="text-xs text-slate-500">
                  Upload new listings using high-resolution picture files or image URLs.
                </p>
              </div>

              <button
                onClick={() => setAddPropertyModalOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload New Property</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-semibold">
                    <th className="p-3">Property</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Views</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {properties.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-12 h-10 object-cover rounded-lg shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <span className="font-bold text-slate-900 truncate block">{p.title}</span>
                          <span className="text-[10px] text-slate-400">{p.category}</span>
                        </div>
                      </td>
                      <td className="p-3">{p.area}, {p.city}</td>
                      <td className="p-3 font-bold text-slate-900">{formatNaira(p.price)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">{p.listingType}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'AVAILABLE'
                              ? 'bg-blue-100 text-blue-800'
                              : p.status === 'SOLD'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-600">{p.viewsCount}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/properties/${p.id}`}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setPropertyToDelete(p)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold font-serif-luxury text-slate-900">
              Client & Buyer Inquiries
            </h3>
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{inq.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({inq.email} • {inq.phone})</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200">
                      via {inq.preferredContactMethod}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 italic">"{inq.message}"</p>
                  <p className="text-[11px] text-amber-800 font-medium">Ref Property: {inq.propertyTitle}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold font-serif-luxury text-slate-900">
              Scheduled Inspections & Walkthroughs
            </h3>
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{apt.clientName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {apt.inspectionType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Property: {apt.propertyTitle}</p>
                    <p className="text-xs text-slate-500">Date: {apt.inspectionDate} at {apt.inspectionTime}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 px-3 py-1 bg-emerald-50 rounded-lg">
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CLIENTS DIRECTORY */}
        {activeTab === 'clients' && isAdmin && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold font-serif-luxury text-slate-900">
              Registered Client & Buyer Accounts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={c.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                      <p className="text-xs text-slate-500">{c.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">Phone: {c.phone || 'Not provided'}</p>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">{c.purchasesCount || 0} Purchase Orders</span>
                    {c.hasPaid && <span className="text-emerald-600 font-bold">✓ Paid Buyer</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADMIN ADD / UPLOAD PROPERTY (COMPACT, RESPONSIVE & EASY TO USE) */}
      {addPropertyModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4 py-6">
          <div className="max-w-4xl w-full my-auto shadow-2xl animate-in zoom-in-95 duration-150">
            <UploadPropertyForm
              isCompactModal
              onSuccess={(newProp) => {
                showToast(`Property "${newProp.title}" published successfully!`, 'success');
                setAddPropertyModalOpen(false);
                loadAllDashboardData();
              }}
              onCancel={() => setAddPropertyModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* MODAL: LOG TRANSACTION / PURCHASE ORDER */}
      {recordTxModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 py-8">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold font-serif-luxury text-slate-900">
                Record Buyer Purchase & Payment
              </h3>
              <button onClick={() => setRecordTxModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleRecordTransactionSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Property</label>
                <select
                  value={newTx.propertyId}
                  onChange={(e) => setNewTx({ ...newTx, propertyId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({formatNaira(p.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    required
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={newTx.paymentStatus}
                    onChange={(e) => setNewTx({ ...newTx, paymentStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-bold"
                  >
                    <option value="PAID">PAID / Settled</option>
                    <option value="PENDING">PENDING to Buy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Client/Buyer Name</label>
                  <input
                    type="text"
                    required
                    value={newTx.buyerOrTenantName}
                    onChange={(e) => setNewTx({ ...newTx, buyerOrTenantName: e.target.value })}
                    placeholder="e.g. Chinedu Eze"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Buyer Email</label>
                  <input
                    type="email"
                    required
                    value={newTx.buyerOrTenantEmail}
                    onChange={(e) => setNewTx({ ...newTx, buyerOrTenantEmail: e.target.value })}
                    placeholder="buyer@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Wire Ref</label>
                <textarea
                  rows={2}
                  value={newTx.notes}
                  onChange={(e) => setNewTx({ ...newTx, notes: e.target.value })}
                  placeholder="Escrow confirmation, payment schedule..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-950 text-white hover:bg-amber-500 hover:text-slate-950 rounded-xl text-xs font-bold transition-all mt-2"
              >
                Log Purchase Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">Delete Property Listing?</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete <strong>{propertyToDelete.title}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPropertyToDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteProperty}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {dashboardFeedback && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-short">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-medium ${
              dashboardFeedback.type === 'success'
                ? 'bg-slate-950 text-white border-amber-500/40 shadow-amber-500/10'
                : 'bg-rose-950 text-white border-rose-500/40'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                dashboardFeedback.type === 'success' ? 'bg-amber-400' : 'bg-rose-400'
              }`}
            />
            <span className="flex-1">{dashboardFeedback.message}</span>
            <button
              onClick={() => setDashboardFeedback(null)}
              className="text-slate-400 hover:text-white font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
