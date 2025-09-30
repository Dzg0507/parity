import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Spinner from '../../../components/common/Spinner';
import Alert from '../../../components/common/Alert';
import SessionStatusIndicator from '../../../components/unpack/SessionStatusIndicator';
import InvitationLinkSharer from '../../../components/unpack/InvitationLinkSharer';
import {
  useGetJointUnpackInviteeStatusQuery,
  useGenerateJointUnpackInvitationMutation,
  useGetJointUnpackMutualResponsesQuery,
  useGenerateConversationAgendaMutation,
} from '../../../store/api/jointUnpackApi';
import { useGetSoloPrepSessionDetailsQuery } from '../../../store/api/soloPrepApi'; // To fetch details if coming from solo prep
import { format } from 'date-fns';
import { theme } from '../../../theme';

const Container = styled.ScrollView.attrs((props) => ({
  contentContainerStyle: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.extraLarge,
    ...props.contentContainerStyle,
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

const SectionTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h5}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-top: ${({ theme }) => theme.spacing.large}px;
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
`;

const InfoText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 22px;
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const JointUnpackDashboardPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // SAFE APPROACH - No destructuring, using conditional access instead
  const sessionId = route.params && route.params.sessionId ? route.params.sessionId : undefined;

  // Fetch JointUnpack details (including relationshipType, conversationTopic, initiator's responses, etc.)
  // For simplicity, we'll use soloPrepSessionDetails if it was converted, and assume similar structure.
  // In a full implementation, you'd have a `getJointUnpackSessionDetails` query.
  const { data: soloPrepDetails, isLoading: isLoadingSoloPrepDetails, error: soloPrepDetailsError } = useGetSoloPrepSessionDetailsQuery(
    // We need to map the jointUnpackSessionId back to its original soloPrepSessionId if applicable
    // This example assumes sessionId *is* the soloPrepSessionId for details, which might not always be true.
    // A proper JointUnpackSession API would provide all required context directly.
    sessionId, // This is a simplification; actual logic would fetch JointUnpackSession by its ID
    { skip: !sessionId }
  );

  const { data: inviteeStatus, isLoading: isLoadingInviteeStatus, error: inviteeStatusError, refetch: refetchInviteeStatus } = useGetJointUnpackInviteeStatusQuery(sessionId, {
    pollingInterval: 5000, // Poll every 5 seconds to update invitee status
    skip: !sessionId
  });
  const [generateInvitation, { isLoading: isGeneratingInvitation, error: invitationError }] = useGenerateJointUnpackInvitationMutation();
  const { data: mutualResponses, isLoading: isLoadingMutualResponses, error: mutualResponsesError, refetch: refetchMutualResponses } = useGetJointUnpackMutualResponsesQuery(sessionId, {
    skip: !inviteeStatus?.initiatorReady || !inviteeStatus?.inviteeReady, // Only fetch if both are ready
  });
  const [generateAgenda, { isLoading: isGeneratingAgenda, error: agendaError }] = useGenerateConversationAgendaMutation();

  const [invitationLink, setInvitationLink] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');

  const sessionInfo = soloPrepDetails; // Simplify for now, would be JointUnpackSession details

  useEffect(() => {
    if (invitationError) {
      setAlertMessage(invitationError.data?.message || 'Failed to generate invitation link.');
      setAlertVariant('error');
      setShowAlert(true);
    }
    if (inviteeStatusError) {
      setAlertMessage(inviteeStatusError.data?.message || 'Failed to fetch invitee status.');
      setAlertVariant('error');
      setShowAlert(true);
    }
    if (mutualResponsesError) {
      setAlertMessage(mutualResponsesError.data?.message || 'Failed to fetch mutual responses.');
      setAlertVariant('error');
      setShowAlert(true);
    }
    if (agendaError) {
      setAlertMessage(agendaError.data?.message || 'Failed to generate conversation agenda.');
      setAlertVariant('error');
      setShowAlert(true);
    }
    if (soloPrepDetailsError) {
      setAlertMessage(soloPrepDetailsError.data?.message || 'Failed to load session details.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  }, [invitationError, inviteeStatusError, mutualResponsesError, agendaError, soloPrepDetailsError]);

  const handleGenerateInvitation = async () => {
    setShowAlert(false);
    try {
      const response = await generateInvitation(sessionId).unwrap();
      setInvitationLink(response.invitationLink);
      setAlertMessage('Invitation link generated!');
      setAlertVariant('success');
      setShowAlert(true);
      refetchInviteeStatus(); // Refetch status to show 'Invited'
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleShareLink = async () => {
    // This function will be in InvitationLinkSharer, but we might have a trigger here
    // for example, to clear the link after sharing.
    // For now, it just passes the link.
  };

  const handleGenerateAgenda = async () => {
    setShowAlert(false);
    try {
      await generateAgenda(sessionId).unwrap();
      setAlertMessage('Conversation Agenda generated successfully!');
      setAlertVariant('success');
      setShowAlert(true);
      navigation.navigate('JointUnpackReveal', { sessionId, isInitiator: true }); // Navigate to reveal page
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const isLoading = isLoadingSoloPrepDetails || isLoadingInviteeStatus || isGeneratingInvitation || isLoadingMutualResponses || isGeneratingAgenda;

  if (isLoading) {
    return <Spinner />;
  }

  if (!sessionId) {
    return (
      <Container contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Title>No Active Joint Unpack Session</Title>
        <InfoText>You need to start a Joint Unpack session from your Solo Prep results.</InfoText>
        <Button
          title="View Session History"
          onPress={() => navigation.navigate('SessionHistory')}
          style={{ marginTop: theme.spacing.large }}
        />
      </Container>
    );
  }

  if (soloPrepDetailsError) {
    return (
      <Container contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Alert
          visible={showAlert}
          message={alertMessage}
          variant={alertVariant}
          onDismiss={() => setShowAlert(false)}
        />
        <Title>Error</Title>
        <InfoText>Unable to load Joint Unpack session details.</InfoText>
      </Container>
    );
  }

  // Determine current status for the initiator
  let currentInitiatorStatus = 'Initiator Response Done';
  if (!inviteeStatus?.initiatorReady) {
    currentInitiatorStatus = 'Complete your responses'; // Placeholder, assuming initiator has already journaled
  }
  // This state is simplified. Initiator's prompts are from Solo Prep.
  // The 'ready' status for initiator needs to be set after Solo Prep complete, and then perhaps confirmed again.
  // For this flow, we assume Solo Prep is 'done' for initiator.

  return (
    <Container>
      <Alert
        visible={showAlert}
        message={alertMessage}
        variant={alertVariant}
        onDismiss={() => setShowAlert(false)}
      />

      <Title>Joint Unpack Dashboard</Title>
      {sessionInfo && (
        <Card title={`Session with ${sessionInfo.relationshipTypeName}`} subtitle={`Topic: ${sessionInfo.conversationTopicName}`}>
          <InfoText>Created: {sessionInfo.createdAt ? format(new Date(sessionInfo.createdAt), 'MMM dd, yyyy') : 'N/A'}</InfoText>
          <InfoText>This dashboard helps you track the progress of your Joint Unpack session.</InfoText>
        </Card>
      )}


      <SectionTitle>Invite Partner</SectionTitle>
      {invitationLink ? (
        <InvitationLinkSharer
          invitationLink={invitationLink}
          onShare={handleShareLink}
        />
      ) : (
        <Button
          title="Generate Invitation Link"
          onPress={handleGenerateInvitation}
          loading={isGeneratingInvitation}
          disabled={isGeneratingInvitation}
          style={{ marginBottom: theme.spacing.medium }}
        />
      )}

      <SectionTitle>Session Progress</SectionTitle>
      <Card>
        <InfoText style={{ marginBottom: theme.spacing.small, fontWeight: theme.typography.fontWeights.semiBold }}>
          Your Status: <Text style={{ color: theme.colors.success }}>{currentInitiatorStatus}</Text>
        </InfoText>
        <SessionStatusIndicator
          label="Partner Status:"
          status={inviteeStatus?.inviteeStatus || 'Not Invited'}
          isLoading={isLoadingInviteeStatus}
        />
        {inviteeStatus?.inviteeStatus === 'Completed' && (
          <InfoText style={{ marginTop: theme.spacing.small }}>
            Your partner has completed their responses.
          </InfoText>
        )}
      </Card>

      {inviteeStatus?.inviteeReady && inviteeStatus?.initiatorReady ? (
        <>
          <SectionTitle>Reveal & Agenda</SectionTitle>
          <Card>
            <InfoText>Both you and your partner are ready to reveal your responses.</InfoText>
            <Button
              title="View Mutual Responses & Agenda"
              onPress={() => navigation.navigate('JointUnpackReveal', { sessionId, isInitiator: true })}
              style={{ marginTop: theme.spacing.medium }}
            />
            {/* The actual generation happens implicitly on `confirmReadyToReveal` or explicitly via a button */}
            {/* For now, direct navigation implies the backend has processed. */}
            {/* If agenda needs explicit generation, this button would trigger `handleGenerateAgenda` */}
          </Card>
        </>
      ) : (
        <Card style={{ marginTop: theme.spacing.large }}>
          <InfoText>Awaiting partner to complete their responses and confirm ready to reveal.</InfoText>
          <Button
            title="Refresh Status"
            onPress={refetchInviteeStatus}
            variant="secondary"
            loading={isLoadingInviteeStatus}
            style={{ marginTop: theme.spacing.medium }}
          />
        </Card>
      )}
    </Container>
  );
};

export default JointUnpackDashboardPage;
