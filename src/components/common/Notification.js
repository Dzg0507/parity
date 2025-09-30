import React from 'react';
import styled from 'styled-components/native';
import { Text } from 'react-native'; // Keeping this simple, can be expanded to Toast/Snackbar

const NotificationWrapper = styled.View`
  background-color: ${({ type, theme }) => {
    switch (type) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.error;
      case 'info': return theme.colors.info;
      default: return theme.colors.grey800;
    }
  }};
  padding: ${({ theme }) => theme.spacing.medium}px;
  border-radius: 8px;
  margin: ${({ theme }) => theme.spacing.medium}px;
  align-self: center; /* Center horizontally */
  position: absolute; /* Position above other content */
  top: 50px; /* Adjust as needed */
  width: 90%;
  max-width: 350px;
  z-index: 1000;
  boxShadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
`;

const NotificationText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  text-align: center;
`;

const Notification = ({ message, type = 'info' }) => {
  if (!message) return null;

  return (
    <NotificationWrapper type={type}>
      <NotificationText>{message}</NotificationText>
    </NotificationWrapper>
  );
};

export default Notification;
