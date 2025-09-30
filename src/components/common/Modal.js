import React from 'react';
import { Modal as RNModal, Text } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from './Button';
import { theme } from '../../theme';

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
`;

const ModalContent = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.large}px;
  width: 90%;
  max-width: 400px;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
`;

const ModalTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h5}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  flex: 1; /* Allow title to take space */
`;

const CloseButton = styled.TouchableOpacity`
  padding: ${({ theme }) => theme.spacing.tiny}px;
`;

const ModalBody = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
`;

const ModalText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 22px;
`;

const ModalActions = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.small}px;
`;

const Modal = ({ visible, onClose, title, children, showCloseButton = true, actions }) => {
  return (
    <RNModal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ModalContainer>
        <ModalContent>
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {showCloseButton && (
              <CloseButton onPress={onClose}>
                <Icon name="close" size={24} color={theme.colors.grey600} />
              </CloseButton>
            )}
          </ModalHeader>
          <ModalBody>
            {typeof children === 'string' ? <ModalText>{children}</ModalText> : children}
          </ModalBody>
          {actions && actions.length > 0 && (
            <ModalActions>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  title={action.text}
                  onPress={action.onPress}
                  variant={action.variant || 'primary'}
                  loading={action.loading}
                  disabled={action.disabled}
                />
              ))}
            </ModalActions>
          )}
        </ModalContent>
      </ModalContainer>
    </RNModal>
  );
};

export default Modal;
