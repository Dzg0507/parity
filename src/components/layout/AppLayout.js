import React from 'react';
import { StatusBar, Platform } from 'react-native';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Header from './Header';
import Footer from './Footer';

const AppContainer = styled.View`
  flex: 1;
  background-color: #667eea;
  padding-top: ${({ insetsTop }) => insetsTop}px;
`;

const GradientBackground = styled(LinearGradient).attrs({
  colors: ['#1e3c72', '#2a5298', '#00d4aa', '#00a8cc'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
  locations: [0, 0.3, 0.7, 1]
})`
  flex: 1;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ContentContainer = styled.View`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.small}px;
  background-color: rgba(255, 107, 53, 0.15);
  margin-horizontal: ${({ theme }) => theme.spacing.small}px;
  border-radius: ${({ theme }) => theme.spacing.medium}px;
  border-width: 2px;
  border-color: rgba(255, 107, 53, 0.5);
`;

const AppLayout = ({ children }) => {
  const insets = useSafeAreaInsets();

  return (
    <AppContainer insetsTop={insets.top}>
      <GradientBackground />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Header />
      <ContentContainer>
        {children}
      </ContentContainer>
      <Footer />
    </AppContainer>
  );
};

export default AppLayout;
