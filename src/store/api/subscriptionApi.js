import { apiSlice } from './apiSlice';

export const subscriptionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    processSubscriptionPurchase: builder.mutation({
      query: ({ receiptData, productId }) => ({
        url: '/subscriptions/purchase',
        method: 'POST',
        body: { receiptData, productId },
      }),
      invalidatesTags: ['Subscription'],
    }),
    restorePurchases: builder.mutation({
      query: (receiptDataArray) => ({
        url: '/subscriptions/restore',
        method: 'POST',
        body: { receipts: receiptDataArray },
      }),
      invalidatesTags: ['Subscription'],
    }),
  }),
});

export const { useProcessSubscriptionPurchaseMutation, useRestorePurchasesMutation } = subscriptionApi;
