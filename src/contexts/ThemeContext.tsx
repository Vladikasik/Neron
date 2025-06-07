import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ThemeType = 'matrix' | 'regular';

export interface Theme {
  type: ThemeType;
  colors: {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    // Graph specific colors
    nodeColors: string[];
    linkColor: string;
    // Console colors
    consoleBackground: string;
    consoleBorder: string;
    consoleText: string;
  };
  fonts: {
    primary: string;
  };
}

export const matrixTheme: Theme = {
  type: 'matrix',
  colors: {
    background: '#000003',
    primary: '#00FF41',
    secondary: '#00DD35',
    accent: '#00BB29',
    text: '#00FF41',
    textSecondary: '#00DD35',
    border: '#00FF41',
    success: '#00FF41',
    error: '#FF0041',
    warning: '#FFFF00',
    nodeColors: ['#00FF41', '#00DD35', '#00BB29', '#00991D', '#007711'],
    linkColor: '#00FF4144',
    consoleBackground: 'rgba(0, 0, 0, 0.85)',
    consoleBorder: '#00FF41',
    consoleText: '#00FF41',
  },
  fonts: {
    primary: 'monospace',
  },
};

export const regularTheme: Theme = {
  type: 'regular',
  colors: {
    background: '#000003',
    primary: '#74B9FF',
    secondary: '#81ECEC',
    accent: '#A29BFE',
    text: '#FFFFFF',
    textSecondary: '#74B9FF',
    border: '#2D3436',
    success: '#00B894',
    error: '#FF6B6B',
    warning: '#FDCB6E',
    nodeColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#F39C12', '#A8E6CF', '#81ECEC', '#FD79A8'],
    linkColor: '#ffffff44',
    consoleBackground: 'rgba(45, 52, 54, 0.85)',
    consoleBorder: '#74B9FF',
    consoleText: '#74B9FF',
  },
  fonts: {
    primary: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif',
  },
};

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (themeType: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(matrixTheme); // Default to Matrix theme

  const toggleTheme = () => {
    setCurrentTheme(prevTheme => 
      prevTheme.type === 'matrix' ? regularTheme : matrixTheme
    );
  };

  const setTheme = (themeType: ThemeType) => {
    setCurrentTheme(themeType === 'matrix' ? matrixTheme : regularTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 