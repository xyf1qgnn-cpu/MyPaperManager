import React, { useState, useEffect } from 'react';
import { Upload, Modal, Form, Input, Card, message, Spin, Empty, Button, Tag, Alert } from 'antd';
import { InboxOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { parsePdfMetadata, createDocument, getDocuments, toggleFavorite, deleteDocument } from '../services/documentService';
import DocumentList from '../components/DocumentList';

const { Dragger } = Upload;
const { TextArea } = Input;

const LibraryPage = () => {
  // --- State Definitions ---
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal & Form State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // File State (Critical for Upload)
  const [uploadFilename, setUploadFilename] = useState(null); // The filename returned by backend
  const [currentFilePath, setCurrentFilePath] = useState(''); // The full path returned by backend

  // --- Effects ---
  useEffect(() => {
    fetchDocuments();
  }, []);

  // --- Actions ---
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRequest = async ({ file, onSuccess, onError }) => {
    setParsing(true);
    setUploadFilename(null); // Reset previous upload
    setCurrentFilePath('');

    try {
      // 1. Parse PDF
      const response = await parsePdfMetadata(file);
      // Expected response: { filename, originalName, path, metadata: { ... } }
      const { path, metadata, originalName, filename } = response;

      // 2. Save critical file info to state
      setCurrentFilePath(path);
      setUploadFilename(filename); // Store filename for later submission

      // 3. Pre-fill form
      form.setFieldsValue({
        title: metadata?.title || originalName.replace('.pdf', ''),
        authors: Array.isArray(metadata?.authors) ? metadata.authors.join(', ') : (metadata?.authors || ''),
        abstract: metadata?.summary || metadata?.abstract || ''
      });

      // 4. Show confirmation modal
      setIsModalVisible(true);
      onSuccess('Parsed successfully');
      message.success('解析成功，请确认信息');
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
      // 1. Validate Form
      const values = await form.validateFields();
      
      // 2. Validate File State
      if (!uploadFilename) {
        message.error('文件信息丢失，请重新上传 PDF');
        return;
      }

      setSubmitting(true);

      // 3. Prepare Data
      const authorsList = values.authors.split(/[,，]/).map(a => a.trim()).filter(Boolean);
      
      const docData = {
        title: values.title,
        authors: authorsList,
        abstract: values.abstract,
        fileUrl: currentFilePath,
        filename: uploadFilename, // Critical field
      };

      console.log('Submitting Document:', docData);

      // 4. Submit to Backend
      await createDocument(docData);
      
      message.success('文献入库成功');
      
      // 5. Cleanup & Refresh
      setIsModalVisible(false);
      form.resetFields();
      setUploadFilename(null);
      setCurrentFilePath('');
      fetchDocuments();

    } catch (error) {
      console.error('Submission failed:', error);
      if (!error.errorFields) { // Ignore form validation errors in console
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

  // Delete function (Critical for cleaning up bad data)
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

  return (
    <div>
      {/* Upload Area */}
      <div style={{ marginBottom: 24 }}>
        <Dragger
          customRequest={handleCustomRequest}
          showUploadList={false}
          accept=".pdf"
          style={{ 
            background: '#fafafa', 
            border: '1px dashed #d9d9d9',
            borderRadius: 8,
            padding: 20
          }}
          height={150}
        >
          <div className="ant-upload-drag-icon">
            {parsing ? <Spin /> : <InboxOutlined style={{ color: '#1677ff' }} />}
          </div>
          <p className="ant-upload-text">点击或拖拽 PDF 文件到此区域</p>
          <div className="ant-upload-hint">
            {parsing ? '正在进行智能解析，请稍候...' : '系统将自动调用 AI 解析 PDF 元数据，确认后入库'}
          </div>
        </Dragger>

        {/* File Ready Indicator */}
        {uploadFilename && !isModalVisible && (
           <Alert 
             message="文件已就绪" 
             description={`已上传: ${uploadFilename}，请点击下方按钮入库。`} 
             type="success" 
             showIcon 
             style={{ marginTop: 16 }}
             action={
               <Button size="small" type="primary" onClick={() => setIsModalVisible(true)}>
                 继续入库
               </Button>
             }
           />
        )}
      </div>

      {/* Document List */}
      <Card title="文献列表" variant="borderless">
        <DocumentList 
          documents={documents} 
          loading={loading} 
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete}
        />
      </Card>

      {/* Confirmation Modal */}
      <Modal
        title="确认文献信息"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={submitting}
        okText="确认入库"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="文献标题" />
          </Form.Item>
          <Form.Item
            name="authors"
            label="作者"
            rules={[{ required: true, message: '请输入作者' }]}
            help="多个作者请用逗号分隔"
          >
            <Input placeholder="例如: Author A, Author B" />
          </Form.Item>
          <Form.Item
            name="abstract"
            label="摘要"
          >
            <TextArea rows={6} placeholder="文献摘要" />
          </Form.Item>
          
          {/* Debug Info for User */}
          {uploadFilename && (
             <div style={{ marginTop: 10, color: '#52c41a', fontSize: '12px' }}>
               <CheckCircleOutlined /> 关联文件: {uploadFilename}
             </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default LibraryPage;
