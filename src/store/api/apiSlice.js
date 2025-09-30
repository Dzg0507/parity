import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../constants';
import { logout, selectCurrentToken } from '../slices/authSlice';
import { storage } from '../../utils/storage';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    const token = selectCurrentToken(getState());
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    } else {
      // Attempt to retrieve token from storage if not in Redux state (e.g., app restart)
      const storedToken = await storage.getItem('authToken');
      if (storedToken) {
        headers.set('authorization', `Bearer ${storedToken}`);
      }
    }
    return headers;
  },
});

// Custom base query that handles 401 Unauthorized errors
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.warn('API call unauthorized. Attempting to log out...');
    // Log out the user if the token is invalid or expired
    api.dispatch(logout());
    // Optionally, navigate to login screen here if navigation context is available
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Subscription',
    'UpliftMessages',
    'SoloPrepSession',
    'JointUnpackSession',
  ],
  endpoints: (builder) => ({
    // Empty endpoints - will be injected by other API slices
  }),
});
