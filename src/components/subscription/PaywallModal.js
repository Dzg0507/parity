import React from 'react';
import styled from 'styled-components/native';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';

const ModalContentWrapper = styled.View`
  align-items: center;
`;

const IconWrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h4}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
  text-align: center;
`;

const Description = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  line-height: 22px;
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
`;

const FeatureList = styled.View`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
  align-items: flex-start;
`;

const FeatureItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const FeatureText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-left: ${({ theme }) => theme.spacing.small}px;
`;

const PaywallModal = ({ visible, onClose, featureName, description }) => {
  const navigation = useNavigation();

  const handleUpgrade = () => {
    onClose();
    navigation.navigate('SubscriptionManagement');
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Unlock Premium Feature"
      showCloseButton={true}
      actions={[
        { text: 'Not now', onPress: onClose, variant: 'secondary' },
        { text: 'Upgrade to Premium', onPress: handleUpgrade, variant: 'primary' },
      ]}
    >
      <ModalContentWrapper>
        <IconWrapper>
          <Icon name="workspace-premium" size={60} color={theme.colors.accent} />
        </IconWrapper>
        <Title>{featureName} requires Parity Premium</Title>
        <Description>{description}</Description>

        <FeatureList>
          <FeatureItem>
            <Icon name="check-circle" size={20} color={theme.colors.success} />
            <FeatureText>Unlimited Solo Prep Sessions</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <Icon name="check-circle" size={20} color={theme.colors.success} />
            <FeatureText>Unlimited Joint Unpack Sessions</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <Icon name="check-circle" size={20} color={theme.colors.success} />
            <FeatureText>Access to all premium prompts and briefings</FeatureText>
          </FeatureItem>
        </FeatureList>
      </ModalContentWrapper>
    </Modal>
  );
};

export default PaywallModal;
