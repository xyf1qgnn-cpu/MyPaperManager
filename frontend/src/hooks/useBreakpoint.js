import { useState, useEffect } from 'react';

// 断点定义
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
};

/**
 * 响应式断点检测 Hook
 * @returns {Object} 包含设备类型和屏幕宽度的对象
 */
export const useBreakpoint = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowWidth < BREAKPOINTS.mobile,
    isTablet: windowWidth >= BREAKPOINTS.mobile && windowWidth < BREAKPOINTS.tablet,
    isDesktop: windowWidth >= BREAKPOINTS.tablet,
    isLargeDesktop: windowWidth >= BREAKPOINTS.desktop,
    width: windowWidth,
  };
};

/**
 * 侧边栏宽度持久化 Hook
 * @param {string} key - localStorage key
 * @param {number} defaultValue - 默认宽度
 */
export const useSidebarWidth = (key = 'sidebar-width', defaultValue = 350) => {
  const [width, setWidth] = useState(() => {
    if (typeof window === 'undefined') return defaultValue;
    const saved = localStorage.getItem(key);
    return saved ? parseInt(saved, 10) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, width.toString());
  }, [key, width]);

  return [width, setWidth];
};

/**
 * 主题模式 Hook (预留深色/浅色切换)
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, setTheme, toggleTheme };
};

export default useBreakpoint;
