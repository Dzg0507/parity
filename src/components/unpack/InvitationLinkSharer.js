import React, { useState } from 'react';
import styled from 'styled-components/native';
import { View, Text } from 'react-native';
import Button from '../common/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { share, copyToClipboard } from '../../utils/share';
import Alert from '../common/Alert';
import { theme } from '../../theme';

const Container = styled.View`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.medium}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
  boxShadow: 0px 2px 4px rgba(0, 0, 0, 0.08);
`;

const LinkLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const LinkDisplay = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ theme }) => theme.colors.primaryDark};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
`;

const ButtonGroup = styled.View`
  flex-direction: row;
  justify-content: space-around;
  margin-top: ${({ theme }) => theme.spacing.small}px;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

const InvitationLinkSharer = ({ invitationLink, onShare }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(invitationLink);
      setAlertMessage('Link copied to clipboard!');
      setAlertVariant('success');
      setShowAlert(true);
    } catch (error) {
      setAlertMessage('Failed to copy link to clipboard.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  };

  const handleNativeShare = async () => {
    try {
      const shareOptions = {
        title: 'Join my Parity Joint Unpack Session',
        message: `I've started a Joint Unpack session on Parity. Join me to explore a topic together:

${invitationLink}`,
        url: invitationLink, // For platforms that support sharing URLs
      };
      await share(shareOptions);
      onShare && onShare();
    } catch (error) {
      console.error('Error sharing invitation link:', error);
      // You might want to show an alert here
      if (error.message !== 'User did not share') { // Filter out user cancellation
        setAlertMessage('Failed to share link. Please try copying it instead.');
        setAlertVariant('error');
        setShowAlert(true);
      }
    }
  };

  if (!invitationLink) {
    return (
      <Container>
        <LinkLabel>No invitation link available.</LinkLabel>
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
      <LinkLabel>Share this link with your partner:</LinkLabel>
      <LinkDisplay numberOfLines={1} ellipsizeMode="tail">{invitationLink}</LinkDisplay>
      <ButtonGroup>
        <Button
          title="Copy Link"
          onPress={handleCopyLink}
          variant="secondary"
          icon={<Icon name="content-copy" size={20} color={theme.colors.textLight} style={{ marginRight: theme.spacing.tiny }} />}
        />
        <Button
          title="Share via..."
          onPress={handleNativeShare}
          icon={<Icon name="share" size={20} color={theme.colors.textLight} style={{ marginRight: theme.spacing.tiny }} />}
        />
      </ButtonGroup>
    </Container>
  );
};

export default InvitationLinkSharer;
