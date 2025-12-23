import React, { useState } from 'react';
import { List, Tag, Button, Empty, Tooltip, Popconfirm, Segmented } from 'antd';
import { 
  FilePdfOutlined, 
  HeartOutlined, 
  HeartFilled, 
  DeleteOutlined,
  ClockCircleOutlined,
  UserOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// 单个文献卡片组件
const DocumentCard = ({ item, onToggleFavorite, onDelete, showFavoriteBtn, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8,
        boxShadow: '0 0 30px rgba(0, 212, 255, 0.25)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      style={{
        background: 'linear-gradient(145deg, rgba(36, 45, 61, 0.9) 0%, rgba(26, 35, 50, 0.8) 100%)',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.06)',
        padding: 0,
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'border-color 0.3s ease',
      }}
      className="document-card"
    >
      {/* 卡片顶部装饰条 */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, #00d4ff, #00ff88)',
        opacity: 0.8,
      }} />

      {/* 卡片内容 */}
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 标题 */}
        <Tooltip title={item.title}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.4,
          }}>
            {item.title}
          </h3>
        </Tooltip>

        {/* 作者标签 */}
        <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Array.isArray(item.authors) && item.authors.slice(0, 3).map((author, index) => (
            <Tag 
              key={index}
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                color: '#00d4ff',
                borderRadius: 6,
                fontSize: 11,
                padding: '2px 8px',
                margin: 0,
              }}
            >
              <UserOutlined style={{ marginRight: 4, fontSize: 10 }} />
              {author.length > 12 ? author.slice(0, 12) + '...' : author}
            </Tag>
          ))}
          {item.authors?.length > 3 && (
            <Tag style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-tertiary)',
              borderRadius: 6,
              fontSize: 11,
              padding: '2px 8px',
              margin: 0,
            }}>
              +{item.authors.length - 3}
            </Tag>
          )}
        </div>

        {/* 摘要 */}
        <p style={{
          flex: 1,
          margin: 0,
          fontSize: 12,
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.6,
        }}>
          {item.abstract || '暂无摘要'}
        </p>

        {/* 底部信息栏 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          {/* 时间信息 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ClockCircleOutlined style={{ fontSize: 12, color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '未知'}
            </span>
          </div>

          {/* 操作按钮 */}
          <div 
            style={{ display: 'flex', gap: 4 }} 
            onClick={(e) => e.stopPropagation()}
          >
            {showFavoriteBtn && (
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  type="text" 
                  size="small"
                  icon={item.isFavorite ? 
                    <HeartFilled style={{ color: '#ff4d4f' }} /> : 
                    <HeartOutlined style={{ color: 'var(--text-tertiary)' }} />
                  } 
                  onClick={() => onToggleFavorite && onToggleFavorite(item._id)}
                  style={{ padding: 4 }}
                />
              </motion.div>
            )}
            
            {item.pdfUrl && (
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <a 
                  href={item.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button 
                    type="text" 
                    size="small"
                    icon={<FilePdfOutlined style={{ color: '#ff6b35' }} />}
                    style={{ padding: 4 }}
                  />
                </a>
              </motion.div>
            )}
            
            {onDelete && (
              <Popconfirm
                title="确定删除这篇文献吗？"
                description="删除后无法恢复"
                onConfirm={() => onDelete(item._id)}
                okText="确定"
                cancelText="取消"
              >
                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                  <Button 
                    type="text" 
                    size="small"
                    danger
                    icon={<DeleteOutlined />} 
                    style={{ padding: 4 }}
                  />
                </motion.div>
              </Popconfirm>
            )}
          </div>
        </div>
      </div>

      {/* 卡片悬浮样式 */}
      <style>{`
        .document-card:hover {
          border-color: rgba(0, 212, 255, 0.3) !important;
        }
        
        .document-card:hover h3 {
          background: linear-gradient(90deg, #00d4ff, #00ff88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </motion.div>
  );
};

// 列表视图 - 单行项目组件
const DocumentListItem = ({ item, onToggleFavorite, onDelete, showFavoriteBtn, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ 
        x: 4,
        background: 'rgba(0, 212, 255, 0.05)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 16px',
        background: 'rgba(36, 45, 61, 0.5)',
        borderRadius: 10,
        border: '1px solid rgba(255, 255, 255, 0.04)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginBottom: 8,
      }}
      className="document-list-item"
    >
      {/* 左侧装饰条 */}
      <div style={{
        width: 3,
        height: 40,
        borderRadius: 2,
        background: 'linear-gradient(180deg, #00d4ff, #00ff88)',
        opacity: 0.7,
        flexShrink: 0,
      }} />

      {/* 文献信息 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Tooltip title={item.title}>
          <h4 style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {item.title}
          </h4>
        </Tooltip>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
          {/* 作者 */}
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            <UserOutlined style={{ marginRight: 4, fontSize: 10 }} />
            {Array.isArray(item.authors) ? item.authors.slice(0, 2).join(', ') : '-'}
            {item.authors?.length > 2 ? ' 等' : ''}
          </span>
          {/* 时间 */}
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            <ClockCircleOutlined style={{ marginRight: 4, fontSize: 10 }} />
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '未知'}
          </span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div 
        style={{ display: 'flex', gap: 4, flexShrink: 0 }} 
        onClick={(e) => e.stopPropagation()}
      >
        {showFavoriteBtn && (
          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
            <Button 
              type="text" 
              size="small"
              icon={item.isFavorite ? 
                <HeartFilled style={{ color: '#ff4d4f' }} /> : 
                <HeartOutlined style={{ color: 'var(--text-tertiary)' }} />
              } 
              onClick={() => onToggleFavorite && onToggleFavorite(item._id)}
              style={{ padding: 4 }}
            />
          </motion.div>
        )}
        
        {item.pdfUrl && (
          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
            <a 
              href={item.pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button 
                type="text" 
                size="small"
                icon={<FilePdfOutlined style={{ color: '#ff6b35' }} />}
                style={{ padding: 4 }}
              />
            </a>
          </motion.div>
        )}
        
        {onDelete && (
          <Popconfirm
            title="确定删除这篇文献吗？"
            description="删除后无法恢复"
            onConfirm={() => onDelete(item._id)}
            okText="确定"
            cancelText="取消"
          >
            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
              <Button 
                type="text" 
                size="small"
                danger
                icon={<DeleteOutlined />} 
                style={{ padding: 4 }}
              />
            </motion.div>
          </Popconfirm>
        )}
      </div>

      <style>{`
        .document-list-item:hover {
          border-color: rgba(0, 212, 255, 0.2) !important;
        }
        .document-list-item:hover h4 {
          color: #00d4ff !important;
        }
      `}</style>
    </motion.div>
  );
};

const DocumentList = ({ documents, loading, onToggleFavorite, onDelete, showFavoriteBtn = true, viewMode: externalViewMode, onViewModeChange }) => {
  const [internalViewMode, setInternalViewMode] = useState('card');
  
  // 支持外部控制或内部控制视图模式
  const viewMode = externalViewMode !== undefined ? externalViewMode : internalViewMode;
  const setViewMode = onViewModeChange || setInternalViewMode;
  const navigate = useNavigate();

  const handleCardClick = (id) => {
    if (!id) return;
    navigate(`/read/${id}`);
  };

  if (!loading && (!documents || documents.length === 0)) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 60,
        }}
      >
        <Empty 
          description={
            <span style={{ color: 'var(--text-tertiary)' }}>暂无文献</span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </motion.div>
    );
  }

  return (
    <div>
      {/* 视图切换按钮 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Segmented
          value={viewMode}
          onChange={setViewMode}
          options={[
            {
              value: 'card',
              icon: <AppstoreOutlined />,
              label: '卡片',
            },
            {
              value: 'list',
              icon: <UnorderedListOutlined />,
              label: '列表',
            },
          ]}
          style={{
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid var(--border-primary)',
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'card' ? (
          /* 卡片视图 */
          <motion.div
            key="card-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.06,
                  },
                },
              }}
            >
              <List
                loading={loading}
                grid={{ 
                  gutter: [20, 20], 
                  xs: 1, 
                  sm: 2, 
                  md: 2, 
                  lg: 3, 
                  xl: 4, 
                  xxl: 4 
                }}
                dataSource={documents}
                renderItem={(item, index) => (
                  <List.Item style={{ marginBottom: 0 }}>
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      style={{ height: '100%' }}
                    >
                      <DocumentCard
                        item={item}
                        onToggleFavorite={onToggleFavorite}
                        onDelete={onDelete}
                        showFavoriteBtn={showFavoriteBtn}
                        onClick={() => handleCardClick(item._id)}
                      />
                    </motion.div>
                  </List.Item>
                )}
              />
            </motion.div>
          </motion.div>
        ) : (
          /* 列表视图 */
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <List
              loading={loading}
              dataSource={documents}
              renderItem={(item, index) => (
                <DocumentListItem
                  item={item}
                  onToggleFavorite={onToggleFavorite}
                  onDelete={onDelete}
                  showFavoriteBtn={showFavoriteBtn}
                  onClick={() => handleCardClick(item._id)}
                />
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentList;
