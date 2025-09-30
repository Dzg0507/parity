import React, { createContext, useContext, useState } from 'react';
import { COLOR_SCHEMES } from '../theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentScheme, setCurrentScheme] = useState('cosmic');
  
  const availableSchemes = Object.keys(COLOR_SCHEMES);
  
  const value = {
    currentScheme,
    setCurrentScheme,
    availableSchemes,
    colors: COLOR_SCHEMES[currentScheme],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
