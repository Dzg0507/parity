import React from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../theme';

const SpinnerContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ overlay, theme }) => (overlay ? 'rgba(0,0,0,0.3)' : theme.colors.background)};
  position: ${({ overlay }) => (overlay ? 'absolute' : 'relative')};
  ${({ overlay }) => overlay && 'top: 0; left: 0; right: 0; bottom: 0;'}
`;

const Spinner = ({ size = 'large', color = theme.colors.primary, overlay = false, style }) => {
  return (
    <SpinnerContainer overlay={overlay} style={style}>
      <ActivityIndicator size={size} color={color} />
    </SpinnerContainer>
  );
};

export default Spinner;
