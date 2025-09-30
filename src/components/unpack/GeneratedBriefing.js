import React from 'react';
import styled from 'styled-components/native';
import Card from '../common/Card';
import Button from '../common/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { share } from '../../utils/share';
import { theme } from '../../theme';

const BriefingContainer = styled.View`
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

const BriefingText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 22px;
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const TipItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const TipBullet = styled(Icon)`
  margin-right: ${({ theme }) => theme.spacing.small}px;
  color: ${({ theme }) => theme.colors.primary};
`;

const TipText = styled.Text`
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

const GeneratedBriefing = ({ briefing, onConvertToJointUnpack, isConverting }) => {
  if (!briefing) {
    return <BriefingText>No briefing available.</BriefingText>;
  }

  const handleShareBriefing = async () => {
    try {
      const shareMessage = `My Parity Strategy Briefing for ${briefing.relationshipType} about ${briefing.conversationTopic}:

${briefing.summary}

Key Tips:
${briefing.tips.map(tip => `- ${tip}`).join('\n')}

Prepared with Parity.`;
      const shareOptions = {
        title: 'My Strategy Briefing',
        message: shareMessage,
      };
      await share(shareOptions);
    } catch (error) {
      console.error('Error sharing briefing:', error);
      // Show an alert if sharing fails
    }
  };

  return (
    <BriefingContainer>
      <Card title={`Strategy Briefing for your conversation with ${briefing.relationshipTypeName}`} subtitle={`Topic: ${briefing.conversationTopicName}`}>
        <BriefingText>{briefing.summary}</BriefingText>

        <SectionTitle>Key Communication Tips</SectionTitle>
        {briefing.tips && briefing.tips.length > 0 ? (
          briefing.tips.map((tip, index) => (
            <TipItem key={index}>
              <TipBullet name="lightbulb-outline" size={20} />
              <TipText>{tip}</TipText>
            </TipItem>
          ))
        ) : (
          <BriefingText>No specific tips generated for this session.</BriefingText>
        )}
      </Card>

      <ActionButtonContainer>
        <Button
          title="Share Briefing"
          onPress={handleShareBriefing}
          variant="secondary"
          icon={<Icon name="share" size={20} color={theme.colors.textLight} />}
        />
        <Button
          title="Start Joint Unpack"
          onPress={onConvertToJointUnpack}
          disabled={isConverting}
          loading={isConverting}
          icon={<Icon name="people-alt" size={20} color={theme.colors.textLight} />}
        />
      </ActionButtonContainer>
    </BriefingContainer>
  );
};

export default GeneratedBriefing;
