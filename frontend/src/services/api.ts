const API_BASE_URL = '/api';

export class ApiService {
  private static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && data.code === 'SESSION_EXPIRED') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.dispatchEvent(new CustomEvent('session-expired'));
      }
      throw new Error(data.message || 'Error en la petición al servidor');
    }

    return data;
  }

  // Health
  static getHealth() {
    return this.request<{ success: boolean; status: string }>('/health');
  }

  // Auth
  static register(userData: any) {
    return this.request<{ success: boolean; data: { user: any; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static login(credentials: { email: string; password: string }) {
    return this.request<{ success: boolean; data: { user: any; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  static getProfile() {
    return this.request<{ success: boolean; data: any }>('/auth/profile');
  }

  static updateProfile(profileData: any) {
    return this.request<{ success: boolean; data: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  static deleteAccount() {
    return this.request<{ success: boolean; message: string }>('/auth/profile', {
      method: 'DELETE',
    });
  }

  // Flights
  static searchFlights(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<{ success: boolean; count: number; data: any[] }>(`/flights${query}`);
  }

  static getFlightById(id: string) {
    return this.request<{ success: boolean; data: any }>(`/flights/${id}`);
  }

  static getFlightStatus(flightNumber: string) {
    return this.request<{ success: boolean; data: any }>(`/flights/status/${flightNumber}`);
  }

  // Bookings
  static createBooking(bookingData: any) {
    return this.request<{ success: boolean; message: string; data: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  static getBookingByPnr(pnr: string) {
    return this.request<{ success: boolean; data: any }>(`/bookings/${pnr}`);
  }

  static getUserBookings() {
    return this.request<{ success: boolean; count: number; data: any[] }>('/bookings/my-bookings');
  }

  static payBooking(pnr: string, paymentData: any) {
    return this.request<{ success: boolean; data: any }>(`/bookings/${pnr}/pay`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
}
