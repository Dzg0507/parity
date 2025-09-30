import React from 'react';
import styled from 'styled-components/native';
import { ActivityIndicator, Text } from 'react-native';
import { theme, COLOR_SCHEMES } from '../../theme';

const StyledButton = styled.TouchableOpacity`
  background-color: ${({ theme, variant, disabled, scheme }) => {
    if (disabled) return theme.colors.grey400;
    if (scheme) return COLOR_SCHEMES[scheme].accent;
    if (variant === 'secondary') return theme.colors.secondary;
    if (variant === 'outline') return 'transparent';
    if (variant === 'danger') return theme.colors.error;
    return theme.colors.primary;
  }};
  padding: ${({ theme }) => theme.spacing.medium}px ${({ theme }) => theme.spacing.large}px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  border-width: ${({ variant, scheme }) => 
    variant === 'outline' || scheme ? '2px' : '0px'};
  border-color: ${({ theme, variant, scheme }) => {
    if (scheme) return COLOR_SCHEMES[scheme].cardBorder;
    if (variant === 'outline') return theme.colors.primary;
    return 'transparent';
  }};
  shadow-color: ${({ scheme, theme, variant }) => {
    if (scheme) return COLOR_SCHEMES[scheme].shadow;
    if (variant === 'outline') return theme.colors.primary;
    return 'rgba(0, 0, 0, 0.2)';
  }};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 6;
  min-height: 48px;
`;

const ButtonText = styled.Text`
  color: ${({ theme, variant, scheme }) => {
    if (scheme) return COLOR_SCHEMES[scheme].text;
    if (variant === 'outline') return theme.colors.primary;
    return theme.colors.textLight;
  }};
  font-size: ${({ theme }) => theme.typography.fontSizes.button}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  text-shadow: ${({ scheme, variant }) => 
    scheme || variant === 'outline' ? '1px 1px 2px rgba(0, 0, 0, 0.3)' : 'none'};
  letter-spacing: 0.5px;
`;

const Button = ({ title, onPress, disabled, loading, variant = 'primary', style, textStyle, scheme }) => {
  return (
    <StyledButton
      onPress={onPress}
      disabled={disabled || loading}
      variant={variant}
      scheme={scheme}
      style={style}
    >
      {loading ? (
        <ActivityIndicator
          color={scheme ? COLOR_SCHEMES[scheme].text : (variant === 'outline' ? theme.colors.primary : theme.colors.textLight)}
          size="small"
        />
      ) : (
        <ButtonText variant={variant} scheme={scheme} style={textStyle}>
          {title}
        </ButtonText>
      )}
    </StyledButton>
  );
};

export default Button;
