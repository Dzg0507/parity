import { apiSlice } from './apiSlice';

export const jointUnpackApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    convertSoloPrepToJointUnpack: builder.mutation({
      query: (soloPrepSessionId) => ({
        url: `/joint-unpack/from-solo-prep/${soloPrepSessionId}`,
        method: 'POST',
      }),
      invalidatesTags: ['SoloPrepSession', 'JointUnpackSession'],
    }),
    generateJointUnpackInvitation: builder.mutation({
      query: (sessionId) => ({
        url: `/joint-unpack/sessions/${sessionId}/invite`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, sessionId) => [{ type: 'JointUnpackSession', id: sessionId }],
    }),
    getJointUnpackInviteeStatus: builder.query({
      query: (sessionId) => `/joint-unpack/sessions/${sessionId}/invitee-status`,
      providesTags: (result, error, sessionId) => [{ type: 'JointUnpackSession', id: sessionId }],
    }),
    accessJointUnpackSessionAsGuest: builder.mutation({
      query: (invitationToken) => ({
        url: `/joint-unpack/guest/access`,
        method: 'POST',
        body: { invitationToken },
      }),
      // This might not invalidate tags, as it's for guest access, not creating/updating primary sessions for initiator
    }),
    getJointUnpackInviteePrompts: builder.query({
      query: (sessionId) => `/joint-unpack/guest/sessions/${sessionId}/prompts`,
    }),
    saveJointUnpackInviteeResponse: builder.mutation({
      query: ({ sessionId, promptId, response }) => ({
        url: `/joint-unpack/guest/sessions/${sessionId}/response`,
        method: 'POST',
        body: { promptId, response },
      }),
      invalidatesTags: (result, error, { sessionId }) => [{ type: 'JointUnpackSession', id: sessionId }],
    }),
    confirmReadyToReveal: builder.mutation({
      query: (sessionId) => ({
        url: `/joint-unpack/sessions/${sessionId}/ready-to-reveal`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, sessionId) => [{ type: 'JointUnpackSession', id: sessionId }],
    }),
    getJointUnpackMutualResponses: builder.query({
      query: (sessionId) => `/joint-unpack/sessions/${sessionId}/mutual-responses`,
      providesTags: (result, error, sessionId) => [{ type: 'JointUnpackSession', id: sessionId }],
    }),
    generateConversationAgenda: builder.mutation({
      query: (sessionId) => ({
        url: `/joint-unpack/sessions/${sessionId}/agenda`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, sessionId) => [{ type: 'JointUnpackSession', id: sessionId }],
    }),
    getConversationAgenda: builder.query({
      query: (sessionId) => `/joint-unpack/sessions/${sessionId}/agenda`,
      providesTags: (result, error, sessionId) => [{ type: 'JointUnpackSession', id: sessionId }],
    }),
    exportConversationAgenda: builder.mutation({
      query: (sessionId) => ({
        url: `/joint-unpack/sessions/${sessionId}/agenda/export`,
        method: 'POST',
      }),
    }),
    deleteJointUnpackSessionData: builder.mutation({
      query: (sessionId) => ({
        url: `/joint-unpack/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['JointUnpackSession'],
    }),
  }),
});

export const {
  useConvertSoloPrepToJointUnpackMutation,
  useGenerateJointUnpackInvitationMutation,
  useGetJointUnpackInviteeStatusQuery,
  useAccessJointUnpackSessionAsGuestMutation,
  useGetJointUnpackInviteePromptsQuery,
  useSaveJointUnpackInviteeResponseMutation,
  useConfirmReadyToRevealMutation,
  useGetJointUnpackMutualResponsesQuery,
  useGenerateConversationAgendaMutation,
  useGetConversationAgendaQuery,
  useExportConversationAgendaMutation,
  useDeleteJointUnpackSessionDataMutation,
} = jointUnpackApi;
