import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, Input, Tooltip, List, Badge, Modal, Form, Spin, Empty, message } from 'antd';
import {
  FireOutlined,
  BookOutlined,
  CalendarOutlined,
  HeartOutlined,
  StarOutlined,
  EyeOutlined,
  FolderOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { getPresets, getSmartGroups, createFromNaturalLanguage, deleteSmartGroup, getSmartGroupDocuments } from '../services/smartGroupService';

// 图标映射
const ICON_MAP = {
  fire: <FireOutlined />,
  book: <BookOutlined />,
  calendar: <CalendarOutlined />,
  heart: <HeartOutlined />,
  star: <StarOutlined />,
  eye: <EyeOutlined />,
  folder: <FolderOutlined />,
  search: <SearchOutlined />,
};

const SmartGroupPanel = ({ onSelectGroup, selectedGroup }) => {
  const [presets, setPresets] = useState([]);
  const [customGroups, setCustomGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nlQuery, setNlQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const [presetsData, customData] = await Promise.all([
        getPresets(),
        getSmartGroups()
      ]);
      setPresets(presetsData || []);
      setCustomGroups(customData || []);
    } catch (error) {
      console.error('获取智能分组失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset) => {
    onSelectGroup?.({
      type: 'preset',
      key: preset.key,
      name: preset.name,
      color: preset.color
    });
  };

  const handleSelectCustom = (group) => {
    onSelectGroup?.({
      type: 'custom',
      id: group._id,
      name: group.name,
      color: group.color
    });
  };

  const handleNLSearch = async () => {
    if (!nlQuery.trim()) return;
    
    setCreating(true);
    try {
      const result = await createFromNaturalLanguage(nlQuery);
      message.success(`已创建智能分组，匹配 ${result.documentCount} 篇文献`);
      setNlQuery('');
      fetchGroups();
      // 自动选中新创建的分组
      handleSelectCustom(result);
    } catch (error) {
      message.error('创建分组失败: ' + (error.message || '请尝试更明确的描述'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId, e) => {
    e.stopPropagation();
    try {
      await deleteSmartGroup(groupId);
      message.success('删除成功');
      fetchGroups();
      if (selectedGroup?.id === groupId) {
        onSelectGroup?.(null);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 8px rgba(0, 212, 255, 0.4)',
                  '0 0 16px rgba(0, 212, 255, 0.6)',
                  '0 0 8px rgba(0, 212, 255, 0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ThunderboltOutlined style={{ fontSize: 14, color: '#0a0f1a' }} />
            </motion.div>
            <span style={{ fontWeight: 600 }}>智能分组</span>
          </div>
        }
        styles={{
          header: { borderBottom: '1px solid var(--border-primary)' },
          body: { padding: '16px' }
        }}
        style={{
          background: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--border-primary)',
          borderRadius: 12
        }}
      >
        <Spin spinning={loading}>
          {/* 预设分组 */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ 
              fontSize: 12, 
              color: 'var(--text-tertiary)', 
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              快捷筛选
            </div>
            <Space wrap size={[8, 8]}>
              {presets.map((preset) => (
                <motion.div
                  key={preset.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Tooltip title={`${preset.documentCount} 篇文献`}>
                    <Button
                      size="small"
                      onClick={() => handleSelectPreset(preset)}
                      icon={ICON_MAP[preset.icon] || <FolderOutlined />}
                      style={{
                        borderRadius: 16,
                        border: selectedGroup?.key === preset.key 
                          ? `1px solid ${preset.color}` 
                          : '1px solid var(--border-primary)',
                        background: selectedGroup?.key === preset.key 
                          ? `${preset.color}20` 
                          : 'transparent',
                        color: selectedGroup?.key === preset.key 
                          ? preset.color 
                          : 'var(--text-secondary)',
                      }}
                    >
                      {preset.name}
                      <Badge 
                        count={preset.documentCount} 
                        size="small"
                        style={{ 
                          marginLeft: 6,
                          backgroundColor: preset.color,
                          boxShadow: 'none'
                        }} 
                      />
                    </Button>
                  </Tooltip>
                </motion.div>
              ))}
            </Space>
          </div>

          {/* 自定义分组 */}
          {customGroups.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ 
                fontSize: 12, 
                color: 'var(--text-tertiary)', 
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                自定义分组
              </div>
              <List
                size="small"
                dataSource={customGroups}
                renderItem={(group) => (
                  <motion.div
                    whileHover={{ x: 4 }}
                    onClick={() => handleSelectCustom(group)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      marginBottom: 4,
                      background: selectedGroup?.id === group._id 
                        ? `${group.color}15` 
                        : 'transparent',
                      border: selectedGroup?.id === group._id 
                        ? `1px solid ${group.color}40` 
                        : '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: group.color }}>
                        {ICON_MAP[group.icon] || <FolderOutlined />}
                      </span>
                      <span style={{ color: 'var(--text-primary)' }}>{group.name}</span>
                      <Badge 
                        count={group.documentCount} 
                        size="small"
                        style={{ backgroundColor: group.color }}
                      />
                      {group.type === 'ai' && (
                        <Tag 
                          color="purple" 
                          style={{ fontSize: 10, padding: '0 4px', marginLeft: 4 }}
                        >
                          AI
                        </Tag>
                      )}
                    </div>
                    <Tooltip title="删除分组">
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => handleDeleteGroup(group._id, e)}
                        style={{ 
                          color: 'var(--text-tertiary)',
                          opacity: 0.6
                        }}
                      />
                    </Tooltip>
                  </motion.div>
                )}
              />
            </div>
          )}

          {/* AI自然语言创建 */}
          <div style={{ 
            borderTop: '1px solid var(--border-primary)', 
            paddingTop: 16 
          }}>
            <div style={{ 
              fontSize: 12, 
              color: 'var(--text-tertiary)', 
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <RobotOutlined style={{ color: '#00d4ff' }} />
              AI智能筛选
            </div>
            <Input.Search
              placeholder="输入自然语言条件，如：2020年后的深度学习文献"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              onSearch={handleNLSearch}
              enterButton={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  loading={creating}
                >
                  创建
                </Button>
              }
              style={{ marginBottom: 8 }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              示例：近三年的机器学习论文 / 评分4分以上的重点文献 / 包含"神经网络"关键词的文章
            </div>
          </div>
        </Spin>
      </Card>
    </motion.div>
  );
};

export default SmartGroupPanel;

