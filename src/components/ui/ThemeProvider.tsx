import React, { useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme
    let theme = settings.theme;
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
    
    // Update CSS custom properties for theme
    if (theme === 'light') {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--text-primary', '#1e293b');
      root.style.setProperty('--text-secondary', '#64748b');
      root.style.setProperty('--border-color', '#e2e8f0');
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#94a3b8');
      root.style.setProperty('--border-color', '#334155');
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }

    // Apply animation preferences
    if (!settings.animations) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--transition-duration', '0.2s');
    }

    // Apply particle effects
    if (!settings.particles) {
      root.classList.add('no-particles');
    } else {
      root.classList.remove('no-particles');
    }
  }, [settings.theme, settings.animations, settings.particles]);

  return <>{children}</>;
};