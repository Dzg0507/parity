import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SessionCard from '../../components/sessions/SessionCard';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import { useGetSoloPrepSessionHistoryQuery } from '../../store/api/soloPrepApi';
// Potentially also joint unpack history when that API is available

const Container = styled.View`
  flex: 1;
  background-color: transparent;
  padding: ${({ theme }) => theme.spacing.medium}px;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h3}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: #2c3e50;
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
  text-align: center;
  text-shadow: 0px 2px 4px rgba(255, 255, 255, 0.8);
`;

const EmptyListText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: #34495e;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.large}px;
  text-shadow: 0px 2px 4px rgba(255, 255, 255, 0.8);
`;

const SessionHistoryPage = () => {
  const navigation = useNavigation();
  const { data: soloPrepSessions, isLoading: isLoadingSoloPrep, error: soloPrepError } = useGetSoloPrepSessionHistoryQuery();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');

  useEffect(() => {
    if (soloPrepError) {
      setAlertMessage(soloPrepError.data?.message || 'Failed to load session history.');
      setAlertVariant('error');
      setShowAlert(true);
    }
  }, [soloPrepError]);

  const handleSessionPress = (sessionId, sessionType) => {
    navigation.navigate('SessionDetail', { sessionId, sessionType });
  };

  const allSessions = Array.isArray(soloPrepSessions) ? soloPrepSessions : []; // Add joint unpack sessions here later
  const sortedSessions = [...allSessions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (isLoadingSoloPrep) {
    return <Spinner />;
  }

  return (
    <Container>
      <Alert
        visible={showAlert}
        message={alertMessage}
        variant={alertVariant}
        onDismiss={() => setShowAlert(false)}
      />
      <Title>Session History</Title>
      {sortedSessions.length === 0 ? (
        <EmptyListText>No completed sessions yet. Start a Solo Prep or Joint Unpack!</EmptyListText>
      ) : (
        <FlatList
          data={sortedSessions}
          renderItem={({ item }) => (
            <SessionCard session={item} onPress={handleSessionPress} />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: theme.spacing.large }}
        />
      )}
    </Container>
  );
};

export default SessionHistoryPage;
