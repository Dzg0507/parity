import React from 'react';
import styled from 'styled-components/native';
import { theme } from '../../theme';

const TextareaWrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
  width: 100%;
`;

const TextareaLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.tiny}px;
`;

const StyledTextarea = styled.TextInput`
  border-width: 1px;
  border-color: ${({ theme, hasError }) =>
    hasError ? theme.colors.error : theme.colors.border};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.small}px;
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  background-color: ${({ theme }) => theme.colors.surface};
  min-height: 100px;
  text-align-vertical: top; /* Ensures text starts at the top on Android */
`;

const ErrorText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodySmall}px;
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.tiny}px;
`;

const Textarea = ({ label, placeholder, value, onChangeText, onBlur, error, ...props }) => {
  return (
    <TextareaWrapper>
      {label && <TextareaLabel>{label}</TextareaLabel>}
      <StyledTextarea
        placeholder={placeholder}
        placeholderTextColor={theme.colors.grey500}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        multiline
        {...props}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </TextareaWrapper>
  );
};

export default Textarea;
