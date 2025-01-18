import { TestIds } from 'react-native-google-mobile-ads';

export const ADMOB_APP_ID = {
  IOS: 'ca-app-pub-7425995753039606~8391692619',
  ANDROID: 'ca-app-pub-7425995753039606~1891009940',
};

export const API_URL = 'https://biletbuldum.duckdns.org/api/v1';

export const AUTH_TOKEN_KEY = '@bilet_buldum_auth_token';

export const AD_UNIT_IDS = {
  INTERSTITIAL: {
    IOS: 'ca-app-pub-7425995753039606/5349762157',
    ANDROID: 'ca-app-pub-7425995753039606/4204265083',
  },
  TEST: {
    INTERSTITIAL: TestIds.INTERSTITIAL,
  },
};

export const AD_CONFIG = {
  MIN_TIME_BETWEEN_ADS: 4 * 60 * 1000,
  MAX_ADS_PER_SESSION: 10,
  SHOW_AD_PROBABILITY: 0.7,
} as const;

export const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Never Miss a Ticket',
    description: 'Get instant alerts when train tickets become available',
  },
  {
    id: 2,
    title: 'Smart Notifications',
    description: 'Set up alerts for your preferred routes and dates',
  },
  {
    id: 3,
    title: 'Book with Confidence',
    description: 'Quick access to TCDD when tickets are available',
  },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 49.99,
    features: ['Unlimited ticket alerts', 'Priority notifications', 'Advanced search filters', 'Premium support'],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 399.99,
    features: ['All monthly features', '2 months free', 'Early access to new features', 'VIP support'],
  },
];
