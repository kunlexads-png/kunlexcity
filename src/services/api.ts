
import {
  Property,
  User,
  UserRole,
  Inquiry,
  Appointment,
  Transaction,
  DashboardAnalytics,
} from '../types';

// API configuration
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || ''
).replace(/\/+$/, '');

const TOKEN_KEY = 'primenest_jwt_token';

// Authentication token storage
export const getStoredToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token: string) =>
  localStorage.setItem(TOKEN_KEY, token);

export const removeStoredToken = () =>
  localStorage.removeItem(TOKEN_KEY);

// Central API request function
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();

  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    // Retry once in case the server is starting
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (retryErr: any) {
      console.warn(`[API] Network error fetching ${url}:`, retryErr);

      throw new Error(
        `Unable to reach KunlexCity server at ${url}. Please ensure the service is running.`
      );
    }
  }

  let data: any = {};

  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(
        `Server returned HTTP ${response.status}: ${response.statusText}`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data as T;
}

export const api = {

  // AUTHENTICATION
  auth: {
    register: (payload: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) =>
      request<{ success: boolean; message: string }>(
        '/api/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      ),

    login: (payload: {
      email: string;
      password: string;
    }) =>
      request<{
        success: boolean;
        token: string;
        user: User;
        message: string;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getMe: () =>
      request<{ success: boolean; user: User }>(
        '/api/auth/me'
      ),

    switchDemoRole: (role: UserRole) =>
      request<{
        success: boolean;
        token: string;
        user: User;
        message: string;
      }>('/api/auth/switch-demo', {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),

    forgotPassword: (email: string) =>
      request<{ success: boolean; message: string }>(
        '/api/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      ),

    verifyEmail: (token: string) =>
      request<{ success: boolean; message: string }>(
        '/api/auth/verify-email',
        {
          method: 'POST',
          body: JSON.stringify({ token }),
        }
      ),

    resendVerification: (email: string) =>
      request<{ success: boolean; message: string }>(
        '/api/auth/resend-verification',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      ),
  },

  // PROPERTIES
  properties: {
    list: (
      params: Record<string, string | number | undefined> = {}
    ) => {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });

      return request<{
        success: boolean;
        data: Property[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/api/properties?${searchParams.toString()}`);
    },

    getById: (id: string) =>
      request<{ success: boolean; data: Property }>(
        `/api/properties/${id}`
      ),

    create: (data: Partial<Property>) =>
      request<{
        success: boolean;
        message: string;
        data: Property;
      }>('/api/properties', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Property>) =>
      request<{
        success: boolean;
        message: string;
        data: Property;
      }>(`/api/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<{ success: boolean; message: string }>(
        `/api/properties/${id}`,
        {
          method: 'DELETE',
        }
      ),

    updateStatus: (
      id: string,
      updates: {
        approvalStatus?: string;
        status?: string;
        featured?: boolean;
      }
    ) =>
      request<{
        success: boolean;
        message: string;
        data: Property;
      }>(`/api/properties/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    toggleFavorite: (id: string) =>
      request<{
        success: boolean;
        isFavorite: boolean;
        message: string;
      }>(`/api/properties/${id}/favorite`, {
        method: 'POST',
      }),

    getFavorites: () =>
      request<{ success: boolean; data: Property[] }>(
        '/api/properties/user/favorites'
      ),
  },

  // INQUIRIES
  inquiries: {
    submit: (payload: {
      propertyId: string;
      name: string;
      email: string;
      phone: string;
      message: string;
      preferredContactMethod?: string;
    }) =>
      request<{
        success: boolean;
        message: string;
        data: Inquiry;
      }>('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    list: () =>
      request<{ success: boolean; data: Inquiry[] }>(
        '/api/inquiries'
      ),

    updateStatus: (
      id: string,
      payload: {
        status?: string;
        responseNotes?: string;
      }
    ) =>
      request<{
        success: boolean;
        message: string;
        data: Inquiry;
      }>(`/api/inquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },

  // APPOINTMENTS / INSPECTIONS
  appointments: {
    schedule: (payload: {
      propertyId: string;
      clientName: string;
      clientEmail: string;
      clientPhone: string;
      inspectionDate: string;
      inspectionTime: string;
      inspectionType: 'IN_PERSON' | 'VIRTUAL_TOUR';
      notes?: string;
      userId?: string;
    }) =>
      request<{
        success: boolean;
        message: string;
        data: Appointment;
      }>('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    list: () =>
      request<{ success: boolean; data: Appointment[] }>(
        '/api/appointments'
      ),

    updateStatus: (
      id: string,
      payload: {
        status?: string;
        notes?: string;
      }
    ) =>
      request<{
        success: boolean;
        message: string;
        data: Appointment;
      }>(`/api/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },

  // TRANSACTIONS
  transactions: {
    list: () =>
      request<{ success: boolean; data: Transaction[] }>(
        '/api/transactions'
      ),

    record: (payload: {
      propertyId: string;
      transactionType?: string;
      amount: number;
      buyerOrTenantName: string;
      buyerOrTenantEmail: string;
      buyerOrTenantPhone?: string;
      paymentStatus?: 'PAID' | 'PENDING' | 'PARTIAL';
      notes?: string;
    }) =>
      request<{
        success: boolean;
        message: string;
        data: Transaction;
      }>('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    updateStatus: (
      id: string,
      payload: {
        paymentStatus: 'PAID' | 'PENDING';
        notes?: string;
      }
    ) =>
      request<{
        success: boolean;
        message: string;
        data: Transaction;
      }>(`/api/transactions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },

  // ANALYTICS & CLIENTS
  analytics: {
    getDashboard: () =>
      request<{
        success: boolean;
        data: DashboardAnalytics;
      }>('/api/analytics/dashboard'),

    getClients: () =>
      request<{
        success: boolean;
        data: User[];
      }>('/api/clients'),
  },

  // GEMINI AI ASSISTANT
  gemini: {
    chat: (
      message: string,
      history?: Array<{
        role: 'user' | 'model';
        parts: string;
      }>
    ) =>
      request<{
        success: boolean;
        data: {
          reply: string;
          recommendedProperties: Property[];
        };
      }>('/api/gemini/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
      }),

    generateDescription: (specs: {
      title: string;
      category: string;
      listingType: string;
      location: string;
      bedrooms: number;
      bathrooms: number;
      price: number;
      amenities: string[];
    }) =>
      request<{
        success: boolean;
        description: string;
      }>('/api/gemini/generate-description', {
        method: 'POST',
        body: JSON.stringify(specs),
      }),

    compare: (propertyIds: string[]) =>
      request<{
        success: boolean;
        data: {
          analysis: string;
          properties: Property[];
        };
      }>('/api/gemini/compare', {
        method: 'POST',
        body: JSON.stringify({ propertyIds }),
      }),
  },
};

