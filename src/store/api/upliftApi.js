import { apiSlice } from './apiSlice';

export const upliftApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUpliftMessageCategories: builder.query({
      query: () => '/uplift/categories',
      providesTags: ['UpliftMessages'],
    }),
    getUpliftMessagesByCategory: builder.query({
      query: (categoryId) => `/uplift/messages?category=${categoryId}`,
      providesTags: ['UpliftMessages'],
    }),
    searchUpliftMessages: builder.query({
      query: (searchTerm) => `/uplift/messages?search=${searchTerm}`,
      providesTags: ['UpliftMessages'],
    }),
  }),
});

export const {
  useGetUpliftMessageCategoriesQuery,
  useGetUpliftMessagesByCategoryQuery,
  useSearchUpliftMessagesQuery,
} = upliftApi;
