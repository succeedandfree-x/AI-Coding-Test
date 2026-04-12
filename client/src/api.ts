const API = '';

/** 首页「热门航线」航班卡（演示数据） */
export type HotRouteCard = {
  dep: string;
  arr: string;
  fromPrice: number;
  airlineCode: string;
  airlineColor: string;
  airlineName: string;
  flightNo: string;
  depTime: string;
  arrTime: string;
  depAirport: string;
  arrAirport: string;
  durationText: string;
  stopSummary: string;
  stopDetail: string | null;
  badgeText: string;
  totalPrice: number;
  transparencyNote: string;
  channels: { label: string; price: number }[];
  riskNote: string | null;
  baggage: string;
  detailExtra: string;
};

export type Flight = {
  id: string;
  airline: string;
  flight_no: string;
  dep_city: string;
  arr_city: string;
  dep_airport: string;
  arr_airport: string;
  dep_terminal: string | null;
  arr_terminal: string | null;
  dep_time: string;
  arr_time: string;
  duration_min: number;
  price: number;
  cabin: string;
  baggage_info: string;
  refund_policy: string;
  meal_info: string;
  transfer_info: string | null;
  stock: number;
  is_direct: boolean;
  tags: string[];
};

async function request<T>(path: string, init?: RequestInit & { userId?: string | null }): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  if (init?.userId) headers['X-User-Id'] = init.userId;
  const { userId: _u, ...rest } = init || {};
  const res = await fetch(`${API}${path}`, { ...rest, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || res.statusText || '请求失败');
  }
  return data as T;
}

export const api = {
  health: () => request<{ ok: boolean }>('/api/health'),
  login: (phone: string) =>
    request<{ id: string; phone: string; nickname: string }>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
  me: (userId: string) =>
    request<{ id: string; nickname: string; phone: string }>('/api/users/me', { userId }),
  putPreferences: (userId: string, prefs: Record<string, unknown>) =>
    request<{ ok: boolean }>('/api/users/preferences', {
      method: 'PUT',
      userId,
      body: JSON.stringify(prefs),
    }),
  todaySpecials: () => request<{ list: Flight[] }>('/api/flights/today-specials'),
  hotRoutes: () => request<{ list: HotRouteCard[] }>('/api/flights/hot-routes'),
  searchFlights: (q: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    return request<{ list: Flight[] }>(`/api/flights?${sp.toString()}`);
  },
  flight: (id: string) => request<Flight>(`/api/flights/${id}`),
  createOrder: (
    userId: string,
    body: {
      flightIds: string[];
      passengers: { name: string; idType: string; idNo: string }[];
      contactPhone: string;
      couponId?: string;
    }
  ) =>
    request<{ id: string; totalAmount: number; discountAmount: number; status: string }>(
      '/api/orders',
      { method: 'POST', userId, body: JSON.stringify(body) }
    ),
  orders: (userId: string, status?: string) => {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<{ list: OrderSummary[] }>(`/api/orders${q}`, { userId });
  },
  order: (userId: string, id: string) => request<OrderDetail>(`/api/orders/${id}`, { userId }),
  pay: (userId: string, id: string, paymentMethod: string) =>
    request<{ ok: boolean }>(`/api/orders/${id}/pay`, {
      method: 'POST',
      userId,
      body: JSON.stringify({ paymentMethod }),
    }),
  cancelOrder: (userId: string, id: string) =>
    request<{ ok: boolean }>(`/api/orders/${id}/cancel`, { method: 'POST', userId }),
  myCoupons: (userId: string) =>
    request<{
      list: {
        id: string;
        code: string;
        title: string;
        discountType: string;
        discountValue: number;
        minAmount: number;
        used: boolean;
      }[];
    }>('/api/coupons/mine', { userId }),
  monitors: (userId: string) =>
    request<{ list: PriceMonitor[] }>('/api/monitors', { userId }),
  createMonitor: (
    userId: string,
    body: {
      depCity: string;
      arrCity: string;
      depDateStart: string;
      depDateEnd: string;
      targetPrice: number;
    }
  ) =>
    request<PriceMonitor>('/api/monitors', {
      method: 'POST',
      userId,
      body: JSON.stringify(body),
    }),
  deleteMonitor: (userId: string, id: string) =>
    request<{ ok: boolean }>(`/api/monitors/${id}`, { method: 'DELETE', userId }),
  aiPriceTrend: (body: { depCity: string; arrCity: string; depDate: string }) =>
    request<{
      suggestion: string;
      summary: string;
      confidence: number;
      referenceMin?: number;
      referenceAvg?: number;
    }>('/api/ai/price-trend', { method: 'POST', body: JSON.stringify(body) }),
  aiTripRecommend: (userId: string, body: { budget?: number }) =>
    request<{
      title: string;
      trips: { type: string; summary: string; price: number; flightId: string; highlights: string[] }[];
    }>('/api/ai/trip-recommend', { method: 'POST', userId, body: JSON.stringify(body) }),
  aiDestInspiration: (body: { budget?: number; maxHours?: number }) =>
    request<{ destinations: { city: string; fromPrice: number; reason: string }[] }>(
      '/api/ai/dest-inspiration',
      { method: 'POST', body: JSON.stringify(body) }
    ),
};

export type OrderSummary = {
  id: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  created_at: string;
  flights: {
    id: string;
    airline: string;
    flight_no: string;
    dep_city: string;
    arr_city: string;
    dep_time: string;
    arr_time: string;
    price: number;
  }[];
};

export type OrderDetail = OrderSummary & {
  flightIds: string[];
  passengers: { name: string; idType: string; idNo: string }[];
  contact_phone: string;
  payment_method: string | null;
  flights: Flight[];
};

export type PriceMonitor = {
  id: string;
  dep_city: string;
  arr_city: string;
  dep_date_start: string;
  dep_date_end: string;
  target_price: number;
  active: boolean;
};
