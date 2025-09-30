import React from 'react';
import styled from 'styled-components/native';
import { FlatList, Text } from 'react-native';
import MessageCard from './MessageCard';
import Spinner from '../common/Spinner';
import { theme } from '../../theme';

const ListContainer = styled.View`
  flex: 1;
  width: 100%;
  padding-horizontal: ${({ theme }) => theme.spacing.medium}px;
  padding-top: ${({ theme }) => theme.spacing.small}px;
`;

const EmptyListText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.large}px;
`;

const MessageList = ({ messages, isLoading, error, onShare }) => {
  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <EmptyListText>Error loading messages: {error.message || 'Unknown error'}</EmptyListText>;
  }

  if (!messages || messages.length === 0) {
    return <EmptyListText>No uplifting messages found.</EmptyListText>;
  }

  const renderItem = ({ item }) => (
    <MessageCard message={item.content} category={item.categoryName} onShare={() => onShare(item.id)} />
  );

  return (
    <ListContainer>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.large }}
      />
    </ListContainer>
  );
};

export default MessageList;
