import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { ThemeProvider } from 'styled-components/native';
import { theme } from './src/theme';
import { ThemeProvider as CustomThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fixScrollIssues } from './src/utils/scrollFix';

const App = () => {
  useEffect(() => {
    // Fix scroll issues on web
    fixScrollIssues();
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CustomThemeProvider>
          <SafeAreaProvider>
            <AppNavigator />
          </SafeAreaProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
