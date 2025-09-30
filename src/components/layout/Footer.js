import React from 'react';
import styled from 'styled-components/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

const FooterWrapper = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding-vertical: ${({ theme }) => theme.spacing.medium}px;
  background-color: rgba(30, 60, 114, 0.4);
  border-top-width: 1px;
  border-top-color: rgba(0, 212, 170, 0.7);
  margin-horizontal: ${({ theme }) => theme.spacing.small}px;
  margin-bottom: ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.spacing.medium}px;
  shadow-color: #000;
  shadow-offset: 0px -2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 5;
`;

const NavItem = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.small}px;
  margin: ${({ theme, active }) => active ? '2px' : '4px'};
  border-radius: ${({ theme }) => theme.spacing.medium}px;
  background-color: ${({ active }) => 
    active ? 'rgba(0, 212, 170, 0.15)' : 'transparent'};
  ${({ active }) => active && `
    box-shadow: 0px 4px 15px rgba(0, 212, 170, 0.3);
    elevation: 8;
  `}
`;

const NavText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.caption}px;
  font-weight: ${({ active }) => active ? '700' : '600'};
  color: ${({ active }) =>
    active ? '#00d4aa' : '#2c3e50'};
  margin-top: ${({ theme }) => theme.spacing.tiny / 2}px;
`;

const NavIcon = styled(Icon)`
  color: ${({ active }) =>
    active ? '#00d4aa' : '#2c3e50'};
`;

const Footer = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Get current route to determine active tab
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Only show footer if authenticated. Onboarding/Auth screens don't need it.
  if (!isAuthenticated) {
    return null;
  }

  const navigateTo = (screenName) => {
    // Prevent navigating to the same screen twice if it's already active
    if (route.name !== screenName) {
      navigation.navigate(screenName);
    }
  };

  const isTabActive = (tabName) => {
    // Get the current route name
    const currentRouteName = route.name;
    
    // Define which pages belong to which tab
    const tabMappings = {
      'UpliftLibrary': ['UpliftLibrary'],
      'SoloPrep': ['NewSoloPrepSession', 'SoloPrepJournal', 'StrategyBriefing'],
      'JointUnpack': ['SessionHistory', 'JointUnpackDashboard', 'JointUnpackReveal', 'SessionDetail']
    };
    
    // Check if current route belongs to the specified tab
    return tabMappings[tabName]?.includes(currentRouteName) || currentRouteName === tabName;
  };

  return (
    <FooterWrapper>
      <NavItem 
        onPress={() => navigateTo('UpliftLibrary')}
        active={isTabActive('UpliftLibrary')}
      >
        <NavIcon
          name="emoji-emotions"
          size={24}
          active={isTabActive('UpliftLibrary')}
        />
        <NavText active={isTabActive('UpliftLibrary')}>Uplift</NavText>
      </NavItem>
      <NavItem 
        onPress={() => navigateTo('NewSoloPrepSession')}
        active={isTabActive('SoloPrep')}
      >
        <NavIcon
          name="self-improvement"
          size={24}
          active={isTabActive('SoloPrep')}
        />
        <NavText active={isTabActive('SoloPrep')}>Solo Prep</NavText>
      </NavItem>
      <NavItem 
        onPress={() => navigateTo('SessionHistory')}
        active={isTabActive('JointUnpack')}
      >
        <NavIcon
          name="people"
          size={24}
          active={isTabActive('JointUnpack')}
        />
        <NavText active={isTabActive('JointUnpack')}>Joint Unpack</NavText>
      </NavItem>
    </FooterWrapper>
  );
};

export default Footer;
