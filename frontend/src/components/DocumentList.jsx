import React from 'react';
import { List, Card, Tag, Button, Empty, Tooltip, Popconfirm } from 'antd';
import { FilePdfOutlined, HeartOutlined, HeartFilled, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const DocumentList = ({ documents, loading, onToggleFavorite, onDelete, showFavoriteBtn = true }) => {
  const navigate = useNavigate();

  if (!loading && (!documents || documents.length === 0)) {
    return <Empty description="暂无文献" />;
  }

  const handleCardClick = (id) => {
    console.log('Navigating to document ID:', id);
    if (!id) return;
    navigate(`/read/${id}`);
  };

  return (
    <List
      loading={loading}
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
      dataSource={documents}
      renderItem={(item) => (
        <List.Item>
          <Card 
              title={
                <Tooltip title={item.title}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                </Tooltip>
              }
              extra={
                <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                  {showFavoriteBtn && (
                    <Button 
                      type="text" 
                      icon={item.isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} 
                      onClick={() => onToggleFavorite && onToggleFavorite(item._id)}
                    />
                  )}
                  {item.pdfUrl ? (
                    <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                    </a>
                  ) : (
                    <FilePdfOutlined style={{ color: '#ccc', fontSize: 16 }} />
                  )}
                  {onDelete && (
                    <Popconfirm
                      title="确定删除这篇文献吗？"
                      description="删除后无法恢复"
                      onConfirm={() => onDelete(item._id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button 
                        type="text" 
                        danger
                        icon={<DeleteOutlined />} 
                      />
                    </Popconfirm>
                  )}
                </div>
              }
              hoverable
              size="small"
              variant="borderless"
              style={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
              styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
              onClick={() => handleCardClick(item._id)}
          >
            <div style={{ marginBottom: 8 }}>
              {Array.isArray(item.authors) && item.authors.map((author, index) => (
                <Tag key={index} color="blue" style={{ marginBottom: 4, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {author}
                </Tag>
              ))}
            </div>
            <div style={{ 
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                color: '#666',
                fontSize: '12px'
            }}>
              {item.abstract || '暂无摘要'}
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
};

export default DocumentList;
