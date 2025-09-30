import React from 'react';
import styled from 'styled-components/native';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
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

const RevealConfirmationModal = ({ visible, onClose, onConfirm, loading, initiatorReady, inviteeReady }) => {
  const readyCount = [initiatorReady, inviteeReady].filter(Boolean).length;
  const totalUsers = 2;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Ready to Reveal?"
      showCloseButton={true}
      actions={[
        { text: 'Cancel', onPress: onClose, variant: 'secondary' },
        { text: 'Confirm Reveal', onPress: onConfirm, variant: 'primary', loading: loading, disabled: loading },
      ]}
    >
      <ModalContentWrapper>
        <IconWrapper>
          <Icon name="visibility" size={60} color={theme.colors.primary} />
        </IconWrapper>
        <Title>Confirm Mutual Reveal</Title>
        <Description>
          By confirming, your responses will be revealed to your partner, and their responses will be revealed to you. This action cannot be undone.
        </Description>
        <Description style={{ fontWeight: theme.typography.fontWeights.bold, color: theme.colors.textPrimary }}>
          {readyCount} out of {totalUsers} participants are ready.
        </Description>
      </ModalContentWrapper>
    </Modal>
  );
};

export default RevealConfirmationModal;
