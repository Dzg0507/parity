import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Spinner from '../../../components/common/Spinner';
import Alert from '../../../components/common/Alert';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Prompt from '../../../components/unpack/Prompt';
import GeneratedAgenda from '../../../components/unpack/GeneratedAgenda';
import RevealConfirmationModal from '../../../components/unpack/RevealConfirmationModal';
import {
  useGetJointUnpackInviteeStatusQuery,
  useConfirmReadyToRevealMutation,
  useGetJointUnpackMutualResponsesQuery,
  useGenerateConversationAgendaMutation,
  useGetConversationAgendaQuery,
  useExportConversationAgendaMutation,
} from '../../../store/api/jointUnpackApi';
import { theme } from '../../../theme';

const Container = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.extraLarge,
  },
}))`
  background-color: ${({ theme }) => theme.colors.background};
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h3}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
  text-align: center;
`;

const Subtitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  line-height: 24px;
  margin-bottom: ${({ theme }) => theme.spacing.extraLarge}px;
`;

const SectionTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h5}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-top: ${({ theme }) => theme.spacing.large}px;
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
`;

const UserResponseCard = styled(Card)`
  background-color: ${({ theme, isInitiator }) => isInitiator ? theme.colors.primaryLight : theme.colors.secondaryLight};
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
`;

const ResponseLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h6}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const ResponseText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.white};
  line-height: 22px;
