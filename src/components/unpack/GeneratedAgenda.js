import React from 'react';
import styled from 'styled-components/native';
import Card from '../common/Card';
import Button from '../common/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { share } from '../../utils/share';
import { theme } from '../../theme';

const AgendaContainer = styled.View`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.medium}px;
`;

const SectionTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h5}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-top: ${({ theme }) => theme.spacing.large}px;
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
`;

const AgendaText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 22px;
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const PointItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const PointBullet = styled(Icon)`
  margin-right: ${({ theme }) => theme.spacing.small}px;
  color: ${({ theme }) => theme.colors.secondary};
`;

const PointText = styled.Text`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 22px;
`;

const ActionButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  margin-top: ${({ theme }) => theme.spacing.extraLarge}px;
  gap: ${({ theme }) => theme.spacing.medium}px;
`;

const GeneratedAgenda = ({ agenda, onExport }) => {
  if (!agenda) {
    return <AgendaText>No conversation agenda available.</AgendaText>;
  }

  const handleShareAgenda = async () => {
    try {
      const shareMessage = `Our Parity Conversation Agenda for ${agenda.relationshipType} about ${agenda.conversationTopic}:

${agenda.summary}

Key Discussion Points:
${agenda.discussionPoints.map(point => `- ${point}`).join('\n')}

Generated with Parity.`;
      const shareOptions = {
        title: 'Our Conversation Agenda',
        message: shareMessage,
      };
      await share(shareOptions);
    } catch (error) {
      console.error('Error sharing agenda:', error);
      // Show an alert if sharing fails
    }
  };

  return (
    <AgendaContainer>
      <Card title={`Conversation Agenda for ${agenda.relationshipTypeName}`} subtitle={`Topic: ${agenda.conversationTopicName}`}>
        <AgendaText>{agenda.summary}</AgendaText>

        <SectionTitle>Key Discussion Points</SectionTitle>
        {agenda.discussionPoints && agenda.discussionPoints.length > 0 ? (
          agenda.discussionPoints.map((point, index) => (
            <PointItem key={index}>
              <PointBullet name="navigate-next" size={20} />
              <PointText>{point}</PointText>
            </PointItem>
          ))
        ) : (
          <AgendaText>No specific discussion points generated.</AgendaText>
        )}
      </Card>

      <ActionButtonContainer>
        <Button
          title="Share Agenda"
          onPress={handleShareAgenda}
          variant="secondary"
          icon={<Icon name="share" size={20} color={theme.colors.textLight} />}
        />
        <Button
          title="Export Agenda"
          onPress={onExport}
          icon={<Icon name="cloud-download" size={20} color={theme.colors.textLight} />}
        />
      </ActionButtonContainer>
    </AgendaContainer>
  );
};

export default GeneratedAgenda;
