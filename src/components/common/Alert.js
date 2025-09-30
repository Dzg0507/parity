import React, { useState, useEffect } from 'react';
import { Animated, Easing, Dimensions, Text } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');

const getBackgroundColor = (theme, variant) => {
  switch (variant) {
    case 'success':
      return theme.colors.success;
    case 'error':
      return theme.colors.error;
    case 'warning':
      return theme.colors.warning;
    case 'info':
      return theme.colors.info;
    default:
      return theme.colors.grey800; // Default dark grey for notifications
  }
};

const AlertContainer = styled(Animated.View)`
  position: absolute;
  top: 0; /* Will be animated */
  left: 0;
  right: 0;
  padding: ${({ theme }) => theme.spacing.small}px;
  background-color: ${({ theme, variant }) => getBackgroundColor(theme, variant)};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 60px; /* Ensure enough space for text */
  z-index: 1000;
  boxShadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
`;

const AlertContent = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;

const AlertIcon = styled(Icon)`
  margin-right: ${({ theme }) => theme.spacing.small}px;
  color: ${({ theme }) => theme.colors.textLight};
`;

const AlertText = styled.Text`
  flex: 1; /* Allow text to wrap */
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  line-height: ${({ theme }) => theme.typography.fontSizes.bodyMedium * 1.4}px;
`;

const CloseButton = styled.TouchableOpacity`
  padding: ${({ theme }) => theme.spacing.tiny}px;
  margin-left: ${({ theme }) => theme.spacing.small}px;
`;

const Alert = ({ message, variant = 'info', duration = 3000, visible, onDismiss }) => {
  const [showAlert, setShowAlert] = useState(false);
  const translateY = React.useRef(new Animated.Value(-100)).current; // Start off-screen

  useEffect(() => {
    if (visible) {
      setShowAlert(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start(() => {
        if (duration > 0) {
          setTimeout(() => {
            hideAlert();
          }, duration);
        }
      });
    } else {
      hideAlert();
    }
  }, [visible, duration]);

  const hideAlert = () => {
    Animated.timing(translateY, {
      toValue: -100, // Move back off-screen
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      setShowAlert(false);
      onDismiss && onDismiss();
    });
  };

  if (!showAlert) {
    return null;
  }

  let iconName;
  switch (variant) {
    case 'success': iconName = 'check-circle'; break;
    case 'error': iconName = 'error'; break;
    case 'warning': iconName = 'warning'; break;
    case 'info': iconName = 'info'; break;
    default: iconName = 'notifications';
  }

  return (
    <AlertContainer
      variant={variant}
      style={{ transform: [{ translateY }] }}
    >
      <AlertContent>
        <AlertIcon name={iconName} size={24} />
        <AlertText>{message}</AlertText>
      </AlertContent>
      <CloseButton onPress={hideAlert}>
        <AlertIcon name="close" size={24} />
      </CloseButton>
    </AlertContainer>
  );
};

export default Alert;