`;

const JointUnpackRevealPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId, invitationToken, isInitiator } = route.params || {};

  // Query invitee status (for both initiator and guest) to check ready flags
  const { data: inviteeStatus, isLoading: isLoadingInviteeStatus, error: inviteeStatusError, refetch: refetchInviteeStatus } = useGetJointUnpackInviteeStatusQuery(sessionId, {
    pollingInterval: 3000, // Poll more frequently for reveal
  });

  const [confirmReadyToReveal, { isLoading: isConfirmingReady, error: confirmError }] = useConfirmReadyToRevealMutation();
  const { data: mutualResponses, isLoading: isLoadingMutualResponses, error: mutualResponsesError, refetch: refetchMutualResponses } = useGetJointUnpackMutualResponsesQuery(sessionId, {
    skip: !inviteeStatus?.initiatorReady || !inviteeStatus?.inviteeReady,
  });
  const [generateAgenda, { isLoading: isGeneratingAgenda, error: generateAgendaError }] = useGenerateConversationAgendaMutation();
  const { data: conversationAgenda, isLoading: isLoadingAgenda, error: agendaError, refetch: refetchAgenda } = useGetConversationAgendaQuery(sessionId, {
    skip: !mutualResponses, // Only fetch agenda if responses are revealed
  });
  const [exportAgenda, { isLoading: isExportingAgenda, error: exportAgendaError }] = useExportConversationAgendaMutation();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [agendaGenerated, setAgendaGenerated] = useState(false);

  // Determine current user's readiness state
  const currentUserIsReady = isInitiator ? inviteeStatus?.initiatorReady : inviteeStatus?.inviteeReady;

  useEffect(() => {
    if (inviteeStatusError || confirmError || mutualResponsesError || generateAgendaError || agendaError || exportAgendaError) {
      setAlertMessage(inviteeStatusError?.data?.message || confirmError?.data?.message || mutualResponsesError?.data?.message || generateAgendaError?.data?.message || agendaError?.data?.message || exportAgendaError?.data?.message || 'An error occurred.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  }, [inviteeStatusError, confirmError, mutualResponsesError, generateAgendaError, agendaError, exportAgendaError]);

  // If mutual responses are loaded and agenda is not yet generated, trigger agenda generation.
  useEffect(() => {
    if (mutualResponses && !conversationAgenda && !agendaGenerated && !isGeneratingAgenda) {
      // Small delay to ensure state updates
      const timer = setTimeout(() => {
        handleGenerateAgenda();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [mutualResponses, conversationAgenda, agendaGenerated, isGeneratingAgenda]);


  const handleConfirmReady = async () => {
    setShowRevealModal(false);
    setShowAlert(false);
    try {
      await confirmReadyToReveal(sessionId).unwrap();
      setAlertMessage('You are now ready to reveal! Waiting for your partner...');
      setAlertVariant('success');
      setShowAlert(true);
      refetchInviteeStatus(); // Refetch to get updated ready status
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleGenerateAgenda = async () => {
    setShowAlert(false);
    try {
      await generateAgenda(sessionId).unwrap();
      setAlertMessage('Conversation Agenda generated successfully!');
      setAlertVariant('success');
      setShowAlert(true);
      setAgendaGenerated(true); // Mark as generated
      refetchAgenda(); // Fetch the newly generated agenda
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleExportAgenda = async () => {
    setShowAlert(false);
    try {
      await exportAgenda(sessionId).unwrap();
      setAlertMessage('Conversation Agenda export initiated. Check your email for the file.');
      setAlertVariant('success');
      setShowAlert(true);
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const isReadyToReveal = inviteeStatus?.initiatorReady && inviteeStatus?.inviteeReady;
  const showResponsesAndAgenda = mutualResponses && conversationAgenda;
  const allLoading = isLoadingInviteeStatus || isConfirmingReady || isLoadingMutualResponses || isGeneratingAgenda || isLoadingAgenda || isExportingAgenda;

  return (
    <Container>
      <Alert
        visible={showAlert}
        message={alertMessage}
        variant={alertVariant}
        onDismiss={() => setShowAlert(false)}
      />

      <RevealConfirmationModal
        visible={showRevealModal}
        onClose={() => setShowRevealModal(false)}
        onConfirm={handleConfirmReady}
        loading={isConfirmingReady}
        initiatorReady={inviteeStatus?.initiatorReady}
        inviteeReady={inviteeStatus?.inviteeReady}
      />

      <Title>Joint Unpack Reveal</Title>

      {!currentUserIsReady && (
        <Subtitle>
          You have completed your responses. Tap below when you're ready to mutually reveal with your partner.
        </Subtitle>
      )}

      {allLoading && !showResponsesAndAgenda ? (
        <Spinner />
      ) : (
        <>
          {!currentUserIsReady && (
            <Button
              title="I'm Ready to Reveal"
              onPress={() => setShowRevealModal(true)}
              disabled={isConfirmingReady}
              loading={isConfirmingReady}
              style={{ marginBottom: theme.spacing.large }}
            />
          )}

          {!isReadyToReveal ? (
            <Card style={{ marginTop: theme.spacing.medium }}>
              <Text style={{ fontSize: theme.typography.fontSizes.h6, color: theme.colors.textPrimary, marginBottom: theme.spacing.small }}>
                Awaiting mutual consent:
              </Text>
              <Text style={{ fontSize: theme.typography.fontSizes.bodyMedium, color: theme.colors.textSecondary }}>
                {isInitiator ? 'You' : 'Your partner'} are {inviteeStatus?.initiatorReady ? 'ready' : 'not ready'}.
              </Text>
              <Text style={{ fontSize: theme.typography.fontSizes.bodyMedium, color: theme.colors.textSecondary }}>
                {isInitiator ? 'Your partner' : 'You'} are {inviteeStatus?.inviteeReady ? 'ready' : 'not ready'}.
              </Text>
              <Button
                title="Refresh Status"
                onPress={refetchInviteeStatus}
                variant="secondary"
                loading={isLoadingInviteeStatus}
                style={{ marginTop: theme.spacing.medium }}
              />
            </Card>
          ) : (
            <>
              <Subtitle style={{ marginBottom: theme.spacing.medium }}>
                Both parties are ready! Here are your mutual responses and the conversation agenda.
              </Subtitle>

              {mutualResponses ? (
                <>
                  <SectionTitle>Mutual Responses</SectionTitle>
                  <UserResponseCard isInitiator={isInitiator}>
                    <ResponseLabel>Your Responses</ResponseLabel>
                    {mutualResponses.yourResponses.map((res, index) => (
                      <View key={index} style={{ marginBottom: theme.spacing.small }}>
                        <ResponseText style={{ fontWeight: theme.typography.fontWeights.semiBold }}>Prompt {index + 1}: {res.question}</ResponseText>
                        <ResponseText>{res.response}</ResponseText>
                      </View>
                    ))}
                  </UserResponseCard>

                  <UserResponseCard isInitiator={!isInitiator}>
                    <ResponseLabel>Partner's Responses</ResponseLabel>
                    {mutualResponses.partnerResponses.map((res, index) => (
                      <View key={index} style={{ marginBottom: theme.spacing.small }}>
                        <ResponseText style={{ fontWeight: theme.typography.fontWeights.semiBold }}>Prompt {index + 1}: {res.question}</ResponseText>
                        <ResponseText>{res.response}</ResponseText>
                      </View>
                    ))}
                  </UserResponseCard>
                </>
              ) : (
                <Spinner text="Loading mutual responses..." />
              )}

              {conversationAgenda ? (
                <>
                  <SectionTitle>Conversation Agenda</SectionTitle>
                  <GeneratedAgenda agenda={conversationAgenda} onExport={handleExportAgenda} />
                </>
              ) : (
                <Spinner text="Generating conversation agenda..." />
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default JointUnpackRevealPage;
