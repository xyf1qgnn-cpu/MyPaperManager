import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Empty, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import SmartGroupPanel from '../components/SmartGroupPanel';
import DocumentList from '../components/DocumentList';
import ExportModal from '../components/ExportModal';
import { getSmartGroupDocuments } from '../services/smartGroupService';
import { toggleFavorite, deleteDocument } from '../services/documentService';

const SmartGroupsPage = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupDocuments();
    } else {
      setDocuments([]);
    }
  }, [selectedGroup]);

  const fetchGroupDocuments = async () => {
    if (!selectedGroup) return;
    
    setLoading(true);
    try {
      const groupKey = selectedGroup.type === 'preset' ? selectedGroup.key : selectedGroup.id;
      const response = await getSmartGroupDocuments(groupKey);
      setDocuments(response.data || []);
    } catch (error) {
      console.error('获取分组文献失败:', error);
      message.error('获取文献失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await toggleFavorite(id);
      message.success('操作成功');
      fetchGroupDocuments();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      message.success('删除成功');
      fetchGroupDocuments();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleExport = () => {
    setSelectedIds(documents.map(d => d._id));
    setExportModalVisible(true);
  };

  return (
    <div>
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 10px rgba(0, 212, 255, 0.3)',
              '0 0 20px rgba(0, 212, 255, 0.5)',
              '0 0 10px rgba(0, 212, 255, 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 18, color: '#0a0f1a' }}>⚡</span>
        </motion.div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>
            智能分组
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>
            智能筛选，AI驱动的文献分类
          </p>
        </div>
      </motion.div>

      <Row gutter={24}>
        {/* 左侧分组面板 */}
        <Col xs={24} lg={8} xl={6}>
          <SmartGroupPanel 
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
          />
        </Col>

        {/* 右侧文献列表 */}
        <Col xs={24} lg={16} xl={18}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {selectedGroup ? (
              <div>
                {/* 分组标题栏 */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  padding: '12px 16px',
                  background: `${selectedGroup.color}15`,
                  border: `1px solid ${selectedGroup.color}30`,
                  borderRadius: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: selectedGroup.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 600
                    }}>
                      {documents.length}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {selectedGroup.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {selectedGroup.type === 'preset' ? '预设分组' : selectedGroup.type === 'ai' ? 'AI智能分组' : '自定义分组'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={fetchGroupDocuments}
                      loading={loading}
                    >
                      刷新
                    </Button>
                    {documents.length > 0 && (
                      <Button type="primary" onClick={handleExport}>
                        导出引用
                      </Button>
                    )}
                  </div>
                </div>

                {/* 文献列表 */}
                <Spin spinning={loading}>
                  {documents.length > 0 ? (
                    <DocumentList
                      documents={documents}
                      loading={loading}
                      onToggleFavorite={handleToggleFavorite}
                      onDelete={handleDelete}
                    />
                  ) : (
                    <Empty 
                      description={
                        <span style={{ color: 'var(--text-tertiary)' }}>
                          该分组暂无文献
                        </span>
                      }
                      style={{
                        padding: 60,
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: 12,
                        border: '1px solid var(--border-primary)'
                      }}
                    />
                  )}
                </Spin>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 80,
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 12,
                border: '1px dashed var(--border-primary)'
              }}>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ fontSize: 48, marginBottom: 16 }}
                >
                  👈
                </motion.div>
                <div style={{ 
                  fontSize: 16, 
                  fontWeight: 500, 
                  color: 'var(--text-secondary)',
                  marginBottom: 8
                }}>
                  选择一个智能分组
                </div>
                <div style={{ 
                  fontSize: 13, 
                  color: 'var(--text-tertiary)',
                  textAlign: 'center'
                }}>
                  从左侧面板选择预设分组或使用自然语言创建新分组
                </div>
              </div>
            )}
          </motion.div>
        </Col>
      </Row>

      {/* 导出弹窗 */}
      <ExportModal
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        selectedIds={selectedIds}
        mode="selected"
      />
    </div>
  );
};

export default SmartGroupsPage;

