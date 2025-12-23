import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { HeartFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';
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
      fetchDocuments();
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <div>
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, 
          marginBottom: 24,
        }}
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 10px rgba(255, 77, 79, 0.3)',
              '0 0 20px rgba(255, 77, 79, 0.5)',
              '0 0 10px rgba(255, 77, 79, 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HeartFilled style={{ fontSize: 18, color: '#fff' }} />
        </motion.div>
        <div>
          <h2 style={{ 
            margin: 0, 
            fontSize: 20, 
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            我的收藏
          </h2>
          <p style={{ 
            margin: 0, 
            fontSize: 12, 
            color: 'var(--text-tertiary)',
          }}>
            共收藏 {documents.length} 篇文献
          </p>
        </div>
      </motion.div>
      
      {/* 文献列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <DocumentList 
          documents={documents} 
          loading={loading} 
          onToggleFavorite={handleToggleFavorite}
        />
      </motion.div>
    </div>
  );
};

export default FavoritesPage;
