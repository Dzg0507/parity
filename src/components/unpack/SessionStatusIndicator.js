import React from 'react';
import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';

const StatusContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-vertical: ${({ theme }) => theme.spacing.small}px;
`;

const StatusLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-right: ${({ theme }) => theme.spacing.small}px;
`;

const StatusText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme, status }) => {
    switch (status) {
      case 'Invited':
        return theme.colors.info;
      case 'Responding':
        return theme.colors.accentDark;
      case 'Completed':
        return theme.colors.success;
      case 'ReadyToReveal':
        return theme.colors.primary;
      case 'Revealed':
        return theme.colors.secondary;
      case 'Error':
      case 'Expired':
        return theme.colors.error;
      default:
        return theme.colors.grey600;
    }
  }};
`;

const StatusIcon = styled(Icon)`
  margin-left: ${({ theme }) => theme.spacing.extraSmall}px;
  color: ${({ theme, status }) => {
    switch (status) {
      case 'Invited':
        return theme.colors.info;
      case 'Responding':
        return theme.colors.accentDark;
      case 'Completed':
        return theme.colors.success;
      case 'ReadyToReveal':
        return theme.colors.primary;
      case 'Revealed':
        return theme.colors.secondary;
      case 'Error':
      case 'Expired':
        return theme.colors.error;
      default:
        return theme.colors.grey600;
    }
  }};
`;

const SessionStatusIndicator = ({ label, status, isLoading }) => {
  let iconName;
  switch (status) {
    case 'Invited': iconName = 'mail-outline'; break;
    case 'Responding': iconName = 'edit'; break;
    case 'Completed': iconName = 'check-circle-outline'; break;
    case 'ReadyToReveal': iconName = 'visibility'; break;
    case 'Revealed': iconName = 'people'; break;
    case 'Error': iconName = 'error-outline'; break;
    case 'Expired': iconName = 'history'; break;
    default: iconName = 'hourglass-empty';
  }

  return (
    <StatusContainer>
      <StatusLabel>{label}</StatusLabel>
      {isLoading ? (
        <ActivityIndicator size="small" color={theme.colors.primary} />
      ) : (
        <>
          <StatusText status={status}>{status}</StatusText>
          <StatusIcon name={iconName} size={20} status={status} />
        </>
      )}
    </StatusContainer>
  );
};

export default SessionStatusIndicator;
