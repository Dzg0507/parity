import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Text, View, Alert as RNAlert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Prompt from '../../components/unpack/Prompt';
import GeneratedBriefing from '../../components/unpack/GeneratedBriefing';
import Modal from '../../components/common/Modal';
import {
  useGetSoloPrepSessionDetailsQuery,
  useDeleteSoloPrepSessionDataMutation,
} from '../../store/api/soloPrepApi';
// For Joint Unpack details, we'd need a similar query from jointUnpackApi
import { useDeleteJointUnpackSessionDataMutation } from '../../store/api/jointUnpackApi';
import { theme } from '../../theme';

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

const SectionTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h5}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-top: ${({ theme }) => theme.spacing.large}px;
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
`;

const DetailText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.extraSmall}px;
`;

const ActionButtonContainer = styled.View`
  margin-top: ${({ theme }) => theme.spacing.extraLarge}px;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium}px;
`;

const SessionDetailPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId, sessionType } = route.params;

  // Assuming Solo Prep for now. Joint Unpack would need its own details query.
  const {
    data: sessionDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
    refetch: refetchSessionDetails,
  } = useGetSoloPrepSessionDetailsQuery(sessionId, { skip: sessionType !== 'solo_prep' });
  // For Joint Unpack:
  // const { data: jointUnpackDetails, isLoading: isLoadingJointUnpackDetails, error: jointUnpackError } = useGetJointUnpackSessionDetailsQuery(sessionId, { skip: sessionType !== 'joint_unpack' });

  const [deleteSoloPrepSession, { isLoading: isDeletingSoloPrep, error: deleteSoloPrepError }] = useDeleteSoloPrepSessionDataMutation();
  const [deleteJointUnpackSession, { isLoading: isDeletingJointUnpack, error: deleteJointUnpackError }] = useDeleteJointUnpackSessionDataMutation();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (detailsError) {
      setAlertMessage(detailsError.data?.message || 'Failed to load session details.');
      setAlertVariant('error');
      setShowAlert(true);
    }
    if (deleteSoloPrepError) {
      setAlertMessage(deleteSoloPrepError.data?.message || 'Failed to delete Solo Prep session.');
      setAlertVariant('error');
      setShowAlert(true);
    }
    if (deleteJointUnpackError) {
      setAlertMessage(deleteJointUnpackError.data?.message || 'Failed to delete Joint Unpack session.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  }, [detailsError, deleteSoloPrepError, deleteJointUnpackError]);

  const handleDeleteSession = async () => {
    setShowDeleteModal(false);
    setShowAlert(false); // Clear previous alerts
    try {
      if (sessionType === 'solo_prep') {
        await deleteSoloPrepSession(sessionId).unwrap();
        setAlertMessage('Solo Prep session deleted successfully!');
      } else if (sessionType === 'joint_unpack') {
        await deleteJointUnpackSession(sessionId).unwrap();
        setAlertMessage('Joint Unpack session deleted successfully!');
      }
      setAlertVariant('success');
      setShowAlert(true);
      setTimeout(() => navigation.goBack(), 1500); // Go back after successful deletion
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const isLoading = isLoadingDetails || isDeletingSoloPrep || isDeletingJointUnpack;
  const currentError = detailsError || deleteSoloPrepError || deleteJointUnpackError;

  if (isLoading) {
    return <Spinner />;
  }

  if (currentError) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Alert
          visible={showAlert}
          message={alertMessage}
          variant={alertVariant}
          onDismiss={() => setShowAlert(false)}
        />
        <Title>Error</Title>
        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
          Unable to load session details.
        </Text>
      </Container>
    );
  }

  const session = sessionDetails; // Adjust this if you integrate Joint Unpack details

  if (!session) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Title>Session Not Found</Title>
        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
          The details for this session could not be loaded.
        </Text>
      </Container>
    );
  }

  return (
    <Container>
      <Alert
        visible={showAlert}
        message={alertMessage}
        variant={alertVariant}
        onDismiss={() => setShowAlert(false)}
      />

      <Modal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={`Delete ${sessionType === 'solo_prep' ? 'Solo Prep' : 'Joint Unpack'} Session`}
        actions={[
          { text: 'Cancel', onPress: () => setShowDeleteModal(false), variant: 'secondary' },
          { text: 'Delete', onPress: handleDeleteSession, variant: 'danger', loading: isDeletingSoloPrep || isDeletingJointUnpack },
        ]}
      >
        <Text style={{ fontSize: theme.typography.fontSizes.bodyMedium, color: theme.colors.textPrimary, lineHeight: 22 }}>
          Are you sure you want to delete this session? This action cannot be undone.
        </Text>
      </Modal>

      <Title>Session Details</Title>

      <Card>
        <DetailText>
          <Text style={{ fontWeight: theme.typography.fontWeights.semiBold }}>Type:</Text> {sessionType === 'solo_prep' ? 'Solo Prep' : 'Joint Unpack'}
        </DetailText>
        <DetailText>
          <Text style={{ fontWeight: theme.typography.fontWeights.semiBold }}>Relationship:</Text> {session.relationshipTypeName || 'N/A'}
        </DetailText>
        <DetailText>
          <Text style={{ fontWeight: theme.typography.fontWeights.semiBold }}>Topic:</Text> {session.conversationTopicName || 'N/A'}
        </DetailText>
        <DetailText>
          <Text style={{ fontWeight: theme.typography.fontWeights.semiBold }}>Created:</Text> {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'N/A'}
        </DetailText>
      </Card>

      <SectionTitle>Journal Entries</SectionTitle>
      {session.prompts && session.prompts.length > 0 ? (
        session.prompts.map((prompt, index) => (
          <Prompt
            key={prompt.id}
            promptNumber={index + 1}
            question={prompt.question}
            value={session.journalEntries?.[prompt.id] || 'No entry saved.'}
            editable={false} // Read-only for history
          />
        ))
      ) : (
        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
          No journal entries for this session.
        </Text>
      )}

      {session.briefing && (
        <>
          <SectionTitle>Strategy Briefing</SectionTitle>
          <GeneratedBriefing briefing={session.briefing} />
        </>
      )}

      {/* For Joint Unpack, display mutual responses and conversation agenda */}
      {sessionType === 'joint_unpack' && session.mutualResponses && (
        <>
          <SectionTitle>Mutual Responses</SectionTitle>
          {/* Render mutual responses here */}
        </>
      )}
      {sessionType === 'joint_unpack' && session.conversationAgenda && (
        <>
          <SectionTitle>Conversation Agenda</SectionTitle>
          {/* Render GeneratedAgenda component here */}
        </>
      )}


      <ActionButtonContainer>
        <Button
          title={`Delete ${sessionType === 'solo_prep' ? 'Solo Prep' : 'Joint Unpack'} Session`}
          onPress={() => setShowDeleteModal(true)}
          variant="danger"
          loading={isDeletingSoloPrep || isDeletingJointUnpack}
        />
      </ActionButtonContainer>
    </Container>
  );
};

export default SessionDetailPage;
