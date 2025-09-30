import { apiSlice } from './apiSlice';

export const unpackApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRelationshipTypes: builder.query({
      query: () => '/unpack/relationship-types',
      transformResponse: (response) => response.data,
    }),
    getConversationTopics: builder.query({
      query: () => '/unpack/conversation-topics',
      transformResponse: (response) => response.data,
    }),
  }),
});

export const { useGetRelationshipTypesQuery, useGetConversationTopicsQuery } = unpackApi;
