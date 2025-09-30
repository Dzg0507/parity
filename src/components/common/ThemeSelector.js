import React from 'react';
import styled from 'styled-components/native';
import { useTheme } from '../../contexts/ThemeContext';
import { COLOR_SCHEMES } from '../../theme';

const ThemeSelectorContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.large}px;
  padding: ${({ theme }) => theme.spacing.medium}px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
`;

const ThemeButton = styled.TouchableOpacity`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${({ selected, scheme }) => 
    selected ? COLOR_SCHEMES[scheme].accent : 'rgba(255, 255, 255, 0.2)'};
  border-width: 2px;
  border-color: ${({ scheme }) => COLOR_SCHEMES[scheme].cardBorder};
  shadow-color: ${({ selected, scheme }) => 
    selected ? COLOR_SCHEMES[scheme].shadow : 'transparent'};
  shadow-offset: 0px 2px;
  shadow-opacity: ${({ selected }) => selected ? 0.3 : 0};
  shadow-radius: 4px;
  elevation: ${({ selected }) => selected ? 4 : 0};
`;

const ThemeButtonText = styled.Text`
  color: ${({ scheme }) => COLOR_SCHEMES[scheme].text};
  font-weight: ${({ selected, theme }) => 
    selected ? theme.typography.fontWeights.bold : theme.typography.fontWeights.medium};
  font-size: ${({ theme }) => theme.typography.fontSizes.bodySmall}px;
  text-transform: capitalize;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const ThemeSelector = ({ style }) => {
  const { currentScheme, setCurrentScheme, availableSchemes } = useTheme();

  return (
    <ThemeSelectorContainer style={style}>
      {availableSchemes.map((schemeName) => (
        <ThemeButton
          key={schemeName}
          selected={currentScheme === schemeName}
          scheme={currentScheme}
          onPress={() => setCurrentScheme(schemeName)}
        >
          <ThemeButtonText selected={currentScheme === schemeName} scheme={currentScheme}>
            {schemeName}
          </ThemeButtonText>
        </ThemeButton>
      ))}
    </ThemeSelectorContainer>
  );
};

export default ThemeSelector;
