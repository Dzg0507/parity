import React from 'react';
import styled from 'styled-components/native';
import { FlatList } from 'react-native';
import Button from '../common/Button';
import { theme } from '../../theme';

const FilterContainer = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.medium}px;
  padding-bottom: ${({ theme }) => theme.spacing.small}px;
`;

const CategoryButton = styled(Button)`
  margin-horizontal: ${({ theme }) => theme.spacing.tiny}px;
  padding-vertical: ${({ theme }) => theme.spacing.extraSmall}px;
  padding-horizontal: ${({ theme }) => theme.spacing.small}px;
  background-color: ${({ theme, active, isAll }) =>
    active ? theme.colors.primary : isAll ? 'rgba(255, 255, 255, 0.9)' : theme.colors.grey200};
  border-color: ${({ theme, active, isAll }) =>
    active ? theme.colors.primary : isAll ? 'rgba(42, 82, 152, 0.6)' : theme.colors.border};
  border-width: ${({ isAll }) => isAll ? '1px' : '0px'};
  shadow-color: ${({ isAll }) => isAll ? '#000' : 'transparent'};
  shadow-offset: 0px 1px;
  shadow-opacity: ${({ isAll }) => isAll ? '0.1' : '0'};
  shadow-radius: 2px;
  elevation: ${({ isAll }) => isAll ? '2' : '0'};
`;

const CategoryButtonText = styled.Text`
  color: ${({ theme, active, isAll }) =>
    active ? theme.colors.textLight : isAll ? '#2a5298' : theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.fontSizes.bodySmall}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  const renderCategoryItem = ({ item }) => (
    <CategoryButton
      title={item.name}
      onPress={() => onSelectCategory(item.id)}
      active={item.id === selectedCategory}
      isAll={item.id === null}
      variant={item.id === selectedCategory ? 'primary' : 'secondary'}
      textStyle={{ color: item.id === selectedCategory ? '#2c3e50' : item.id === null ? '#2a5298' : '#2c3e50' }}
      style={{
        backgroundColor: item.id === selectedCategory ? '#00d4aa' : item.id === null ? 'rgba(255, 255, 255, 0.9)' : '#ff6b35',
      }}
    />
  );

  return (
    <FilterContainer>
      <FlatList
        data={[{ id: null, name: 'All' }, ...(Array.isArray(categories) ? categories : [])]} // Add 'All' option with proper array check
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id || 'all'}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </FilterContainer>
  );
};

export default CategoryFilter;
