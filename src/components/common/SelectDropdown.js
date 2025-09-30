import React from 'react';
import { Text } from 'react-native';
import styled from 'styled-components/native';
import { Picker } from '@react-native-picker/picker'; // Using @react-native-picker/picker
import { theme } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DropdownWrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.medium}px;
  width: 100%;
`;

const DropdownLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodyMedium}px;
  color: #2c3e50;
  margin-bottom: ${({ theme }) => theme.spacing.tiny}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  text-shadow: 0px 2px 4px rgba(255, 255, 255, 0.8);
  background-color: rgba(0, 212, 170, 0.12);
  padding: ${({ theme }) => theme.spacing.tiny}px ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.spacing.tiny}px;
  border-left-width: 3px;
  border-left-color: #00d4aa;
  border-top-width: 1px;
  border-top-color: rgba(0, 212, 170, 0.3);
  border-right-width: 1px;
  border-right-color: rgba(42, 82, 152, 0.2);
`;

const PickerContainer = styled.View`
  border-width: 2px;
  border-color: ${({ theme, hasError }) =>
    hasError ? theme.colors.error : 'rgba(0, 212, 170, 0.4)'};
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.95);
  overflow: hidden; /* To ensure the picker doesn't bleed outside the border radius */
  shadow-color: #000;
  shadow-offset: 0px 3px;
  shadow-opacity: 0.15;
  shadow-radius: 6px;
  elevation: 4;
`;

const StyledPicker = styled(Picker)`
  height: 50px; /* Standard height for inputs */
  width: 100%;
  color: ${({ theme, selectedValue }) =>
    selectedValue === '' ? '#7f8c8d' : '#2c3e50'};
`;

const ErrorText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.bodySmall}px;
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.tiny}px;
`;

const SelectDropdown = ({ label, items, selectedValue, onValueChange, placeholder, error, ...props }) => {
  return (
    <DropdownWrapper>
      {label && <DropdownLabel>{label}</DropdownLabel>}
      <PickerContainer hasError={!!error}>
        <StyledPicker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          itemStyle={{ color: '#2c3e50', fontSize: props.theme?.typography?.fontSizes?.bodyLarge || 18 }} // iOS specific style
          {...props}
        >
          {placeholder && (
            <Picker.Item label={placeholder} value="" enabled={false} color="#7f8c8d" />
          )}
          {items.map((item) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </StyledPicker>
      </PickerContainer>
      {error && <ErrorText>{error}</ErrorText>}
    </DropdownWrapper>
  );
};

export default SelectDropdown;
