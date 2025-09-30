import React from 'react';
import styled from 'styled-components/native';
import Card from '../common/Card';
import Button from '../common/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { share } from '../../utils/share';
import { theme } from '../../theme';

const StyledMessageCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
  width: 100%;
`;

const MessageContent = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 24px;
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
`;

const ShareButtonContainer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.small}px;
`;

const MessageCard = ({ message, category, onShare }) => {
  const handleShare = async () => {
    try {
      const shareOptions = {
        title: 'Uplift Message from Parity',
        message: message,
        // url: 'https://parity.com', // Optional: link to your app/website
      };
      await share(shareOptions);
      onShare && onShare();
    } catch (error) {
      console.error('Error sharing message:', error);
      // You might want to show an alert here
    }
  };

  return (
    <StyledMessageCard>
      {category && (
        <Card.Subtitle style={{ color: theme.colors.primary }}>
          {category}
        </Card.Subtitle>
      )}
      <MessageContent>{message}</MessageContent>
      <ShareButtonContainer>
        <Button
          title="Share"
          onPress={handleShare}
          variant="secondary"
          icon={<Icon name="share" size={20} color={theme.colors.textLight} style={{ marginRight: theme.spacing.tiny }} />}
        />
      </ShareButtonContainer>
    </StyledMessageCard>
  );
};

export default MessageCard;
