import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import LibraryPage from './pages/LibraryPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import PDFReaderPage from './pages/PDFReaderPage';
import "./PdfHighlighter.css";

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/read/:id" element={<PDFReaderPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LibraryPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="recent" element={<div>最近阅读页面 (待开发)</div>} />
          <Route path="graph" element={<div>知识图谱页面 (待开发)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
