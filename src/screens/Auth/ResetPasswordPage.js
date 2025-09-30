import React, { useState } from 'react';
import styled from 'styled-components/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useRequestPasswordResetMutation, useConfirmPasswordResetMutation } from '../../store/api/authApi';
import Alert from '../../components/common/Alert';
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
  padding: ${({ theme }) => theme.spacing.medium}px;
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

const ResetPasswordPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const queryToken = route.params?.token; // Token might be passed via deep link

  const [requestPasswordReset, { isLoading: isRequestLoading, error: requestError }] = useRequestPasswordResetMutation();
  const [confirmPasswordReset, { isLoading: isConfirmLoading, error: confirmError }] = useConfirmPasswordResetMutation();

  const [showConfirmationFields, setShowConfirmationFields] = useState(!!queryToken);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');

  useEffect(() => {
    if (requestError) {
      setAlertMessage(requestError.data?.message || 'Failed to send reset link. Please try again.');
      setAlertVariant('error');
      setShowAlert(true);
    }
    if (confirmError) {
      setAlertMessage(confirmError.data?.message || 'Failed to reset password. The token might be invalid or expired.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  }, [requestError, confirmError]);

  const handleRequestReset = async (values) => {
    setShowAlert(false); // Clear previous alerts
    try {
      await requestPasswordReset(values.email).unwrap();
      setResetEmailSent(true);
      setAlertMessage('Password reset link sent to your email. Please check your inbox.');
      setAlertVariant('success');
      setShowAlert(true);
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleConfirmReset = async (values) => {
    setShowAlert(false); // Clear previous alerts
    try {
      await confirmPasswordReset({
        token: queryToken || values.token, // Use query token if available, else form value
        newPassword: values.newPassword,
      }).unwrap();
      setAlertMessage('Your password has been reset successfully. Please log in with your new password.');
      setAlertVariant('success');
      setShowAlert(true);
      setTimeout(() => navigation.navigate('Login'), 3000); // Navigate to login after a delay
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const requestSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
  });

  const confirmSchema = Yup.object().shape({
    ...(queryToken ? {} : { token: Yup.string().required('Reset token is required') }), // Token might be pre-filled
    newPassword: Yup.string()
      .min(6, 'New password must be at least 6 characters')
      .required('New password is required'),
    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm new password is required'),
  });

  return (
    <Container>
      <Alert
        visible={showAlert}
        message={alertMessage}
        variant={alertVariant}
        onDismiss={() => setShowAlert(false)}
      />

      <Title>{showConfirmationFields ? 'Set New Password' : 'Reset Your Password'}</Title>
      <Subtitle>
        {showConfirmationFields
          ? 'Enter your new password below.'
          : 'Enter your email address and we\'ll send you a link to reset your password.'}
      </Subtitle>

      {!showConfirmationFields ? (
        <Formik
          initialValues={{ email: '' }}
          validationSchema={requestSchema}
          onSubmit={handleRequestReset}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
            <>
              <Input
                label="Email"
                placeholder="Enter your email"
                iconName="email"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                error={touched.email && errors.email}
              />
              <Button
                title="Send Reset Link"
                onPress={handleSubmit}
                disabled={!isValid || isRequestLoading}
                loading={isRequestLoading}
              />
              {requestError && (
                <Text style={{ color: theme.colors.error, textAlign: 'center', marginTop: theme.spacing.medium }}>
                  {requestError.data?.message || 'Failed to send reset link.'}
                </Text>
              )}
            </>
          )}
        </Formik>
      ) : (
        <Formik
          initialValues={{ token: queryToken || '', newPassword: '', confirmNewPassword: '' }}
          validationSchema={confirmSchema}
          onSubmit={handleConfirmReset}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
            <>
              {!queryToken && ( // Only show token input if not from deep link
                <Input
                  label="Reset Token"
                  placeholder="Enter reset token"
                  iconName="vpn-key"
                  onChangeText={handleChange('token')}
                  onBlur={handleBlur('token')}
                  value={values.token}
                  error={touched.token && errors.token}
                />
              )}
              <Input
                label="New Password"
                placeholder="Enter new password"
                iconName="lock"
                secureTextEntry
                onChangeText={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
                value={values.newPassword}
                error={touched.newPassword && errors.newPassword}
              />
              <Input
                label="Confirm New Password"
                placeholder="Confirm new password"
                iconName="lock"
                secureTextEntry
                onChangeText={handleChange('confirmNewPassword')}
                onBlur={handleBlur('confirmNewPassword')}
                value={values.confirmNewPassword}
                error={touched.confirmNewPassword && errors.confirmNewPassword}
              />
              <Button
                title="Set New Password"
                onPress={handleSubmit}
                disabled={!isValid || isConfirmLoading}
                loading={isConfirmLoading}
              />
              {confirmError && (
                <Text style={{ color: theme.colors.error, textAlign: 'center', marginTop: theme.spacing.medium }}>
                  {confirmError.data?.message || 'Failed to reset password. Please check the token and try again.'}
                </Text>
              )}
            </>
          )}
        </Formik>
      )}

      {resetEmailSent && !showConfirmationFields && (
        <Button
          title="I have a token"
          variant="secondary"
          onPress={() => setShowConfirmationFields(true)}
          style={{ marginTop: theme.spacing.large }}
        />
      )}
      <Button
        title="Back to Login"
        variant="outline"
        onPress={() => navigation.navigate('Login')}
        style={{ marginTop: theme.spacing.large }}
      />
    </Container>
  );
};

export default ResetPasswordPage;
