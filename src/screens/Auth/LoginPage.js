import React from 'react';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import AuthForm from '../../components/auth/AuthForm';
import { useLoginUserMutation, useSocialLoginMutation } from '../../store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials, setError, clearError } from '../../store/slices/authSlice';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// import appleAuth from '@invertase/react-native-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import { Platform, Alert as RNAlert } from 'react-native'; // Use RNAlert to avoid conflict with common/Alert
import { theme } from '../../theme';

const Container = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: theme.spacing.extraLarge,
  },
}))`
  background-color: ${({ theme }) => theme.colors.background};
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h2}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
  text-align: center;
`;

const Subtitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.extraLarge}px;
  text-align: center;
  padding-horizontal: ${({ theme }) => theme.spacing.medium}px;
`;

const LoginPage = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [loginUser, { isLoading: isLoginLoading, error: loginError }] = useLoginUserMutation();
  const [socialLogin, { isLoading: isSocialLoginLoading, error: socialLoginError }] = useSocialLoginMutation();

  const handleLogin = async (values) => {
    dispatch(clearError()); // Clear previous errors
    try {
      const response = await loginUser({
        email: values.email,
        password: values.password,
      }).unwrap();
      dispatch(setCredentials({ user: response.user, token: response.token }));
      // Navigation is handled by AppNavigator's isAuthenticated check
    } catch (err) {
      console.error('Login failed:', err);
      dispatch(setError(err.data?.message || 'Login failed. Please check your credentials.'));
    }
  };

  const handleGoogleLogin = async () => {
    dispatch(clearError());
    try {
      // TODO: Implement Google Sign-In with Expo AuthSession
      console.log('Google Sign-In not implemented yet');
      RNAlert.alert('Coming Soon', 'Google Sign-In will be available soon!');
    } catch (error) {
      console.error('Google Sign-In Error: ', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        dispatch(setError('Google Sign-In cancelled.'));
      } else if (error.code === statusCodes.IN_PROGRESS) {
        dispatch(setError('Google Sign-In is already in progress.'));
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        dispatch(setError('Google Play Services are not available.'));
      } else {
        dispatch(setError(error.message || 'Google Sign-In failed. Please try again.'));
      }
    }
  };

  const handleAppleLogin = async () => {
    dispatch(clearError());
    if (Platform.OS !== 'ios') return; // Apple login is iOS specific

    try {
      // TODO: Implement Apple Sign-In with Expo AuthSession
      console.log('Apple Sign-In not implemented yet');
      RNAlert.alert('Coming Soon', 'Apple Sign-In will be available soon!');
      // TODO: Uncomment below for mobile implementation
      // return;
      // const appleAuthRequestResponse = await appleAuth.performRequest({
      //   requestedOperation: appleAuth.Operation.LOGIN,
      //   requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      // });

      // const { identityToken, nonce, realUserStatus } = appleAuthRequestResponse;

      // if (identityToken) {
      //   const response = await socialLogin({
      //     provider: 'apple',
      //     token: identityToken, // This is the JWT from Apple
      //     nonce: nonce, // If using for cryptographic verification
      //     // You might send user name/email if available for first time signup
      //     fullName: appleAuthRequestResponse.fullName,
      //     email: appleAuthRequestResponse.email,
      //   }).unwrap();
      //   dispatch(setCredentials({ user: response.user, token: response.token }));
      // } else {
      //   throw new Error('Apple Identity Token not found.');
      // }
    } catch (error) {
      if (error.code === appleAuth.Error.CANCELED) {
        dispatch(setError('Apple Sign-In cancelled.'));
      } else {
        console.error('Apple Sign-In Error: ', error);
        dispatch(setError(error.message || 'Apple Sign-In failed. Please try again.'));
      }
    }
  };

  const navigateToSignUp = () => navigation.navigate('SignUp');
  const navigateToResetPassword = () => navigation.navigate('ResetPassword');

  const currentError = loginError?.data?.message || socialLoginError?.data?.message || null;

  return (
    <Container>
      <Title>Welcome Back!</Title>
      <Subtitle>Log in to continue your journey of self-discovery and connection.</Subtitle>
      <AuthForm
        formType="login"
        onSubmit={handleLogin}
        onGoogleLogin={handleGoogleLogin}
        onAppleLogin={handleAppleLogin}
        loading={isLoginLoading || isSocialLoginLoading}
        error={currentError}
        onNavigateToSignup={navigateToSignUp}
        onNavigateToResetPassword={navigateToResetPassword}
      />
    </Container>
  );
};

export default LoginPage;
