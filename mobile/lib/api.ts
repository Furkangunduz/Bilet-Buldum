import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosInstance extends AxiosInstance {
  updatePushToken: (pushToken: string) => Promise<any>;
}
console.log('__DEV__',__DEV__)
const API_URL = __DEV__ ? 'http://localhost:3000/api/v1' : 'https://biletbuldum.duckdns.org/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
}) as CustomAxiosInstance;


api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('🚀 API Request:', {
      url: config.url,
      method: config.method?.toUpperCase(),
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    // Log the successful response
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      // data: response.data,
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

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface CabinClass {
  id: string;
  name: string;
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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
  };
}

export interface SearchAlert {
  _id: string;
  fromStationId: string;
  fromStationName: string;
  toStationId: string;
  toStationName: string;
  date: string;
  cabinClass: string;
  cabinClassName: string;
  departureTimeRange: {
    start: string;
    end: string;
  };
  isActive: boolean;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  statusReason: string | null;
  lastChecked: string | null;
  createdAt: string;
  updatedAt: string;
}

// Auth API
export const authApi = {
  login: (email: string, password: string, pushToken?: string) => {
    try {
      console.log('🔍 Attempting login for:', email);
      return api
        .post<LoginResponse>('/auth/login', { email, password, pushToken })
        .then((response) => {
          console.log('✅ Login successful');
          return response;
        })
        .catch((error: AxiosError) => {
          console.error('❌ Login error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            config: error.config,
          });
          throw error;
        });
    } catch (error) {
      console.error('❌ Unexpected error in login:', error);
      throw error;
    }
  },

  register: (email: string, password: string, name: string, lastName: string) => {
    try {
      console.log('🔍 Attempting registration for:', email);
      return api
        .post<LoginResponse>('/auth/register', { email, password, name, lastName })
        .then((response) => {
          console.log('✅ Registration successful');
          return response;
        })
        .catch((error: AxiosError) => {
          console.error('❌ Registration error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            config: error.config,
          });
          throw error;
        });
    } catch (error) {
      console.error('❌ Unexpected error in register:', error);
      throw error;
    }
  },

  getProfile: () => {
    try {
      console.log('🔍 Fetching user profile...');
      return api
        .get('/auth/profile')
        .then((response) => {
          console.log('✅ Profile fetched successfully');
          return response;
        })
        .catch((error: AxiosError) => {
          if (error.code === 'ECONNABORTED') {
            console.error('❌ Profile request timed out');
          } else if (!error.response) {
            console.error('❌ Network error while fetching profile');
          } else {
            console.error('❌ Error fetching profile:', {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
              config: error.config,
            });
          }
          throw error;
        });
    } catch (error) {
      console.error('❌ Unexpected error in getProfile:', error);
      throw error;
    }
  },

  updateProfile: (data: { firstName: string; lastName: string }) => {
    return api.put<User>('/auth/profile', data);
  },

  updateNotificationPreferences: (preferences: { email: boolean; push: boolean }) => {
    return api.put<User>('/auth/profile/notifications', preferences);
  },

  updatePassword: (data: { currentPassword: string; newPassword: string }) => {
    return api.put<{ message: string }>('/auth/profile/password', data);
  },
};

export const tcddApi = {
  searchTrains: (params: { departureStationId: string; arrivalStationId: string; date: string }) => {
    try {
      console.log('🔍 Searching trains with params:', params);
      return api
        .post<Train[]>('/tcdd/search', params)
        .then((response) => {
          console.log('✅ Trains search successful');
          return response;
        })
        .catch((error: AxiosError) => {
          console.error('❌ Error searching trains:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            config: error.config,
          });
          throw error;
        });
    } catch (error) {
      console.error('❌ Unexpected error in searchTrains:', error);
      throw error;
    }
  },

  getDepartureStations: () => {
    try {
      console.log('🔍 Fetching departure stations...');
      return api
        .get<{ data: Station[] }>('/tcdd/stations/departure')
        .then((response) => {
          console.log('✅ Departure stations fetched successfully');
          return response;
        })
        .catch((error: AxiosError) => {
          console.error('❌ Error fetching departure stations:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            config: error.config,
          });
          throw error;
        });
    } catch (error) {
      console.error('❌ Unexpected error in getDepartureStations:', error);
      throw error;
    }
  },

  getArrivalStations: (departureStationId: string) => {
    try {
      console.log('🔍 Fetching arrival stations for departure:', departureStationId);
      return api
        .get<{ data: Station[] }>(`/tcdd/stations/arrival/${departureStationId}`)
        .then((response) => {
          console.log('✅ Arrival stations fetched successfully');
          return response;
        })
        .catch((error: AxiosError) => {
          console.error('❌ Error fetching arrival stations:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            config: error.config,
          });
          throw error;
        });
    } catch (error) {
      console.error('❌ Unexpected error in getArrivalStations:', error);
      throw error;
    }
  },

  getCabinClasses: () => {
    try {
      console.log('🔍 Fetching cabin classes...');
      return api
        .get<ApiResponse<CabinClass[]>>('/tcdd/cabin-classes')
        .then((response) => {
          console.log('✅ Cabin classes fetched successfully');
          return response;
        })
        .catch((error: AxiosError) => {
          console.error('❌ Error fetching cabin classes:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            config: error.config,
          });
          throw error;
        });
    } catch (error) {
      console.error('❌ Unexpected error in getCabinClasses:', error);
      throw error;
    }
  },
};

// Crawler API
export const crawlerApi = {
  startCrawl: (params: { departureStationId: string; arrivalStationId: string; date: string }) => {
    try {
      console.log('🔍 Starting crawler with params:', params);
      return api
        .post('/crawler/crawl', params)
        .then((response) => {
          console.log('✅ Crawler started successfully');
          return response;
        })
        .catch((error: AxiosError) => {
          console.error('❌ Error starting crawler:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            config: error.config,
          });
          throw error;
        });
    } catch (error) {
      console.error('❌ Unexpected error in startCrawl:', error);
      throw error;
    }
  },

  getSearchHistory: () => {
    try {
      console.log('🔍 Fetching search history...');
      return api
        .get('/crawler/history')
        .then((response) => {
          console.log('✅ Search history fetched successfully');
          return response;
        })
        .catch((error: AxiosError) => {
          console.error('❌ Error fetching search history:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            config: error.config,
          });
          throw error;
        });
    } catch (error) {
      console.error('❌ Unexpected error in getSearchHistory:', error);
      throw error;
    }
  },
};

export const updatePushToken = async (pushToken: string) => {
  const response = await api.put('/auth/push-token', { pushToken });
  return response.data;
};

api.updatePushToken = updatePushToken;

export const searchAlertsApi = {
  getSearchAlerts: () => {
    return api.get<ApiResponse<SearchAlert[]>>('/search-alerts');
  },

  createSearchAlert: (data: {
    fromStationId: string;
    toStationId: string;
    date: string;
    preferredCabinClass: string;
    departureTimeRange: {
      start: string;
      end: string;
    };
  }) => {
    return api.post<ApiResponse<SearchAlert>>('/search-alerts', data);
  },

  declineSearchAlert: (alertId: string) => {
    return api.post<ApiResponse<SearchAlert>>(`/search-alerts/${alertId}/decline`);
  },

  deleteSearchAlert: (alertId: string) => {
    return api.delete<ApiResponse<SearchAlert>>(`/search-alerts/${alertId}`);
  }
};
