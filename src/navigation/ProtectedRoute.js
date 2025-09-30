import React from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { Text, View } from 'react-native'; // Basic React Native imports
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import Button from '../components/common/Button';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.medium}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Message = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h5}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
`;

/**
 * A higher-order component (HOC) to protect routes.
 * If the user is not authenticated, it redirects them to the login page
 * or displays a message with a login button.
 */
const ProtectedRoute = ({ children, redirectTo = 'Login' }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigation = useNavigation();

  if (!isAuthenticated) {
    return (
      <Container>
        <Message>You need to be logged in to access this page.</Message>
        <Button title="Login" onPress={() => navigation.navigate(redirectTo)} />
      </Container>
    );
  }

  return children;
};

export default ProtectedRoute;
