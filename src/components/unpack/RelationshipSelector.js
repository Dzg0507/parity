import React from 'react';
import { Text } from 'react-native';
import styled from 'styled-components/native';
import SelectDropdown from '../common/SelectDropdown';
import Spinner from '../common/Spinner';
import { useGetRelationshipTypesQuery } from '../../store/api/unpackApi';
import { theme } from '../../theme';

const Container = styled.View`
  width: 100%;
`;

const RelationshipSelector = ({ selectedValue, onValueChange, error }) => {
  const { data: relationshipTypes, isLoading, isError, error: fetchError } = useGetRelationshipTypesQuery();

  if (isLoading) {
    return <Spinner size="small" />;
  }

  if (isError) {
    return (
      <Container>
        <Text style={{ color: theme.colors.error }}>
          Error loading relationship types: {fetchError?.data?.message || fetchError?.message || 'Unknown error'}
        </Text>
      </Container>
    );
  }

  const items = relationshipTypes ? relationshipTypes.map((type, index) => ({ label: type.name, value: type.id || type.name || index.toString() })) : [];

  return (
    <Container>
      <SelectDropdown
        label="Relationship Type"
        placeholder="Select a relationship type"
        items={items}
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        error={error}
      />
    </Container>
  );
};

export default RelationshipSelector;
