import React from 'react';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import AuthForm from '../../components/auth/AuthForm';
import { useRegisterUserWithEmailPasswordMutation, useSocialLoginMutation } from '../../store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials, setError, clearError } from '../../store/slices/authSlice';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// import appleAuth from '@invertase/react-native-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import { Platform, Alert as RNAlert } from 'react-native';
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

const SignUpPage = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [registerUser, { isLoading: isRegisterLoading, error: registerError }] = useRegisterUserWithEmailPasswordMutation();
  const [socialLogin, { isLoading: isSocialLoginLoading, error: socialLoginError }] = useSocialLoginMutation();

  const handleSignUp = async (values) => {
    dispatch(clearError());
    try {
      const response = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      }).unwrap();
      dispatch(setCredentials({ user: response.user, token: response.token }));
      // Navigation is handled by AppNavigator's isAuthenticated check, which will go to Onboarding
    } catch (err) {
      console.error('Registration failed:', err);
      dispatch(setError(err.data?.message || 'Registration failed. Please try again.'));
    }
  };

  const handleGoogleLogin = async () => {
    dispatch(clearError());
    try {
      // TODO: Implement Google Sign-In with Expo AuthSession
      console.log('Google Sign-In not implemented yet');
      RNAlert.alert('Coming Soon', 'Google Sign-In will be available soon!');
      // TODO: Uncomment below for mobile implementation
      // await GoogleSignin.hasPlayServices();
      // const userInfo = await GoogleSignin.signIn();
      // const { idToken } = userInfo;

      // if (idToken) {
      //   const response = await socialLogin({
      //     provider: 'google',
      //     token: idToken,
      //   }).unwrap();
      //   dispatch(setCredentials({ user: response.user, token: response.token }));
      // } else {
      //   throw new Error('Google ID Token not found.');
      // }
    } catch (error) {
      console.error('Google Sign-Up Error: ', error);
      // TODO: Uncomment below for mobile implementation
      // if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      //   dispatch(setError('Google Sign-Up cancelled.'));
      // } else if (error.code === statusCodes.IN_PROGRESS) {
      //   dispatch(setError('Google Sign-Up is already in progress.'));
      // } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      //   dispatch(setError('Google Play Services are not available.'));
      // } else {
        dispatch(setError(error.message || 'Google Sign-Up failed. Please try again.'));
      // }
    }
  };

  const handleAppleLogin = async () => {
    dispatch(clearError());
    if (Platform.OS !== 'ios') return;

    try {
      // TODO: Implement Apple Sign-In with Expo AuthSession
      console.log('Apple Sign-In not implemented yet');
      RNAlert.alert('Coming Soon', 'Apple Sign-In will be available soon!');
      // TODO: Uncomment below for mobile implementation
      // const appleAuthRequestResponse = await appleAuth.performRequest({
      //   requestedOperation: appleAuth.Operation.LOGIN,
      //   requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      // });

      // const { identityToken, nonce, realUserStatus } = appleAuthRequestResponse;

      // if (identityToken) {
      //   const response = await socialLogin({
      //     provider: 'apple',
      //     token: identityToken,
      //     nonce: nonce,
      //     fullName: appleAuthRequestResponse.fullName,
      //     email: appleAuthRequestResponse.email,
      //   }).unwrap();
      //   dispatch(setCredentials({ user: response.user, token: response.token }));
      // } else {
      //   throw new Error('Apple Identity Token not found.');
      // }
    } catch (error) {
      console.error('Apple Sign-Up Error: ', error);
      // TODO: Uncomment below for mobile implementation
      // if (error.code === appleAuth.Error.CANCELED) {
      //   dispatch(setError('Apple Sign-Up cancelled.'));
      // } else {
        dispatch(setError(error.message || 'Apple Sign-Up failed. Please try again.'));
      // }
    }
  };

  const navigateToLogin = () => navigation.navigate('Login');

  const currentError = registerError?.data?.message || socialLoginError?.data?.message || null;

  return (
    <Container>
      <Title>Join Parity</Title>
      <Subtitle>Create your account to start your journey towards better relationships.</Subtitle>
      <AuthForm
        formType="signup"
        onSubmit={handleSignUp}
        onGoogleLogin={handleGoogleLogin}
        onAppleLogin={handleAppleLogin}
        loading={isRegisterLoading || isSocialLoginLoading}
        error={currentError}
        onNavigateToLogin={navigateToLogin}
      />
    </Container>
  );
};

export default SignUpPage;
