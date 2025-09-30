import React from 'react';
import { Text } from 'react-native';
import styled from 'styled-components/native';
import SelectDropdown from '../common/SelectDropdown';
import Spinner from '../common/Spinner';
import { useGetConversationTopicsQuery } from '../../store/api/unpackApi';
import { theme } from '../../theme';

const Container = styled.View`
  width: 100%;
`;

const TopicSelector = ({ selectedValue, onValueChange, error }) => {
  const { data: conversationTopics, isLoading, isError, error: fetchError } = useGetConversationTopicsQuery();

  if (isLoading) {
    return <Spinner size="small" />;
  }

  if (isError) {
    return (
      <Container>
        <Text style={{ color: theme.colors.error }}>
          Error loading conversation topics: {fetchError?.data?.message || fetchError?.message || 'Unknown error'}
        </Text>
      </Container>
    );
  }

  const items = conversationTopics ? conversationTopics.map((topic, index) => ({ label: topic.name, value: topic.id || topic.name || index.toString() })) : [];

  return (
    <Container>
      <SelectDropdown
        label="Conversation Topic"
        placeholder="Select a conversation topic"
        items={items}
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        error={error}
      />
    </Container>
  );
};

export default TopicSelector;
