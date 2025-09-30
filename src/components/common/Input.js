import React from 'react';
import styled from 'styled-components/native';
import { theme } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const InputWrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
  width: 100%;
`;

const InputLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.tiny}px;
`;

const StyledInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${({ theme, hasError }) =>
    hasError ? theme.colors.error : theme.colors.border};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.extraSmall}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const StyledInput = styled.TextInput`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 0; /* Reset default padding */
  height: 40px;
`;

const ErrorText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodySmall}px;
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.tiny}px;
`;

const InputIcon = styled(Icon)`
  margin-right: ${({ theme }) => theme.spacing.extraSmall}px;
  color: ${({ theme }) => theme.colors.grey600};
`;

const TogglePasswordVisibility = styled.TouchableOpacity`
  padding: ${({ theme }) => theme.spacing.tiny}px;
`;

const Input = ({ label, placeholder, value, onChangeText, onBlur, error, iconName, secureTextEntry, ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(!secureTextEntry);

  return (
    <InputWrapper>
      {label && <InputLabel>{label}</InputLabel>}
      <StyledInputContainer hasError={!!error}>
        {iconName && <InputIcon name={iconName} size={20} />}
        <StyledInput
          placeholder={placeholder}
          placeholderTextColor={theme.colors.grey500}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        {secureTextEntry && (
          <TogglePasswordVisibility onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Icon
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={20}
              color={theme.colors.grey600}
            />
          </TogglePasswordVisibility>
        )}
      </StyledInputContainer>
      {error && <ErrorText>{error}</ErrorText>}
    </InputWrapper>
  );
};

export default Input;
