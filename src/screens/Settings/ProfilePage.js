import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setUser } from '../../store/slices/authSlice';
import { useUpdateUserProfileMutation } from '../../store/api/authApi';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import { theme } from '../../theme';

const Container = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
    padding: theme.spacing.medium,
    alignItems: 'center',
  },
}))`
  background-color: ${({ theme }) => theme.colors.background};
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h3}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
  width: 100%;
  text-align: center;
`;

const ProfileForm = styled.View`
  width: 100%;
  max-width: 400px;
`;

const ProfilePage = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const [updateUserProfile, { isLoading: isUpdating, error: updateError }] = useUpdateUserProfileMutation();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');

  useEffect(() => {
    if (updateError) {
      setAlertMessage(updateError.data?.message || 'Failed to update profile.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  }, [updateError]);

  const validationSchema = Yup.object().shape({
    name: Yup.string().nullable().max(50, 'Name must be 50 characters or less'),
    email: Yup.string().email('Invalid email').required('Email is required'),
  });

  const handleSubmit = async (values) => {
    setShowAlert(false); // Clear previous alerts
    try {
      const response = await updateUserProfile(values).unwrap();
      dispatch(setUser(response.user)); // Update Redux state with new user info
      setAlertMessage('Profile updated successfully!');
      setAlertVariant('success');
      setShowAlert(true);
    } catch (err) {
      // Error is handled by useEffect
    }
  };

  if (!currentUser) {
    return <Spinner />; // Or redirect to login, or show a placeholder
  }

  return (
    <Container>
      <Alert
        visible={showAlert}
        message={alertMessage}
        variant={alertVariant}
        onDismiss={() => setShowAlert(false)}
      />
      <Title>Edit Profile</Title>
      <Formik
        initialValues={{
          name: currentUser.name || '',
          email: currentUser.email || '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize // Re-initialize form if currentUser changes
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, dirty }) => (
          <ProfileForm>
            <Input
              label="Name"
              placeholder="Your Name"
              iconName="person"
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
              error={touched.name && errors.name}
              autoCapitalize="words"
            />
            <Input
              label="Email"
              placeholder="Your Email"
              iconName="email"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              error={touched.email && errors.email}
            />
            <Button
              title="Save Changes"
              onPress={handleSubmit}
              disabled={!isValid || !dirty || isUpdating}
              loading={isUpdating}
              style={{ marginTop: theme.spacing.medium }}
            />
          </ProfileForm>
        )}
      </Formik>
    </Container>
  );
};

export default ProfilePage;
