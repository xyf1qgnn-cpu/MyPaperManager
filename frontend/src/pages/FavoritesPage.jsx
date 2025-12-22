import React, { useState, useEffect } from 'react';
import { Card, message } from 'antd';
import { getFavoriteDocuments, toggleFavorite } from '../services/documentService';
import DocumentList from '../components/DocumentList';

const FavoritesPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await getFavoriteDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch favorite documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleToggleFavorite = async (id) => {
    try {
      await toggleFavorite(id);
      message.success('已取消收藏');
      // 刷新列表
      fetchDocuments();
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="我的收藏" bordered={false}>
        <DocumentList 
          documents={documents} 
          loading={loading} 
          onToggleFavorite={handleToggleFavorite}
        />
      </Card>
    </div>
  );
};

export default FavoritesPage;
