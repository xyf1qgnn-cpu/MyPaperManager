import React, { useState, useEffect } from 'react';
import { Modal, Radio, Button, Space, Alert, Spin, message, Tabs, Input, Checkbox } from 'antd';
import {
  DownloadOutlined,
  CopyOutlined,
  FileTextOutlined,
  CodeOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { previewExport, exportBatch, exportFavorites, exportAll, downloadFile, EXPORT_FORMATS } from '../services/exportService';

const { TextArea } = Input;

const ExportModal = ({ open, onCancel, selectedIds = [], mode = 'selected' }) => {
  const [format, setFormat] = useState('bibtex');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [includeAbstract, setIncludeAbstract] = useState(true);

  useEffect(() => {
    if (open) {
      loadPreview();
    }
  }, [open, format, selectedIds]);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const result = await previewExport(selectedIds, format);
      setPreview(result.content);
    } catch (error) {
      setPreview('预览加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      let blob;
      let filename;

      if (mode === 'all') {
        const response = await exportAll(format);
        blob = response;
        filename = `all_references${EXPORT_FORMATS.find(f => f.key === format)?.ext || '.txt'}`;
      } else if (mode === 'favorites') {
        const response = await exportFavorites(format);
        blob = response;
        filename = `favorites${EXPORT_FORMATS.find(f => f.key === format)?.ext || '.txt'}`;
      } else {
        const response = await exportBatch(selectedIds, format);
        blob = response;
        filename = `references${EXPORT_FORMATS.find(f => f.key === format)?.ext || '.txt'}`;
      }

      downloadFile(blob, filename);
      message.success('导出成功');
      onCancel();
    } catch (error) {
      message.error('导出失败: ' + (error.message || '未知错误'));
    } finally {
      setExporting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(preview);
      message.success('已复制到剪贴板');
    } catch (error) {
      message.error('复制失败');
    }
  };

  const getTitle = () => {
    if (mode === 'all') return '导出全部文献';
    if (mode === 'favorites') return '导出收藏夹';
    return `导出文献 (${selectedIds.length} 篇)`;
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DownloadOutlined style={{ color: '#00d4ff' }} />
          {getTitle()}
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="copy"
          icon={<CopyOutlined />}
          onClick={handleCopy}
          disabled={loading || !preview}
        >
          复制内容
        </Button>,
        <Button
          key="export"
          type="primary"
          icon={<DownloadOutlined />}
          loading={exporting}
          onClick={handleExport}
        >
          下载文件
        </Button>
      ]}
      styles={{
        header: { background: 'var(--bg-secondary)' },
        body: { background: 'var(--bg-secondary)', padding: '16px 24px' },
        footer: { background: 'var(--bg-secondary)' }
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        {/* 格式选择 */}
        <div>
          <div style={{ 
            fontSize: 13, 
            color: 'var(--text-secondary)', 
            marginBottom: 8 
          }}>
            选择导出格式
          </div>
          <Radio.Group 
            value={format} 
            onChange={(e) => setFormat(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {EXPORT_FORMATS.map((f) => (
                <motion.div
                  key={f.key}
                  whileHover={{ x: 4 }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: format === f.key 
                      ? '1px solid rgba(0, 212, 255, 0.5)' 
                      : '1px solid var(--border-primary)',
                    background: format === f.key 
                      ? 'rgba(0, 212, 255, 0.1)' 
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setFormat(f.key)}
                >
                  <Radio value={f.key}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: format === f.key 
                          ? 'linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {f.key === 'bibtex' && <CodeOutlined style={{ color: format === f.key ? '#0a0f1a' : '#00d4ff' }} />}
                        {f.key === 'ris' && <FileTextOutlined style={{ color: format === f.key ? '#0a0f1a' : '#00d4ff' }} />}
                        {f.key === 'gbt7714' && <GlobalOutlined style={{ color: format === f.key ? '#0a0f1a' : '#00d4ff' }} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {f.label}
                          <span style={{ 
                            fontSize: 11, 
                            color: 'var(--text-tertiary)', 
                            marginLeft: 8 
                          }}>
                            ({f.ext})
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                          {f.description}
                        </div>
                      </div>
                    </div>
                  </Radio>
                </motion.div>
              ))}
            </Space>
          </Radio.Group>
        </div>

        {/* 预览 */}
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 8 
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              预览
            </span>
            {!loading && preview && (
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                {preview.split('\n').length} 行
              </span>
            )}
          </div>
          <Spin spinning={loading}>
            <TextArea
              value={preview}
              readOnly
              rows={10}
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-primary)',
                borderRadius: 8,
                color: 'var(--text-secondary)'
              }}
              placeholder="预览将在此显示..."
            />
          </Spin>
        </div>

        {/* 提示 */}
        <Alert
          type="info"
          showIcon
          message={
            format === 'bibtex' 
              ? '适用于 LaTeX、Overleaf 等编辑器'
              : format === 'ris'
              ? '适用于 EndNote、Zotero、Mendeley 等文献管理软件'
              : '适用于中文论文撰写，符合中国国家标准'
          }
          style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: 8
          }}
        />
      </Space>
    </Modal>
  );
};

export default ExportModal;

