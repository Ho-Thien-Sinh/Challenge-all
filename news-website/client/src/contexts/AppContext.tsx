import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ThemeType = 'light' | 'dark';

interface AppContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const defaultState: AppContextType = {
  theme: 'light',
  toggleTheme: () => {},
  isMobile: false,
  isTablet: false,
  isDesktop: true,
};

const AppContext = createContext<AppContextType>(defaultState);

export const useApp = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('light');
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState<boolean>(
    window.innerWidth >= 768 && window.innerWidth < 992
  );
  const [isDesktop, setIsDesktop] = useState<boolean>(window.innerWidth >= 992);

  // Xử lý responsive
  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    setIsMobile(width < 768);
    setIsTablet(width >= 768 && width < 992);
    setIsDesktop(width >= 992);
  }, []);

  // Thêm event listener cho resize
  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  // Effect để áp dụng theme
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        isMobile,
        isTablet,
        isDesktop,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
