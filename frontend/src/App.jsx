import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import LibraryPage from './pages/LibraryPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import PDFReaderPage from './pages/PDFReaderPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SmartGroupsPage from './pages/SmartGroupsPage';
import { CacheService } from './services/cacheService';
import "./PdfHighlighter.css";

function App() {
  // 初始化缓存服务
  useEffect(() => {
    CacheService.init().then((success) => {
      if (success) {
        console.log('📦 本地缓存服务已启动');
      }
    });

    // 监听网络状态
    CacheService.onNetworkChange((isOnline) => {
      console.log(isOnline ? '🌐 网络已连接' : '📴 网络已断开，启用离线模式');
    });
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/read/:id" element={<PDFReaderPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LibraryPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="smart-groups" element={<SmartGroupsPage />} />
          <Route path="recent" element={<div>最近阅读页面 (待开发)</div>} />
          <Route path="graph" element={<div>知识图谱页面 (待开发)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
