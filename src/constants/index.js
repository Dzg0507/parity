import { API_BASE_URL } from '../config/env';

export const BASE_URL = API_BASE_URL || 'http://localhost:5000'; // Default or from env config

export const APP_NAME = 'Parity';

export const SUBSCRIPTION_PRODUCT_IDS = {
  MONTHLY: 'com.parity.monthly',
  ANNUAL: 'com.parity.annual',
  // Add other product IDs as needed for iOS/Android
};

export const SOLO_PREP_TRIAL_LIMIT = 1;
