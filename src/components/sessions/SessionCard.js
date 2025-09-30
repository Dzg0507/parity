import React from 'react';
import styled from 'styled-components/native';
import Card from '../common/Card';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';

const StyledSessionCard = styled(Card)`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: ${({ theme }) => theme.spacing.medium}px;
`;

const SessionDetails = styled.View`
  flex: 1;
`;

const SessionTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h6}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.tiny}px;
`;

const SessionSubtitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.extraSmall}px;
`;

const SessionDate = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodySmall}px;
  color: ${({ theme }) => theme.colors.grey600};
`;

const ArrowIcon = styled(Icon)`
  margin-left: ${({ theme }) => theme.spacing.medium}px;
  color: ${({ theme }) => theme.colors.grey500};
`;

const SessionCard = ({ session, onPress }) => {
  const sessionType = session.type === 'solo_prep' ? 'Solo Prep' : 'Joint Unpack';
  const displayTitle = session.title || `${sessionType} Session`; // Fallback title
  const displaySubtitle = session.conversationTopicName || session.relationshipTypeName || 'General';
  const formattedDate = session.createdAt ? format(new Date(session.createdAt), 'MMM dd, yyyy') : 'N/A';

  return (
    <StyledSessionCard onPress={() => onPress(session.id, session.type)}>
      <SessionDetails>
        <SessionTitle>{displayTitle}</SessionTitle>
        <SessionSubtitle>{displaySubtitle}</SessionSubtitle>
        <SessionDate>{formattedDate} - {sessionType}</SessionDate>
      </SessionDetails>
      <ArrowIcon name="chevron-right" size={24} />
    </StyledSessionCard>
  );
};

export default SessionCard;
