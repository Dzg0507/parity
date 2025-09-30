import React from 'react';
import styled from 'styled-components/native';
import Button from '../common/Button';
import Input from '../common/Input';
import SocialLoginButton from '../common/SocialLoginButton';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Text, View } from 'react-native'; // For DividerText
import { theme } from '../../theme';

const AuthFormContainer = styled.View`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.medium}px;
`;

const Divider = styled.View`
  flex-direction: row;
  align-items: center;
  margin-vertical: ${({ theme }) => theme.spacing.medium}px;
`;

const DividerLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const DividerText = styled.Text`
  margin-horizontal: ${({ theme }) => theme.spacing.small}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.bodySmall}px;
`;

const FooterText = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  margin-top: ${({ theme }) => theme.spacing.medium}px;
`;

const LinkText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;

const AuthForm = ({
  formType, // 'login', 'signup', 'resetPassword'
  onSubmit,
  onGoogleLogin,
  onAppleLogin,
  loading,
  error, // General error message from API
  onNavigateToSignup,
  onNavigateToLogin,
  onNavigateToResetPassword,
  showSocialLogins = true,
}) => {
  const isLogin = formType === 'login';
  const isSignup = formType === 'signup';
  const isResetPassword = formType === 'resetPassword';

  const validationSchema = Yup.object().shape({
    ...(isSignup && {
      name: Yup.string().required('Name is required'),
    }),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    ...(isSignup && {
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    ...(isResetPassword && {
      token: Yup.string().required('Reset token is required'), // If token is entered manually
      newPassword: Yup.string()
        .min(6, 'New password must be at least 6 characters')
        .required('New password is required'),
      confirmNewPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Confirm new password is required'),
    }),
  });

  const initialValues = {
    ...(isSignup && { name: '' }),
    email: '',
    password: '',
    ...(isSignup && { confirmPassword: '' }),
    ...(isResetPassword && { token: '', newPassword: '', confirmNewPassword: '' }),
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
        <form>
          <AuthFormContainer>
          {isResetPassword ? (
            <>
              {/* For confirming reset, token would usually come from deep link */}
              {/* Or if we allow manual entry */}
              <Input
                label="Reset Token (if prompted)"
                placeholder="Enter reset token"
                iconName="vpn-key"
                onChangeText={handleChange('token')}
                onBlur={handleBlur('token')}
                value={values.token}
                error={touched.token && errors.token}
              />
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
            </>
          ) : (
            <>
              {isSignup && (
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  iconName="person"
                  autoCapitalize="words"
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  value={values.name}
                  error={touched.name && errors.name}
                />
              )}
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
              <Input
                label="Password"
                placeholder="Enter your password"
                iconName="lock"
                secureTextEntry
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                error={touched.password && errors.password}
              />
              {isSignup && (
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  iconName="lock"
                  secureTextEntry
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  value={values.confirmPassword}
                  error={touched.confirmPassword && errors.confirmPassword}
                />
              )}
            </>
          )}

          {error && <Text style={{ color: theme.colors.error, textAlign: 'center', marginBottom: theme.spacing.medium }}>{error}</Text>}

          <Button
            title={
              isLogin
                ? 'Login'
                : isSignup
                  ? 'Sign Up'
                  : isResetPassword
                    ? 'Set New Password'
                    : 'Submit'
            }
            onPress={handleSubmit}
            disabled={!isValid || loading}
            loading={loading}
            style={{ marginTop: isLogin ? theme.spacing.small : theme.spacing.extraSmall }}
          />

          {isLogin && (
            <FooterText>
              Forgot your password?{' '}
              <LinkText onPress={onNavigateToResetPassword}>Reset here</LinkText>
            </FooterText>
          )}

          {showSocialLogins && (
            <>
              <Divider>
                <DividerLine />
                <DividerText>OR</DividerText>
                <DividerLine />
              </Divider>

              <SocialLoginButton provider="google" onPress={onGoogleLogin} disabled={loading} />
              <SocialLoginButton provider="apple" onPress={onAppleLogin} disabled={loading} />
            </>
          )}

          {!isResetPassword && (
            <FooterText>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <LinkText onPress={isLogin ? onNavigateToSignup : onNavigateToLogin}>
                {isLogin ? 'Sign Up' : 'Login'}
              </LinkText>
            </FooterText>
          )}
        </AuthFormContainer>
        </form>
      )}
    </Formik>
  );
};

export default AuthForm;
