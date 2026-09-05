const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function safeFetchJson<T = any>(res: Response): Promise<ApiResponse<T>> {
  try {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await res.json()) as ApiResponse<T>;
    }
    const text = await res.text();
    console.error("Server returned non-JSON response:", res.status, text.slice(0, 200));
    return {
      success: false,
      data: null as any,
      message: `Server error (${res.status}): Respons bukan format JSON`,
    };
  } catch (err) {
    console.error("JSON parse error:", err);
    return {
      success: false,
      data: null as any,
      message: "Gagal membaca data dari server",
    };
  }
}

async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await safeFetchJson<T>(res);
  
  if (!res.ok || !data.success) {
    throw new ApiError(data.message || 'Terjadi kesalahan pada server', res.status, data);
  }
  
  return data;
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ─── Auth & API Methods ───
export const api = {
  // Users
  getMe: () => apiFetch('/api/users/me'),
  searchUsers: (q: string) => apiFetch(`/api/users/search?q=${encodeURIComponent(q)}`),
  getUserByQr: (qrId: string) => apiFetch(`/api/users/by-qr/${qrId}`),
  getCitizens: (params?: { page?: number; limit?: number; q?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.q) searchParams.set('q', params.q);
    return apiFetch(`/api/users/citizens?${searchParams}`);
  },
  getCitizenDetail: (id: string) => apiFetch(`/api/users/citizens/${id}`),
  
  // Transactions
  getMyTransactions: (params?: { page?: number; limit?: number }) =>
    apiFetch(`/api/transactions/my?page=${params?.page || 1}&limit=${params?.limit || 10}`),
  getAllTransactions: (params?: { page?: number; limit?: number; citizen_id?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.citizen_id) searchParams.set('citizen_id', params.citizen_id);
    if (params?.status) searchParams.set('status', params.status);
    return apiFetch(`/api/transactions?${searchParams}`);
  },
  createTransaction: (data: {
    citizen_id: string;
    waste_category_id: string;
    weight_kg: number;
    notes?: string;
    photo_url?: string;
    status?: 'PENDING' | 'VALIDATED';
  }) => apiFetch('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
  validateTransaction: (id: string) =>
    apiFetch(`/api/transactions/${id}/validate`, { method: 'PATCH' }),
  
  // Waste Categories
  getCategories: () => apiFetch('/api/waste-categories'),
  
  // Leaderboard
  getLeaderboard: (params?: { month?: number; year?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.month) searchParams.set('month', String(params.month));
    if (params?.year) searchParams.set('year', String(params.year));
    return apiFetch(`/api/leaderboard?${searchParams}`);
  },
  getMonthlyStats: () => apiFetch('/api/leaderboard/monthly-stats'),
  getBadges: () => apiFetch('/api/leaderboard/badges'),
  
  // Products
  getProducts: (params?: { page?: number; limit?: number }) =>
    apiFetch(`/api/products?page=${params?.page || 1}&limit=${params?.limit || 12}`),
  getProduct: (id: string) => apiFetch(`/api/products/${id}`),
  createProduct: (data: Record<string, unknown>) =>
    apiFetch('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  
  // Orders
  createOrder: (data: { product_id: string; quantity?: number; points_used?: number }) =>
    apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: (params?: { page?: number }) =>
    apiFetch(`/api/orders/my?page=${params?.page || 1}`),

  // Events (Volunteer Hub)
  getEvents: (params?: { page?: number }) => apiFetch(`/api/events?page=${params?.page || 1}`),
  getMyEvents: () => apiFetch('/api/events/my'),
  getEvent: (id: string) => apiFetch(`/api/events/${id}`),
  createEvent: (data: Record<string, unknown>) => apiFetch('/api/events', { method: 'POST', body: JSON.stringify(data) }),
  joinEvent: (id: string) => apiFetch(`/api/events/${id}/join`, { method: 'POST' }),
  markAttendance: (data: { event_id: string; citizen_id: string }) => apiFetch('/api/events/attendance', { method: 'POST', body: JSON.stringify(data) }),

  // AI Chatbot
  sendChatMessage: (message: string) => apiFetch('/api/chat', { method: 'POST', body: JSON.stringify({ message }) }),

  // B2B Waste Stock
  getB2BWasteStock: () => apiFetch('/api/b2b/waste-stock'),
  submitB2BBuyRequest: (data: { waste_category_id: string; target_weight_kg: number; notes?: string }) => apiFetch('/api/b2b/buy-request', { method: 'POST', body: JSON.stringify(data) }),
};

export default api;
