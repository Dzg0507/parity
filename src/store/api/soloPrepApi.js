import { apiSlice } from './apiSlice';

export const soloPrepApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createSoloPrepSession: builder.mutation({
      query: ({ relationshipType, conversationTopic, conversationData }) => ({
        url: '/solo-prep/sessions',
        method: 'POST',
        body: { relationshipType, conversationTopic, conversationData },
      }),
      invalidatesTags: ['SoloPrepSession'],
    }),
    getSoloPrepPrompts: builder.query({
      query: (sessionId) => `/solo-prep/sessions/${sessionId}/prompts`,
    }),
    saveSoloPrepJournalEntry: builder.mutation({
      query: ({ sessionId, promptId, entry }) => ({
        url: `/solo-prep/sessions/${sessionId}/journal`,
        method: 'POST',
        body: { promptId, entry },
      }),
      invalidatesTags: (result, error, { sessionId }) => [{ type: 'SoloPrepSession', id: sessionId }],
    }),
    generateSoloPrepBriefing: builder.mutation({
      query: (sessionId) => ({
        url: `/solo-prep/sessions/${sessionId}/briefing`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { sessionId }) => [{ type: 'SoloPrepSession', id: sessionId }],
    }),
    getSoloPrepBriefing: builder.query({
      query: (sessionId) => `/solo-prep/sessions/${sessionId}/briefing`,
      providesTags: (result, error, sessionId) => [{ type: 'SoloPrepSession', id: sessionId }],
    }),
    getSoloPrepSessionHistory: builder.query({
      query: () => '/solo-prep/sessions/history',
      providesTags: ['SoloPrepSession'],
    }),
    getSoloPrepSessionDetails: builder.query({
      query: (sessionId) => `/solo-prep/sessions/${sessionId}`,
      providesTags: (result, error, sessionId) => [{ type: 'SoloPrepSession', id: sessionId }],
    }),
    getSoloPrepTrialStatus: builder.query({
      query: () => '/solo-prep/trial-status',
      providesTags: ['Subscription'],
      transformResponse: (response) => response.data,
    }),
    deleteSoloPrepSessionData: builder.mutation({
      query: (sessionId) => ({
        url: `/solo-prep/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SoloPrepSession'],
    }),
  }),
});

export const {
  useCreateSoloPrepSessionMutation,
  useGetSoloPrepPromptsQuery,
  useSaveSoloPrepJournalEntryMutation,
  useGenerateSoloPrepBriefingMutation,
  useGetSoloPrepBriefingQuery,
  useGetSoloPrepSessionHistoryQuery,
  useGetSoloPrepSessionDetailsQuery,
  useGetSoloPrepTrialStatusQuery,
  useDeleteSoloPrepSessionDataMutation,
} = soloPrepApi;
