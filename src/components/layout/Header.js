import React from 'react';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { APP_NAME } from '../../constants';
import { theme } from '../../theme';

const HeaderWrapper = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.small}px ${({ theme }) => theme.spacing.medium}px;
  background-color: rgba(255, 107, 53, 0.25);
  border-bottom-width: 1px;
  border-bottom-color: rgba(255, 107, 53, 0.6);
  margin-horizontal: ${({ theme }) => theme.spacing.small}px;
  margin-top: ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.spacing.medium}px;
`;

const LeftSection = styled.View`
  flex-direction: row;
  align-items: center;
`;

const HeaderTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.h5}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: #2c3e50;
  text-shadow: 0px 2px 4px rgba(255, 255, 255, 0.8);
`;

const IconButton = styled.TouchableOpacity`
  padding: ${({ theme }) => theme.spacing.tiny}px;
  margin-right: ${({ theme }) => theme.spacing.extraSmall}px;
  border-radius: ${({ theme }) => theme.spacing.tiny}px;
  background-color: ${({ pressed }) => pressed ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
`;

const Header = () => {
  const navigation = useNavigation();

  // Basic header, will need more sophisticated logic for back buttons, etc.
  // based on navigation stack and specific screen requirements.
  const canGoBack = navigation.canGoBack();

  return (
    <HeaderWrapper>
      <LeftSection>
        {canGoBack && (
          <IconButton onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#00d4aa" />
          </IconButton>
        )}
        <HeaderTitle>{APP_NAME}</HeaderTitle>
      </LeftSection>
      <IconButton onPress={() => navigation.navigate('Settings')}>
        <Icon name="settings" size={24} color="#00d4aa" />
      </IconButton>
    </HeaderWrapper>
  );
};

export default Header;
