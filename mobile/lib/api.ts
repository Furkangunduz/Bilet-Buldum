import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:3000/api/v1';
// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token and logging
// api.interceptors.request.use(
//   async (config: InternalAxiosRequestConfig) => {
//     const token = await AsyncStorage.getItem('token');
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
    
//     // Log the request details
//     console.log('🚀 API Request:', {
//       url: config.url,
//       method: config.method?.toUpperCase(),
//       headers: config.headers,
//       data: config.data,
//     });
    
//     return config;
//   },
//   (error: AxiosError) => {
//     console.error('❌ Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    // Log the successful response
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error: AxiosError) => {
    // Log the error response with detailed information
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Types
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface Station {
  id: string;
  name: string;
}

export interface CabinClass {
  id: string;
  name: string;
  code: string;
}

export interface Train {
  id: string;
  departureStation: Station;
  arrivalStation: Station;
  departureTime: string;
  arrivalTime: string;
  price: number;
  cabinClass: CabinClass;
  availableSeats: number;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) => 
    api.post<LoginResponse>('/auth/login', { email, password }),
  
  register: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/register', { email, password }),
  
  getProfile: () => 
    api.get('/auth/profile'),
};

// TCDD API
export const tcddApi = {
  searchTrains: (params: {
    departureStationId: string;
    arrivalStationId: string;
    date: string;
  }) => api.post<Train[]>('/tcdd/search', params),
  
  getDepartureStations: () => 
    api.get<Station[]>('/tcdd/stations/departure'),
  
  getArrivalStations: (departureStationId: string) =>
    api.get<Station[]>(`/tcdd/stations/arrival/${departureStationId}`),
  
  getCabinClasses: () => 
    api.get<CabinClass[]>('/tcdd/cabin-classes'),
};

// Crawler API
export const crawlerApi = {
  startCrawl: (params: {
    departureStationId: string;
    arrivalStationId: string;
    date: string;
  }) => api.post('/crawler/crawl', params),
  
  getSearchHistory: () => 
    api.get('/crawler/history'),
}; 