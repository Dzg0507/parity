import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useGetSoloPrepBriefingQuery } from '../../../store/api/soloPrepApi';
import { useConvertSoloPrepToJointUnpackMutation } from '../../../store/api/jointUnpackApi';
import Spinner from '../../../components/common/Spinner';
import Alert from '../../../components/common/Alert';
import GeneratedBriefing from '../../../components/unpack/GeneratedBriefing';
import PaywallModal from '../../../components/subscription/PaywallModal';
import { useGetSubscriptionStatusQuery } from '../../../store/api/userApi';
import { theme } from '../../../theme';

const Container = styled.ScrollView.attrs(() => ({
  contentContainerStyle: {
    flexGrow: 1,
    paddingBottom: theme.spacing.extraLarge,
  },
}))`
  background-color: ${({ theme }) => theme.colors.background};
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h3}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-top: ${({ theme }) => theme.spacing.medium}px;
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
  text-align: center;
`;

const StrategyBriefingPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId } = route.params || {};

  const { data: briefing, isLoading: isLoadingBriefing, error: briefingError } = useGetSoloPrepBriefingQuery(sessionId);
  const [convertSoloPrep, { isLoading: isConvertingToJointUnpack, error: convertError }] = useConvertSoloPrepToJointUnpackMutation();
  const { data: subscriptionStatus } = useGetSubscriptionStatusQuery();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');
  const [showPaywall, setShowPaywall] = useState(false);

  const isPremium = subscriptionStatus?.tier === 'premium';

  useEffect(() => {
    if (briefingError) {
      setAlertMessage(briefingError.data?.message || 'Failed to load strategy briefing.');
      setAlertVariant('error');
      setShowAlert(true);
    }
    if (convertError) {
      setAlertMessage(convertError.data?.message || 'Failed to convert to Joint Unpack session.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  }, [briefingError, convertError]);

  const handleConvertToJointUnpack = async () => {
    setShowAlert(false); // Clear previous alerts
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }

    try {
      const response = await convertSoloPrep(sessionId).unwrap();
      navigation.replace('JointUnpackDashboard', { sessionId: response.jointUnpackSessionId });
    } catch (err) {
      // Error handled by useEffect
    }
  };

  if (isLoadingBriefing) {
    return <Spinner />;
  }

  if (briefingError) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Alert
          visible={showAlert}
          message={alertMessage}
          variant={alertVariant}
          onDismiss={() => setShowAlert(false)}
        />
        <Title>Error</Title>
        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
          Unable to load strategy briefing for this session.
        </Text>
      </Container>
    );
  };

  return (
    <Container>
      <Alert
        visible={showAlert}
        message={alertMessage}
        variant={alertVariant}
        onDismiss={() => setShowAlert(false)}
      />

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureName="Joint Unpack Session"
        description="Initiating a Joint Unpack session requires Parity Premium."
      />

      <Title>Your Strategy Briefing</Title>
      <GeneratedBriefing
        briefing={briefing}
        onConvertToJointUnpack={handleConvertToJointUnpack}
        isConverting={isConvertingToJointUnpack}
      />
    </Container>
  );
};

export default StrategyBriefingPage;
