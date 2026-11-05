export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  favsCount?: number;
  inquiriesCount?: number;
  appointmentsCount?: number;
  purchasesCount?: number;
  hasPaid?: boolean;
  hasPending?: boolean;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  listingType: 'SALE' | 'RENT' | 'LEASE';
  price: number;
  currency: string;
  country: string;
  state: string;
  city: string;
  area: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  parkingSpaces: number;
  propertySize: number;
  landSize?: number;
  amenities: string[];
  images: string[];
  status: 'AVAILABLE' | 'UNDER_OFFER' | 'SOLD' | 'RENTED';
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  featured: boolean;
  viewsCount: number;
  similarProperties?: Property[];
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredContactMethod: 'WHATSAPP' | 'CALL' | 'EMAIL';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  responseNotes?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  inspectionDate: string;
  inspectionTime: string;
  inspectionType: 'IN_PERSON' | 'VIRTUAL_TOUR';
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface Transaction {
  id: string;
  propertyId: string;
  propertyTitle: string;
  transactionType: 'SALE' | 'RENTAL' | 'LEASE';
  amount: number;
  currency: string;
  buyerOrTenantName: string;
  buyerOrTenantEmail: string;
  buyerOrTenantPhone?: string;
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL';
  referenceNumber: string;
  notes?: string;
  transactionDate: string;
}

export interface DashboardAnalytics {
  kpis: {
    totalProperties: number;
    activeListings: number;
    soldProperties: number;
    underOfferProperties: number;
    totalClients: number;
    totalInquiries: number;
    scheduledInspections: number;
    paidBuyersCount: number;
    pendingBuyersCount: number;
    totalPaidVolume: number;
    totalPendingVolume: number;
  };
  categoriesData: { name: string; count: number }[];
  monthlyData: { month: string; revenue: number }[];
  recentAuditLogs: {
    id: string;
    userId?: string;
    userName?: string;
    action: string;
    details: string;
    timestamp: string;
  }[];
}
