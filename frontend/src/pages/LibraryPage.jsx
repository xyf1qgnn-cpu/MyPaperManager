import React, { useState, useEffect } from 'react';
import { Upload, Modal, Form, Input, message, Spin, Button, Alert, Tabs, Tooltip, Select } from 'antd';
import { 
  InboxOutlined, 
  CheckCircleOutlined, 
  CloudUploadOutlined, 
  FileTextOutlined,
  FolderOutlined,
  EditOutlined,
  PlusOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { parsePdfMetadata, createDocument, getDocuments, toggleFavorite, deleteDocument } from '../services/documentService';
import { getCollections, getCollectionDocuments, moveDocument, renameDocument } from '../services/collectionService';
import DocumentList from '../components/DocumentList';
import CollectionTree from '../components/CollectionTree';
import { useBreakpoint } from '../hooks/useBreakpoint';

const { Dragger } = Upload;
const { TextArea } = Input;

const LibraryPage = () => {
  const { isMobile } = useBreakpoint();
  const [documents, setDocuments] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [uploadFilename, setUploadFilename] = useState(null);
  const [currentFilePath, setCurrentFilePath] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('root');
  const [activeTab, setActiveTab] = useState('documents');

  // 重命名模态框
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renamingDoc, setRenamingDoc] = useState(null);
  const [renameTemplate, setRenameTemplate] = useState('[Year] [Author] - [Title]');
  
  // 上传区域展开状态
  const [uploadExpanded, setUploadExpanded] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchCollections();
  }, [selectedCollection]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let data;
      if (selectedCollection === 'root') {
        data = await getDocuments();
      } else {
        const response = await getCollectionDocuments(selectedCollection);
        data = response.data || response;
      }
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await getCollections();
      setCollections(response.data || response || []);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    }
  };

  const handleCustomRequest = async ({ file, onSuccess, onError }) => {
    setParsing(true);
    setUploadFilename(null);
    setCurrentFilePath('');

    try {
      const response = await parsePdfMetadata(file);
      const { path, metadata, originalName, filename } = response;

      setCurrentFilePath(path);
      setUploadFilename(filename);

      form.setFieldsValue({
        title: metadata?.title || originalName.replace('.pdf', ''),
        authors: Array.isArray(metadata?.authors) ? metadata.authors.join(', ') : (metadata?.authors || ''),
        abstract: metadata?.summary || metadata?.abstract || '',
        collectionId: selectedCollection !== 'root' ? selectedCollection : null,
      });

      setIsModalVisible(true);
      onSuccess('Parsed successfully');
      message.success('智能解析成功，请确认信息');
    } catch (error) {
      console.error('Parse error:', error);
      onError(error);
      message.error('智能解析失败，请重试');
    } finally {
      setParsing(false);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (!uploadFilename) {
        message.error('文件信息丢失，请重新上传 PDF');
        return;
      }

      setSubmitting(true);

      const authorsList = values.authors.split(/[,，]/).map(a => a.trim()).filter(Boolean);
      
      const docData = {
        title: values.title,
        authors: authorsList,
        abstract: values.abstract,
        fileUrl: currentFilePath,
        filename: uploadFilename,
        collectionId: values.collectionId || null,
      };

      await createDocument(docData);
      message.success('文献入库成功');
      
      setIsModalVisible(false);
      form.resetFields();
      setUploadFilename(null);
      setCurrentFilePath('');
      fetchDocuments();

    } catch (error) {
      console.error('Submission failed:', error);
      if (!error.errorFields) {
        message.error('入库失败: ' + (error.message || '未知错误'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setUploadFilename(null);
    setCurrentFilePath('');
  };

  const handleToggleFavorite = async (id) => {
    try {
      await toggleFavorite(id);
      message.success('操作成功');
      fetchDocuments();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      message.success('删除成功');
      fetchDocuments();
    } catch (error) {
      console.error('Delete failed:', error);
      message.error('删除失败');
    }
  };

  // 重命名文档
  const handleRename = async () => {
    if (!renamingDoc) return;
    try {
      await renameDocument(renamingDoc._id, renameTemplate);
      message.success('重命名成功');
      setRenameModalVisible(false);
      setRenamingDoc(null);
      fetchDocuments();
    } catch (error) {
      message.error('重命名失败');
    }
  };

  const openRenameModal = (doc) => {
    setRenamingDoc(doc);
    setRenameTemplate(doc.filenameTemplate || '[Year] [Author] - [Title]');
    setRenameModalVisible(true);
  };

  // 将目录树转换为 Select 选项
  const flattenCollections = (items, level = 0) => {
    let result = [];
    for (const item of items) {
      result.push({
        value: item._id,
        label: '　'.repeat(level) + item.name,
      });
      if (item.children?.length > 0) {
        result = result.concat(flattenCollections(item.children, level + 1));
      }
    }
    return result;
  };

  const collectionOptions = [
    { value: '', label: '根目录' },
    ...flattenCollections(collections),
  ];

  return (
    <div style={{ display: 'flex', gap: 24, height: '100%', minHeight: 0 }}>
      {/* 左侧目录树 - PC端显示 */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            width: 260,
            flexShrink: 0,
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 12,
            border: '1px solid var(--border-primary)',
            overflow: 'hidden',
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CollectionTree
            selectedKey={selectedCollection}
            onSelect={setSelectedCollection}
            onDocumentsChange={fetchDocuments}
            style={{ height: '100%', flex: 1, minHeight: 0 }}
          />
        </motion.div>
      )}

      {/* 右侧主内容 */}
      <div style={{ 
        flex: 1, 
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}>
        {/* 移动端目录选择器 */}
        {isMobile && (
          <div style={{ marginBottom: 16 }}>
            <Select
              value={selectedCollection}
              onChange={setSelectedCollection}
              style={{ width: '100%' }}
              options={[
                { value: 'root', label: '全部文献' },
                ...flattenCollections(collections),
              ]}
            />
          </div>
        )}

        {/* 上传区域 - 可折叠小组件 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 24 }}
        >
          {/* 折叠状态：紧凑按钮 */}
          <AnimatePresence mode="wait">
            {!uploadExpanded ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUploadExpanded(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    padding: '14px 24px',
                    background: 'linear-gradient(145deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%)',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
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
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlusOutlined style={{ fontSize: 16, color: '#0a0f1a' }} />
                  </motion.div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    上传 PDF 文献
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    点击展开上传区域
                  </span>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* 收起按钮 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="text"
                      size="small"
                      icon={<UpOutlined />}
                      onClick={() => setUploadExpanded(false)}
                      style={{ color: 'var(--text-tertiary)', fontSize: 12 }}
                    >
                      收起
                    </Button>
                  </motion.div>
                </div>
                
                {/* 展开状态：完整上传区域 */}
                <Dragger
                  customRequest={handleCustomRequest}
                  showUploadList={false}
                  accept=".pdf"
                  style={{ background: 'transparent', border: 'none', padding: 0 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    style={{
                      background: 'linear-gradient(145deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 255, 136, 0.03) 100%)',
                      border: '2px dashed rgba(0, 212, 255, 0.3)',
                      borderRadius: 16,
                      padding: '32px 24px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    className="upload-zone"
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      {parsing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Spin size="large" />
                        </motion.div>
                      ) : (
                        <motion.div
                          animate={{
                            y: [0, -8, 0],
                            boxShadow: [
                              '0 0 15px rgba(0, 212, 255, 0.3)',
                              '0 0 30px rgba(0, 212, 255, 0.5)',
                              '0 0 15px rgba(0, 212, 255, 0.3)',
                            ],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 16,
                            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 255, 136, 0.2) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CloudUploadOutlined style={{ fontSize: 28, color: '#00d4ff' }} />
                        </motion.div>
                      )}
                      
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                          {parsing ? 'AI 正在智能解析...' : '点击或拖拽 PDF 文件到此区域'}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>
                          {parsing ? '正在提取元数据、摘要等信息' : '系统将自动调用 AI 解析 PDF 元数据'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </Dragger>
              </motion.div>
            )}
          </AnimatePresence>

          {uploadFilename && !isModalVisible && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Alert 
                message={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircleOutlined style={{ color: '#00ff88' }} />文件已就绪</span>}
                description={`已上传: ${uploadFilename}`}
                type="success" 
                showIcon={false}
                style={{ marginTop: 12, background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: 12 }}
                action={<Button size="small" type="primary" onClick={() => setIsModalVisible(true)} style={{ borderRadius: 6 }}>继续入库</Button>}
              />
            </motion.div>
          )}
        </motion.div>

        {/* 文献列表 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexShrink: 0 }}>
            <motion.div
              animate={{ boxShadow: ['0 0 10px rgba(0, 212, 255, 0.3)', '0 0 20px rgba(0, 212, 255, 0.5)', '0 0 10px rgba(0, 212, 255, 0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {selectedCollection === 'root' ? (
                <FileTextOutlined style={{ fontSize: 18, color: '#0a0f1a' }} />
              ) : (
                <FolderOutlined style={{ fontSize: 18, color: '#0a0f1a' }} />
              )}
            </motion.div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedCollection === 'root' ? '全部文献' : '当前目录'}
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-tertiary)' }}>
                共 {documents.length} 篇文献
              </p>
            </div>
          </div>
          
          {/* 可滚动的文献列表区域 */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: 8,
            marginRight: -8,
          }} className="document-scroll-area">
            <DocumentList 
              documents={documents} 
              loading={loading} 
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDelete}
              onRename={openRenameModal}
            />
          </div>
        </motion.div>
      </div>

      {/* 确认入库模态框 */}
      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileTextOutlined style={{ color: '#00d4ff' }} />确认文献信息</div>}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={submitting}
        okText="确认入库"
        cancelText="取消"
        width={600}
        styles={{ header: { background: 'var(--bg-secondary)' }, body: { background: 'var(--bg-secondary)' }, footer: { background: 'var(--bg-secondary)' } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label={<span style={{ color: 'var(--text-primary)' }}>标题</span>} rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="文献标题" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="authors" label={<span style={{ color: 'var(--text-primary)' }}>作者</span>} rules={[{ required: true, message: '请输入作者' }]} help={<span style={{ color: 'var(--text-tertiary)' }}>多个作者请用逗号分隔</span>}>
            <Input placeholder="例如: Author A, Author B" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="abstract" label={<span style={{ color: 'var(--text-primary)' }}>摘要</span>}>
            <TextArea rows={4} placeholder="文献摘要" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="collectionId" label={<span style={{ color: 'var(--text-primary)' }}>保存到目录</span>}>
            <Select options={collectionOptions} placeholder="选择目录（默认根目录）" allowClear style={{ borderRadius: 8 }} />
          </Form.Item>
          {uploadFilename && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16, padding: 12, background: 'rgba(0, 255, 136, 0.1)', borderRadius: 8, border: '1px solid rgba(0, 255, 136, 0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircleOutlined style={{ color: '#00ff88' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>关联文件: {uploadFilename}</span>
            </motion.div>
          )}
        </Form>
      </Modal>

      {/* 重命名模态框 */}
      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><EditOutlined style={{ color: '#00d4ff' }} />自动重命名</div>}
        open={renameModalVisible}
        onOk={handleRename}
        onCancel={() => { setRenameModalVisible(false); setRenamingDoc(null); }}
        okText="重命名"
        cancelText="取消"
        styles={{ header: { background: 'var(--bg-secondary)' }, body: { background: 'var(--bg-secondary)' }, footer: { background: 'var(--bg-secondary)' } }}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>当前文件: {renamingDoc?.filename}</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>使用模板自动生成规范化文件名</p>
        </div>
        <Input
          value={renameTemplate}
          onChange={(e) => setRenameTemplate(e.target.value)}
          placeholder="文件名模板"
          style={{ borderRadius: 8, marginBottom: 12 }}
        />
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          可用变量: [Year], [Author], [Title]
        </div>
        {renamingDoc && (
          <div style={{ marginTop: 12, padding: 12, background: 'rgba(0, 212, 255, 0.1)', borderRadius: 8 }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>预览:</div>
            <div style={{ color: '#00d4ff' }}>
              {renameTemplate
                .replace('[Year]', renamingDoc.year || 'Unknown')
                .replace('[Author]', renamingDoc.authors?.[0] || 'Unknown')
                .replace('[Title]', renamingDoc.title || 'Untitled')}.pdf
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .upload-zone:hover { border-color: rgba(0, 212, 255, 0.6) !important; box-shadow: 0 0 30px rgba(0, 212, 255, 0.2); }
        .ant-upload-drag { border: none !important; background: transparent !important; }
        
        /* 自定义滚动条样式 */
        .document-scroll-area::-webkit-scrollbar {
          width: 6px;
        }
        .document-scroll-area::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 3px;
        }
        .document-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.3);
          border-radius: 3px;
          transition: background 0.3s;
        }
        .document-scroll-area::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default LibraryPage;
