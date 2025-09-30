import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { useGetPrivacyPolicyContentQuery } from '../../store/api/legalApi';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';

const Container = styled.ScrollView.attrs(({ theme }) => ({
  contentContainerStyle: {
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.extraLarge, // Ensure space below content
  },
}))`
  background-color: ${({ theme }) => theme.colors.background};
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h3}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
  text-align: center;
`;

const ContentText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 24px;
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
`;

const ErrorText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.large}px;
`;

const PrivacyPolicyPage = () => {
  const { data: privacyPolicyContent, isLoading, error } = useGetPrivacyPolicyContentQuery();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (error) {
      setAlertMessage(error.data?.message || 'Failed to load Privacy Policy. Please try again later.');
      setShowAlert(true);
    }
  }, [error]);

  return (
    <Container>
      <Alert
        visible={showAlert}
        message={alertMessage}
        variant="error"
        onDismiss={() => setShowAlert(false)}
      />

      <Title>Privacy Policy</Title>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorText>Could not load Privacy Policy.</ErrorText>
      ) : (
        <ContentText>{privacyPolicyContent?.content || 'Privacy Policy content not available.'}</ContentText>
      )}
    </Container>
  );
};

export default PrivacyPolicyPage;
