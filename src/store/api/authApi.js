import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerUserWithEmailPassword: builder.mutation({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    socialLogin: builder.mutation({
      query: (socialTokenData) => ({
        url: '/auth/social-login',
        method: 'POST',
        body: socialTokenData, // { provider: 'google'/'apple', token: '...' }
      }),
    }),
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    updateUserProfile: builder.mutation({
      query: (userData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    requestPasswordReset: builder.mutation({
      query: (email) => ({
        url: '/auth/request-password-reset',
        method: 'POST',
        body: { email },
      }),
    }),
    confirmPasswordReset: builder.mutation({
      query: ({ token, newPassword }) => ({
        url: '/auth/confirm-password-reset',
        method: 'POST',
        body: { token, newPassword },
      }),
    }),
    deleteUserAccount: builder.mutation({
      query: () => ({
        url: '/users/account',
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useRegisterUserWithEmailPasswordMutation,
  useSocialLoginMutation,
  useLoginUserMutation,
  useUpdateUserProfileMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useDeleteUserAccountMutation,
} = authApi;
