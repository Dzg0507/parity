import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { Switch, Text, View } from 'react-native';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser, setUser } from '../../store/slices/authSlice';
import {
  useUpdateNotificationPreferencesMutation,
  useRequestDataExportMutation,
  useGetSubscriptionStatusQuery,
} from '../../store/api/userApi';
import { useDeleteUserAccountMutation } from '../../store/api/authApi';
import { theme } from '../../theme';
import { APP_NAME } from '../../constants';

const Container = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.huge, // Extra padding for scroll
  },
}))`
  background-color: rgba(42, 82, 152, 0.05);
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h3}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
  width: 100%;
  text-align: center;
`;

const SectionTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h6}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: #2c3e50;
  margin-top: ${({ theme }) => theme.spacing.large}px;
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
  text-shadow: 0px 2px 4px rgba(255, 255, 255, 0.8);
  background-color: rgba(0, 212, 170, 0.15);
  padding: ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.spacing.small}px;
  border-left-width: 4px;
  border-left-color: #00d4aa;
  border-top-width: 1px;
  border-top-color: rgba(0, 212, 170, 0.4);
  border-right-width: 1px;
  border-right-color: rgba(255, 107, 53, 0.3);
  border-bottom-width: 1px;
  border-bottom-color: rgba(42, 82, 152, 0.3);
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 2;
`;

const SettingItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-vertical: ${({ theme }) => theme.spacing.small}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const SettingLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  flex: 1;
`;

const AccountCard = styled(Card)`
  background-color: rgba(0, 212, 170, 0.1);
  border-left-width: 4px;
  border-left-color: #00d4aa;
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const NotificationCard = styled(Card)`
  background-color: rgba(255, 107, 53, 0.1);
  border-left-width: 4px;
  border-left-color: #ff6b35;
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const LegalCard = styled(Card)`
  background-color: rgba(42, 82, 152, 0.1);
  border-left-width: 4px;
  border-left-color: #2a5298;
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const AppVersionText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodySmall}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.huge}px;
`;

const SettingsPage = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const { data: subscriptionStatus, isLoading: isSubscriptionLoading } = useGetSubscriptionStatusQuery();
  const [updateNotificationPreferences, { isLoading: isUpdatingNotifications }] = useUpdateNotificationPreferencesMutation();
  const [requestDataExport, { isLoading: isExportingData }] = useRequestDataExportMutation();
  const [deleteUserAccount, { isLoading: isDeletingAccount }] = useDeleteUserAccountMutation();

  const [notificationsEnabled, setNotificationsEnabled] = useState(currentUser?.notificationPreferences?.enabled || false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');

  useEffect(() => {
    if (currentUser?.notificationPreferences) {
      setNotificationsEnabled(currentUser.notificationPreferences.enabled);
    }
  }, [currentUser]);

  const handleToggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    try {
      await updateNotificationPreferences({ enabled: value }).unwrap();
      dispatch(setUser({ notificationPreferences: { enabled: value } }));
      setAlertMessage('Notification preferences updated.');
      setAlertVariant('success');
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      setAlertMessage(error.data?.message || 'Failed to update notification preferences.');
      setAlertVariant('error');
      setNotificationsEnabled(!value); // Revert UI on error
    } finally {
      setShowAlert(true);
    }
  };

  const handleRequestDataExport = async () => {
    try {
      await requestDataExport().unwrap();
      setAlertMessage('Your data export request has been submitted. You will receive an email when it is ready.');
      setAlertVariant('success');
    } catch (error) {
      console.error('Failed to request data export:', error);
      setAlertMessage(error.data?.message || 'Failed to request data export. Please try again.');
      setAlertVariant('error');
    } finally {
      setShowAlert(true);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteAccountModal(false);
    try {
      await deleteUserAccount().unwrap();
      setAlertMessage('Your account has been successfully deleted.');
      setAlertVariant('success');
      dispatch(logout()); // Log out after deletion
      // navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); // Navigate to login
    } catch (error) {
      console.error('Failed to delete account:', error);
      setAlertMessage(error.data?.message || 'Failed to delete account. Please try again.');
      setAlertVariant('error');
    } finally {
      setShowAlert(true);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    // navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); // Navigate to login
  };

  const appVersion = '1.0.0'; // You might get this from package.json or react-native-version-info

  return (
    <Container>
      <Alert
        visible={showAlert}
        message={alertMessage}
        variant={alertVariant}
        onDismiss={() => setShowAlert(false)}
      />

      <Modal
        visible={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        title="Confirm Account Deletion"
        actions={[
          { text: 'Cancel', onPress: () => setShowDeleteAccountModal(false), variant: 'secondary' },
          { text: 'Delete Account', onPress: handleDeleteAccount, variant: 'danger', loading: isDeletingAccount },
        ]}
      >
        <Text style={{ fontSize: theme.typography.fontSizes.bodyMedium, color: theme.colors.textPrimary, lineHeight: 22 }}>
          Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be removed.
        </Text>
      </Modal>

      <Title>Settings</Title>

      <SectionTitle>Account</SectionTitle>
      <AccountCard onPress={() => navigation.navigate('Profile')}>
        <SettingLabel>Edit Profile</SettingLabel>
      </AccountCard>
      <AccountCard onPress={() => navigation.navigate('SubscriptionManagement')}>
        <SettingLabel>Subscription ({isSubscriptionLoading ? 'Loading...' : subscriptionStatus?.tier || 'Free'})</SettingLabel>
      </AccountCard>

      <SectionTitle>Notifications</SectionTitle>
      <NotificationCard>
        <SettingItem>
          <SettingLabel>Enable Notifications</SettingLabel>
          <Switch
            onValueChange={handleToggleNotifications}
            value={notificationsEnabled}
            trackColor={{ false: theme.colors.grey400, true: theme.colors.primaryLight }}
            thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.grey200}
            disabled={isUpdatingNotifications}
          />
        </SettingItem>
      </NotificationCard>

      <SectionTitle>Legal & Data</SectionTitle>
      <LegalCard onPress={() => navigation.navigate('PrivacyPolicy')}>
        <SettingLabel>Privacy Policy</SettingLabel>
      </LegalCard>
      <LegalCard onPress={() => navigation.navigate('TermsOfService')}>
        <SettingLabel>Terms of Service</SettingLabel>
      </LegalCard>
      <LegalCard onPress={handleRequestDataExport} disabled={isExportingData}>
        <SettingLabel>Request Data Export</SettingLabel>
        {isExportingData && <Spinner size="small" />}
      </LegalCard>

      <SectionTitle>Danger Zone</SectionTitle>
      <Card onPress={() => setShowDeleteAccountModal(true)} style={{ backgroundColor: theme.colors.error, marginBottom: theme.spacing.large }}>
        <SettingLabel style={{ color: theme.colors.white }}>Delete Account</SettingLabel>
      </Card>

      <Button
        title="Logout"
        onPress={handleLogout}
        variant="secondary"
        style={{ marginTop: theme.spacing.medium }}
      />

      <AppVersionText>
        {APP_NAME} Version {appVersion}
      </AppVersionText>
    </Container>
  );
};

export default SettingsPage;
