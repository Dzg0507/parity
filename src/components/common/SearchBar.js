import React from 'react';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';

const SearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 25px; /* Pill shape */
  padding: ${({ theme }) => theme.spacing.extraSmall}px ${({ theme }) => theme.spacing.small}px;
  margin: ${({ theme }) => theme.spacing.medium}px;
  border-width: 2px;
  border-color: rgba(255, 107, 53, 0.6);
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyLarge}px;
  color: #2c3e50;
  margin-left: ${({ theme }) => theme.spacing.small}px;
  padding: 0; /* Reset default padding */
  height: 40px; /* Ensure consistent height */
`;

const ClearButton = styled.TouchableOpacity`
  margin-left: ${({ theme }) => theme.spacing.small}px;
  padding: ${({ theme }) => theme.spacing.tiny}px;
`;

const SearchBar = ({ placeholder = 'Search...', value, onChangeText, onSearch, onClear, style }) => {
  const handleClear = () => {
    onChangeText('');
    onClear && onClear();
  };

  const handleSubmitEditing = () => {
    onSearch && onSearch(value);
  };

  return (
    <SearchContainer style={style}>
      <Icon name="search" size={24} color="#ff6b35" />
      <SearchInput
        placeholder={placeholder}
        placeholderTextColor="#5a6c7d"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmitEditing}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <ClearButton onPress={handleClear}>
          <Icon name="clear" size={24} color="#ff6b35" />
        </ClearButton>
      )}
    </SearchContainer>
  );
};

export default SearchBar;
