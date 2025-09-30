import { apiSlice } from './apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionStatus: builder.query({
      query: () => '/users/subscription-status',
      providesTags: ['Subscription'],
      transformResponse: (response) => response.data,
    }),
    updateNotificationPreferences: builder.mutation({
      query: (preferences) => ({
        url: '/users/notification-preferences',
        method: 'PUT',
        body: preferences,
      }),
    }),
    requestDataExport: builder.mutation({
      query: () => ({
        url: '/users/data-export-request',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetSubscriptionStatusQuery,
  useUpdateNotificationPreferencesMutation,
  useRequestDataExportMutation,
} = userApi;
