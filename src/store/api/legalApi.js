import { apiSlice } from './apiSlice';

export const legalApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPrivacyPolicyContent: builder.query({
      query: () => '/legal/privacy-policy',
    }),
    getTermsOfServiceContent: builder.query({
      query: () => '/legal/terms-of-service',
    }),
  }),
});

export const { useGetPrivacyPolicyContentQuery, useGetTermsOfServiceContentQuery } = legalApi;
