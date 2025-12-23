import React, { useState, useEffect } from 'react';
import { Tree, Dropdown, Modal, Form, Input, Button, message, Empty, ColorPicker } from 'antd';
import {
  FolderOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DragOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  moveCollection,
} from '../services/collectionService';

const CollectionTree = ({ 
  selectedKey, 
  onSelect, 
  onDocumentsChange,
  style 
}) => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [form] = Form.useForm();

  // 加载目录数据
  const fetchCollections = async () => {
    setLoading(true);
    try {
      const response = await getCollections();
      const collections = response.data || response;
      
      // 转换为 Ant Design Tree 格式
      const convertToTreeData = (items) => {
        return items.map(item => ({
          key: item._id,
          title: item.name,
          icon: item.children?.length > 0 ? <FolderOpenOutlined /> : <FolderOutlined />,
          color: item.color,
          children: item.children ? convertToTreeData(item.children) : [],
          isLeaf: !item.children || item.children.length === 0,
          raw: item,
        }));
      };

      // 添加根目录
      const rootNode = {
        key: 'root',
        title: '全部文献',
        icon: <HomeOutlined style={{ color: '#00d4ff' }} />,
        children: convertToTreeData(collections),
        selectable: true,
      };

      setTreeData([rootNode]);
    } catch (error) {
      console.error('获取目录失败:', error);
      message.error('获取目录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // 创建/编辑目录
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const colorValue = typeof values.color === 'string' 
        ? values.color 
        : values.color?.toHexString?.() || '#00d4ff';

      if (editingCollection) {
        await updateCollection(editingCollection._id, {
          name: values.name,
          color: colorValue,
          description: values.description,
        });
        message.success('目录更新成功');
      } else {
        await createCollection({
          name: values.name,
          parentId: values.parentId || null,
          color: colorValue,
          description: values.description,
        });
        message.success('目录创建成功');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingCollection(null);
      fetchCollections();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('操作失败');
    }
  };

  // 删除目录
  const handleDelete = async (collection) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除「${collection.name}」目录吗？目录下的文档将移至根目录。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteCollection(collection._id);
          message.success('目录已删除');
          fetchCollections();
          if (selectedKey === collection._id) {
            onSelect?.('root');
          }
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      },
    });
  };

  // 打开编辑模态框
  const openEditModal = (collection) => {
    setEditingCollection(collection);
    form.setFieldsValue({
      name: collection.name,
      color: collection.color,
      description: collection.description,
    });
    setModalVisible(true);
  };

  // 打开新建模态框
  const openCreateModal = (parentId = null) => {
    setEditingCollection(null);
    form.resetFields();
    form.setFieldsValue({ parentId, color: '#00d4ff' });
    setModalVisible(true);
  };

  // 右键菜单
  const getContextMenu = (node) => ({
    items: [
      {
        key: 'add',
        label: '新建子目录',
        icon: <PlusOutlined />,
        onClick: () => openCreateModal(node.key === 'root' ? null : node.key),
      },
      ...(node.key !== 'root' ? [
        {
          key: 'edit',
          label: '重命名',
          icon: <EditOutlined />,
          onClick: () => openEditModal(node.raw),
        },
        {
          key: 'delete',
          label: '删除',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => handleDelete(node.raw),
        },
      ] : []),
    ],
  });

  // 拖拽处理
  const handleDrop = async (info) => {
    const dragKey = info.dragNode.key;
    const dropKey = info.node.key;

    if (dragKey === 'root') return;

    try {
      const targetParentId = dropKey === 'root' ? null : dropKey;
      await moveCollection(dragKey, targetParentId);
      message.success('移动成功');
      fetchCollections();
    } catch (error) {
      console.error('移动失败:', error);
      message.error('移动失败');
    }
  };

  // 渲染标题
  const renderTitle = (node) => (
    <Dropdown menu={getContextMenu(node)} trigger={['contextMenu']}>
      <motion.div
        whileHover={{ x: 4 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 0',
          color: selectedKey === node.key ? '#00d4ff' : 'var(--text-primary)',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: node.color || '#00d4ff',
            boxShadow: `0 0 6px ${node.color || '#00d4ff'}`,
          }}
        />
        <span style={{ flex: 1 }}>{node.title}</span>
      </motion.div>
    </Dropdown>
  );

  return (
    <div style={style}>
      {/* 顶部操作栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-primary)',
      }}>
        <span style={{ 
          fontSize: 14, 
          fontWeight: 600, 
          color: 'var(--text-primary)' 
        }}>
          目录
        </span>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => openCreateModal()}
            style={{ color: '#00d4ff' }}
          />
        </motion.div>
      </div>

      {/* 目录树 */}
      <div style={{ 
        padding: '8px 12px', 
        height: 'calc(100% - 50px)', 
        overflowY: 'auto' 
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-tertiary)' }}>
            加载中...
          </div>
        ) : treeData.length === 0 ? (
          <Empty 
            description="暂无目录" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ marginTop: 40 }}
          />
        ) : (
          <Tree
            treeData={treeData}
            selectedKeys={[selectedKey || 'root']}
            onSelect={(keys) => onSelect?.(keys[0] || 'root')}
            titleRender={renderTitle}
            draggable={{ icon: <DragOutlined style={{ color: 'var(--text-tertiary)' }} /> }}
            onDrop={handleDrop}
            blockNode
            showIcon
            defaultExpandAll
            style={{
              background: 'transparent',
              color: 'var(--text-primary)',
            }}
          />
        )}
      </div>

      {/* 创建/编辑模态框 */}
      <Modal
        title={editingCollection ? '编辑目录' : '新建目录'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          setEditingCollection(null);
          form.resetFields();
        }}
        okText="保存"
        cancelText="取消"
        styles={{
          header: { background: 'var(--bg-secondary)' },
          body: { background: 'var(--bg-secondary)' },
          footer: { background: 'var(--bg-secondary)' },
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="parentId" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item
            name="name"
            label={<span style={{ color: 'var(--text-primary)' }}>目录名称</span>}
            rules={[{ required: true, message: '请输入目录名称' }]}
          >
            <Input placeholder="输入目录名称" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Form.Item
            name="color"
            label={<span style={{ color: 'var(--text-primary)' }}>目录颜色</span>}
            initialValue="#00d4ff"
          >
            <ColorPicker 
              presets={[
                {
                  label: '推荐颜色',
                  colors: [
                    '#00d4ff', '#00ff88', '#ff6b35', '#ff4757',
                    '#a55eea', '#26de81', '#fed330', '#fd79a8',
                  ],
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span style={{ color: 'var(--text-primary)' }}>描述</span>}
          >
            <Input.TextArea 
              placeholder="可选：添加目录描述" 
              rows={3} 
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 样式覆盖 */}
      <style>{`
        .ant-tree {
          background: transparent !important;
          padding: 0 4px;
        }
        .ant-tree-treenode {
          padding: 2px 0 !important;
          width: 100%;
        }
        .ant-tree-node-content-wrapper {
          color: var(--text-secondary) !important;
          transition: all 0.2s;
          border-radius: 8px !important;
          padding: 4px 8px !important;
          margin: 0 auto;
        }
        .ant-tree-node-content-wrapper:hover {
          background: rgba(0, 212, 255, 0.1) !important;
        }
        .ant-tree-node-selected .ant-tree-node-content-wrapper {
          background: rgba(0, 212, 255, 0.15) !important;
          color: #00d4ff !important;
        }
        .ant-tree-switcher {
          color: var(--text-tertiary) !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ant-tree-draggable-icon {
          opacity: 0.5;
        }
        .ant-tree-treenode:hover .ant-tree-draggable-icon {
          opacity: 1;
        }
        .ant-tree-indent-unit {
          width: 16px !important;
        }
      `}</style>
    </div>
  );
};

export default CollectionTree;
