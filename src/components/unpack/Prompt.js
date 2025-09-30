import React from 'react';
import styled from 'styled-components/native';
import Card from '../common/Card';
import Textarea from '../common/Textarea';

const PromptCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
  width: 100%;
`;

const PromptNumber = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodySmall}px;
  color: ${({ theme }) => theme.colors.primaryDark};
  margin-bottom: ${({ theme }) => theme.spacing.tiny}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
`;

const PromptQuestion = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h6}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 24px;
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
`;

const Prompt = ({ promptNumber, question, value, onChangeText, onBlur, error, editable = true }) => {
  return (
    <PromptCard>
      <PromptNumber>Prompt {promptNumber}</PromptNumber>
      <PromptQuestion>{question}</PromptQuestion>
      <Textarea
        placeholder="Write your thoughts here..."
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        error={error}
        editable={editable}
      />
    </PromptCard>
  );
};

export default Prompt;
