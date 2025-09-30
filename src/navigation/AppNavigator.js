import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { storage } from '../utils/storage';

import { selectIsAuthenticated, setLoading, setCredentials, logout } from '../store/slices/authSlice';
import { selectAuthLoading } from '../store/slices/authSlice';

// Auth Pages
import SignUpPage from '../screens/Auth/SignUpPage';
import LoginPage from '../screens/Auth/LoginPage';
import ResetPasswordPage from '../screens/Auth/ResetPasswordPage';

// Onboarding Page
import OnboardingPage from '../screens/Onboarding/OnboardingPage';

// Main App Pages
import ProfilePage from '../screens/Settings/ProfilePage';
import SettingsPage from '../screens/Settings/SettingsPage';
import PrivacyPolicyPage from '../screens/Legal/PrivacyPolicyPage';
import TermsOfServicePage from '../screens/Legal/TermsOfServicePage';
import SubscriptionManagementPage from '../screens/Subscription/SubscriptionManagementPage';
import UpliftLibraryPage from '../screens/Uplift/UpliftLibraryPage';
import NewSoloPrepSessionPage from '../screens/Unpack/SoloPrep/NewSoloPrepSessionPage';
import SoloPrepJournalPage from '../screens/Unpack/SoloPrep/SoloPrepJournalPage';
import StrategyBriefingPage from '../screens/Unpack/SoloPrep/StrategyBriefingPage';
import SessionHistoryPage from '../screens/Unpack/SessionHistoryPage';
import SessionDetailPage from '../screens/Unpack/SessionDetailPage';
import JointUnpackDashboardPage from '../screens/Unpack/JointUnpack/JointUnpackDashboardPage';
import GuestInvitationPage from '../screens/Unpack/JointUnpack/GuestInvitationPage';
import GuestResponsePage from '../screens/Unpack/JointUnpack/GuestResponsePage';
import JointUnpackRevealPage from '../screens/Unpack/JointUnpack/JointUnpackRevealPage';
import { theme } from '../theme';

// Components
import Spinner from '../components/common/Spinner';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginPage} />
    <Stack.Screen name="SignUp" component={SignUpPage} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordPage} />
  </Stack.Navigator>
);

const OnboardingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Onboarding" component={OnboardingPage} />
  </Stack.Navigator>
);

// Wrapper components to include AppLayout
const UpliftLibraryWithLayout = () => (
  <AppLayout>
    <UpliftLibraryPage />
  </AppLayout>
);

const NewSoloPrepSessionWithLayout = () => (
  <AppLayout>
    <NewSoloPrepSessionPage />
  </AppLayout>
);

const SoloPrepJournalWithLayout = () => (
  <AppLayout>
    <SoloPrepJournalPage />
  </AppLayout>
);

const StrategyBriefingWithLayout = () => (
  <AppLayout>
    <StrategyBriefingPage />
  </AppLayout>
);

const SessionHistoryWithLayout = () => (
  <AppLayout>
    <SessionHistoryPage />
  </AppLayout>
);

const SessionDetailWithLayout = () => (
  <AppLayout>
    <SessionDetailPage />
  </AppLayout>
);

const JointUnpackDashboardWithLayout = () => (
  <AppLayout>
    <JointUnpackDashboardPage />
  </AppLayout>
);

const JointUnpackRevealWithLayout = () => (
  <AppLayout>
    <JointUnpackRevealPage />
  </AppLayout>
);

const ProfileWithLayout = () => (
  <AppLayout>
    <ProfilePage />
  </AppLayout>
);

const SettingsWithLayout = () => (
  <AppLayout>
    <SettingsPage />
  </AppLayout>
);

const SubscriptionManagementWithLayout = () => (
  <AppLayout>
    <SubscriptionManagementPage />
  </AppLayout>
);

const PrivacyPolicyWithLayout = () => (
  <AppLayout>
    <PrivacyPolicyPage />
  </AppLayout>
);

const TermsOfServiceWithLayout = () => (
  <AppLayout>
    <TermsOfServicePage />
  </AppLayout>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="UpliftLibrary" component={UpliftLibraryWithLayout} />
    <Stack.Screen name="NewSoloPrepSession" component={NewSoloPrepSessionWithLayout} />
    <Stack.Screen name="SoloPrepJournal" component={SoloPrepJournalWithLayout} />
    <Stack.Screen name="StrategyBriefing" component={StrategyBriefingWithLayout} />
    <Stack.Screen name="SessionHistory" component={SessionHistoryWithLayout} />
    <Stack.Screen name="SessionDetail" component={SessionDetailWithLayout} />
    <Stack.Screen name="JointUnpackDashboard" component={JointUnpackDashboardWithLayout} />
    <Stack.Screen name="JointUnpackReveal" component={JointUnpackRevealWithLayout} />
    <Stack.Screen name="Profile" component={ProfileWithLayout} />
    <Stack.Screen name="Settings" component={SettingsWithLayout} />
    <Stack.Screen name="SubscriptionManagement" component={SubscriptionManagementWithLayout} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyWithLayout} />
    <Stack.Screen name="TermsOfService" component={TermsOfServiceWithLayout} />
  </Stack.Navigator>
);

const GuestUnpackStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GuestInvitation" component={GuestInvitationPage} />
    <Stack.Screen name="GuestResponse" component={GuestResponsePage} />
    <Stack.Screen name="JointUnpackRevealAsGuest" component={JointUnpackRevealPage} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        dispatch(setLoading(true));
        const token = await storage.getItem('authToken');
        const userJson = await storage.getItem('user');

        if (token && userJson && userJson !== 'undefined' && userJson !== 'null' && userJson !== null) {
          try {
            const user = JSON.parse(userJson);
            dispatch(setCredentials({ user, token }));
          } catch (parseError) {
            console.error('Failed to parse user data:', parseError);
            dispatch(logout());
          }
        } else {
          dispatch(logout()); // Ensure state is clear if partial data exists
        }
      } catch (error) {
        console.error('Failed to load auth data from storage:', error);
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadAuthData();
  }, [dispatch]);

  // Handle deep linking for guest sessions
  // This will require actual deep link setup in App.js or a dedicated deep link handler
  // For now, we'll assume guest sessions are handled by a specific route.
  // A dedicated deep link handler component would typically wrap this.

  if (isLoading) {
    return <Spinner />; // Or a splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Authenticated users
          <Stack.Screen name="App" component={AppStack} />
        ) : (
          // Unauthenticated users (Auth or Guest)
          // Consider a branching logic here if you expect guest deep links to bypass AuthStack
          // For now, GuestUnpackStack is assumed to be navigated to directly by deep link handler
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
        {/* Guest sessions can be accessed directly via deep links, regardless of auth status */}
        <Stack.Screen name="GuestUnpack" component={GuestUnpackStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
