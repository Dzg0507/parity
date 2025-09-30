import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../../../components/common/Button';
import Spinner from '../../../components/common/Spinner';
import Alert from '../../../components/common/Alert';
import { useAccessJointUnpackSessionAsGuestMutation } from '../../../store/api/jointUnpackApi';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../../theme';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.large}px;
`;

const IconWrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.extraLarge}px;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h2}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
  text-align: center;
`;

const Description = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  line-height: 24px;
  margin-bottom: ${({ theme }) => theme.spacing.extraLarge}px;
`;

const WarningText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.warning};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.medium}px;
`;

const GuestInvitationPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const invitationToken = route.params?.token; // Extract token from deep link params

  const [accessSession, { isLoading, error: accessError }] = useAccessJointUnpackSessionAsGuestMutation();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');
  const [sessionInfo, setSessionInfo] = useState(null); // To store basic session info after token validation

  useEffect(() => {
    if (accessError) {
      setAlertMessage(accessError.data?.message || 'Failed to access session. The invitation link might be invalid or expired.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  }, [accessError]);

  const handleAccessSession = async () => {
    if (!invitationToken) {
      setAlertMessage('No invitation token found. Please ensure you have a valid link.');
      setAlertVariant('error');
      setShowAlert(true);
      return;
    }
    setShowAlert(false);
    try {
      const response = await accessSession(invitationToken).unwrap();
      setSessionInfo(response.session); // Store session details
      setAlertMessage('Invitation accepted! You can now start responding.');
      setAlertVariant('success');
      setShowAlert(true);
      // Automatically navigate after a short delay or let user click 'Start Responding'
      // Option 1: auto-navigate (may feel too fast)
      // setTimeout(() => navigation.replace('GuestResponse', { sessionId: response.session.id, invitationToken }), 2000);
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleStartResponding = () => {
    if (sessionInfo && invitationToken) {
      navigation.replace('GuestResponse', { sessionId: sessionInfo.id, invitationToken });
    } else {
      setAlertMessage('Session not ready. Please try accessing the invitation again.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  };

  if (!invitationToken) {
    return (
      <Container>
        <Alert
          visible={showAlert}
          message={alertMessage}
          variant={alertVariant}
          onDismiss={() => setShowAlert(false)}
        />
        <IconWrapper>
          <Icon name="link-off" size={80} color={theme.colors.error} />
        </IconWrapper>
        <Title>Invalid Invitation</Title>
        <Description>
          It looks like the invitation link is missing or broken. Please make sure you're using the complete link.
        </Description>
        <Button
          title="Go to Login"
          onPress={() => navigation.navigate('Login')}
          variant="secondary"
        />
      </Container>
    );
  }

  // If sessionInfo is already loaded, means the token was successfully validated
  if (sessionInfo) {
    return (
      <Container>
        <Alert
          visible={showAlert}
          message={alertMessage}
          variant={alertVariant}
          onDismiss={() => setShowAlert(false)}
        />
        <IconWrapper>
          <Icon name="people-alt" size={80} color={theme.colors.primary} />
        </IconWrapper>
        <Title>Welcome to Joint Unpack</Title>
        <Description>
          You've been invited by {sessionInfo.initiatorName || 'your partner'} to a session about{' '}
          <Text style={{ fontWeight: theme.typography.fontWeights.bold }}>"{sessionInfo.conversationTopicName}"</Text> related to{' '}
          <Text style={{ fontWeight: theme.typography.fontWeights.bold }}>"{sessionInfo.relationshipTypeName}"</Text>.
          This is a private space to share your perspective. Your responses will only be revealed if both of you consent.
        </Description>
        <WarningText>
          You do not need an account to participate. Your privacy is important to us.
        </WarningText>
        <Button
          title="Start Responding"
          onPress={handleStartResponding}
          style={{ marginTop: theme.spacing.extraLarge }}
        />
      </Container>
    );
  }

  // Initial state, before attempting to access session
  return (
    <Container>
      <Alert
        visible={showAlert}
        message={alertMessage}
        variant={alertVariant}
        onDismiss={() => setShowAlert(false)}
      />
      <IconWrapper>
        <Icon name="mail" size={80} color={theme.colors.info} />
      </IconWrapper>
      <Title>You've Received an Invitation!</Title>
      <Description>
        Tap the button below to join a Joint Unpack session and privately share your thoughts.
      </Description>
      <Button
        title="Access Session"
        onPress={handleAccessSession}
        loading={isLoading}
        disabled={isLoading}
      />
      {accessError && (
        <WarningText>
          {accessError.data?.message || 'Failed to access session. The invitation might be invalid or expired.'}
        </WarningText>
      )}
    </Container>
  );
};

export default GuestInvitationPage;
