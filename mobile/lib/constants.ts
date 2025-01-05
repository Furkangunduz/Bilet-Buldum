import { TestIds } from 'react-native-google-mobile-ads';

export const ADMOB_APP_ID = {
  IOS: 'ca-app-pub-7425995753039606~8391692619',
  ANDROID: 'ca-app-pub-7425995753039606~1891009940'
};

export const API_URL = 'https://bilet-buldum.onrender.com/api/v1';

export const AUTH_TOKEN_KEY = '@bilet_buldum_auth_token';

// Ad Unit IDs for different environments
export const AD_UNIT_IDS = {
  INTERSTITIAL: {
    IOS: 'ca-app-pub-7425995753039606/5349762157',
    ANDROID: 'ca-app-pub-7425995753039606/4204265083', 
  },
  TEST: {
    INTERSTITIAL: TestIds.INTERSTITIAL
  }
};

// Ad frequency control settings
export const AD_CONFIG = {
  MIN_TIME_BETWEEN_ADS: 1 * 60 * 1000, // 1 minute in milliseconds
  MAX_ADS_PER_SESSION: 10,
  SHOW_AD_PROBABILITY: 0.5, // 30% chance to show ad
} as const;

export const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Find Your Train',
    description: 'Search and compare train tickets across Turkey',
  },
  {
    id: 2,
    title: 'Get Notified',
    description: 'Receive instant notifications when tickets become available',
  },
  {
    id: 3,
    title: 'Book Instantly',
    description: 'Secure your tickets as soon as they become available',
  },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 49.99,
    features: [
      'Unlimited ticket alerts',
      'Priority notifications',
      'Advanced search filters',
      'Premium support',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 399.99,
    features: [
      'All monthly features',
      '2 months free',
      'Early access to new features',
      'VIP support',
    ],
  },
];
