import React from 'react';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ActivityIndicator, Platform } from 'react-native';
import { theme } from '../../theme';

const StyledSocialButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, provider }) => {
    switch (provider) {
      case 'google':
        return '#DB4437'; // Google Red
      case 'apple':
        return theme.colors.black; // Apple Black
      default:
        return theme.colors.grey500;
    }
  }};
  padding: ${({ theme }) => theme.spacing.small}px;
  border-radius: 8px;
  margin-vertical: ${({ theme }) => theme.spacing.extraSmall}px;
  width: 100%;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
`;

const ButtonIcon = styled(Icon)`
  margin-right: ${({ theme }) => theme.spacing.extraSmall}px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.typography.fontSizes.button}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;

const SocialLoginButton = ({ provider, onPress, loading, disabled }) => {
  let iconName;
  let buttonText;

  switch (provider) {
    case 'google':
      iconName = 'google';
      buttonText = 'Continue with Google';
      break;
    case 'apple':
      iconName = 'apple';
      buttonText = 'Continue with Apple';
      break;
    default:
      iconName = 'question';
      buttonText = 'Continue with Social';
  }

  // Apple button is only for iOS
  if (provider === 'apple' && Platform.OS !== 'ios') {
    return null;
  }

  return (
    <StyledSocialButton
      provider={provider}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.textLight} size="small" />
      ) : (
        <>
          <ButtonIcon name={iconName} size={20} />
          <ButtonText>{buttonText}</ButtonText>
        </>
      )}
    </StyledSocialButton>
  );
};

export default SocialLoginButton;
