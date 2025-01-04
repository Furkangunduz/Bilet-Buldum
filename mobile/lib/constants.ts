import { TestIds } from 'react-native-google-mobile-ads';

export const API_URL = 'https://bilet-buldum.onrender.com/api/v1';

export const AUTH_TOKEN_KEY = '@bilet_buldum_auth_token';

// Ad Unit IDs for different environments
export const AD_UNIT_IDS = {
  INTERSTITIAL: {
    IOS: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-7425995753039606/5349762157',
    ANDROID: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-7425995753039606/4204265083', 
  }
};

export const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Find Your Train',
    description: 'Search and compare train tickets across Turkey',
    image: require('../assets/onboarding/search.webp'),
  },
  {
    id: 2,
    title: 'Get Notified',
    description: 'Receive instant notifications when tickets become available',
    image: require('../assets/onboarding/search.webp'),
  },
  {
    id: 3,
    title: 'Book Instantly',
    description: 'Secure your tickets as soon as they become available',
    image: require('../assets/onboarding/search.webp'),
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
