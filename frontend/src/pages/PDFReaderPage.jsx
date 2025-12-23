import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, List, Typography, Button, message, Empty, Tabs, Card, Tooltip, Drawer } from 'antd';
import { 
  ArrowLeftOutlined, 
  HighlightOutlined, 
  TranslationOutlined, 
  FileTextOutlined, 
  DeleteOutlined, 
  UndoOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined,
  BookOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons';
import { PdfLoader, PdfHighlighter, Highlight, Popup, AreaHighlight } from 'react-pdf-highlighter';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';

// Import Services
import { getDocumentById } from '../services/documentService';
import { saveAnnotation, getAnnotations, deleteAnnotation } from '../services/annotationService';
import { translateText, getDocSummary } from '../services/aiService';
import { useBreakpoint, useSidebarWidth } from '../hooks/useBreakpoint';

// Core Config: Local Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;

const { Title, Text, Paragraph } = Typography;

// --- Constants ---
const HIGHLIGHT_COLOR = 'rgba(255, 235, 59, 0.4)';
const NOTE_COLOR = 'rgba(0, 212, 255, 0.3)';

// --- Components ---
const ViewerTip = ({ onConfirm, onTranslate }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ 
        background: 'rgba(26, 35, 50, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderRadius: 12, 
        padding: 8, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 20px rgba(0,212,255,0.2)', 
        display: 'flex', 
        gap: 4,
        border: '1px solid rgba(0, 212, 255, 0.2)',
      }}
    >
      <Tooltip title="高亮">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button 
            type="text" 
            icon={<HighlightOutlined style={{ color: '#ffeb3b', fontSize: 18 }} />} 
            onClick={() => onConfirm({ text: '', emoji: '' }, 'highlight')}
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 10,
              background: 'rgba(255, 235, 59, 0.1)',
            }}
          />
        </motion.div>
      </Tooltip>
      <Tooltip title="笔记">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button 
            type="text" 
            icon={<FileTextOutlined style={{ color: '#00d4ff', fontSize: 18 }} />} 
            onClick={() => onConfirm({ text: '', emoji: '' }, 'note')}
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 10,
              background: 'rgba(0, 212, 255, 0.1)',
            }}
          />
        </motion.div>
      </Tooltip>
      <Tooltip title="AI 翻译">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button 
            type="text" 
            icon={<TranslationOutlined style={{ color: '#00ff88', fontSize: 18 }} />} 
            onClick={onTranslate}
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 10,
              background: 'rgba(0, 255, 136, 0.1)',
            }}
          />
        </motion.div>
      </Tooltip>
    </motion.div>
  );
};

const HighlightPopup = ({ comment, onDelete }) => (
  <motion.div 
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 8,
      background: 'rgba(26, 35, 50, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '8px 12px',
      borderRadius: 8,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'var(--text-primary)',
    }}
  >
    {comment.emoji} {comment.text || '点击删除'}
    <Button 
      type="text" 
      danger 
      size="small" 
      icon={<DeleteOutlined />} 
      onClick={onDelete} 
    />
  </motion.div>
);

const CustomHighlight = ({ position, onClick, onMouseOver, onMouseOut, comment, isScrolledTo, color }) => {
  const { rects, boundingRect } = position;
  return (
    <div className={`Highlight ${isScrolledTo ? "Highlight--scrolledTo" : ""}`}>
      {rects.map((rect, index) => (
        <div
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          onClick={onClick}
          key={index}
          style={{ 
            ...rect, 
            background: color, 
            opacity: 1, 
            mixBlendMode: 'multiply',
            borderRadius: 2,
          }}
          className="Highlight__part"
        />
      ))}
    </div>
  );
};

// 拖拽手柄组件
const ResizeHandle = () => (
  <PanelResizeHandle style={{ width: 8, position: 'relative' }}>
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, transparent, rgba(0, 212, 255, 0.3), transparent)',
        cursor: 'col-resize',
        transition: 'background 0.2s',
      }}
      whileHover={{
        background: 'linear-gradient(180deg, transparent, rgba(0, 212, 255, 0.6), transparent)',
      }}
    />
  </PanelResizeHandle>
);

const PDFReaderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [highlights, setHighlights] = useState([]);
  const [activeTab, setActiveTab] = useState('notes');
  const [translateResult, setTranslateResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [darkReadingMode, setDarkReadingMode] = useState(true); // 深色阅读模式，默认开启
  
  const scrollViewerTo = useRef(null);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doc, annotations] = await Promise.all([
          getDocumentById(id),
          getAnnotations(id)
        ]);
        setDocument(doc);
        setHighlights(annotations);
      } catch (error) {
        console.error(error);
        message.error('加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Actions
  const addHighlight = async (highlight, type = 'highlight') => {
    const newHighlight = {
      ...highlight,
      id: crypto.randomUUID(),
      type,
      documentId: id,
      comment: { ...highlight.comment, text: type === 'note' ? '添加了笔记' : '' }
    };
    setHighlights([newHighlight, ...highlights]);
    try { await saveAnnotation(newHighlight); } catch (error) { console.error(error); }
  };

  const removeHighlight = async (highlightId) => {
    const originalHighlights = [...highlights];
    setHighlights(highlights.filter(h => h.id !== highlightId));
    try {
      await deleteAnnotation(highlightId);
      message.success('已删除');
    } catch (error) {
      setHighlights(originalHighlights);
    }
  };

  const handleUndo = useCallback(async () => {
    if (highlights.length === 0) return;
    const lastHighlight = highlights[0];
    await removeHighlight(lastHighlight.id);
    message.info('撤销成功');
  }, [highlights]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  const handleSummarize = async () => {
    if (summary) return;
    setIsSummarizing(true);
    try {
      const res = await getDocSummary(id);
      setSummary(res.summary);
    } catch (error) { message.error('摘要生成失败'); }
    finally { setIsSummarizing(false); }
  };

  const handleTranslate = async (content) => {
    const text = content.text; if (!text) return;
    setActiveTab('ai'); 
    setIsTranslating(true); 
    setTranslateResult(null);
    if (isMobile) setMobileDrawerOpen(true);
    try {
      const res = await translateText(text);
      setTranslateResult({ original: text, translation: res.translation });
    } catch (error) { message.error('翻译失败'); }
    finally { setIsTranslating(false); }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--bg-primary)',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Spin size="large" />
        </motion.div>
      </div>
    );
  }

  if (!document || !document.pdfUrl) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--bg-primary)',
      }}>
        <Empty description={<span style={{ color: 'var(--text-tertiary)' }}>未找到文档</span>} />
      </div>
    );
  }

  const pdfUrl = document.pdfUrl;

  // 侧边栏内容
  const SidebarContent = ({ darkMode = true }) => (
    <Tabs 
      activeKey={activeTab} 
      onChange={setActiveTab} 
      centered
      style={{ height: '100%' }}
      items={[
        {
          key: 'notes',
          label: (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: darkMode ? 'inherit' : '#333' }}>
              <BookOutlined />
              标注
            </span>
          ),
          children: (
            <div style={{ 
              height: 'calc(100vh - 170px)', 
              overflowY: 'auto', 
              padding: '0 12px',
            }}>
              {highlights.length === 0 ? (
                <Empty 
                  description={<span style={{ color: darkMode ? 'var(--text-tertiary)' : '#999' }}>暂无标注</span>}
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  style={{ marginTop: 40 }}
                />
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } },
                  }}
                >
                  <List 
                    dataSource={highlights} 
                    renderItem={(item, index) => (
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, x: 20 },
                          visible: { opacity: 1, x: 0 },
                        }}
                      >
                        <List.Item style={{ padding: '8px 0', border: 'none' }}>
                          <motion.div
                            whileHover={{ scale: 1.02, x: 4 }}
                            style={{
                              width: '100%',
                              background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                              borderRadius: 10,
                              padding: 12,
                              borderLeft: `3px solid ${item.type === 'note' ? '#00d4ff' : '#ffeb3b'}`,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <blockquote style={{ 
                                margin: 0, 
                                padding: 0, 
                                color: darkMode ? 'var(--text-secondary)' : '#555', 
                                fontSize: 13,
                                flex: 1,
                                lineHeight: 1.6,
                              }}>
                                "{item.content.text?.slice(0, 100)}{item.content.text?.length > 100 ? '...' : ''}"
                              </blockquote>
                              <Button 
                                type="text" 
                                danger 
                                size="small" 
                                icon={<DeleteOutlined />} 
                                onClick={() => removeHighlight(item.id)} 
                                style={{ marginLeft: 8 }}
                              />
                            </div>
                          </motion.div>
                        </List.Item>
                      </motion.div>
                    )} 
                  />
                </motion.div>
              )}
            </div>
          ),
        },
        {
          key: 'ai',
          label: (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: darkMode ? 'inherit' : '#333' }}>
              <RobotOutlined />
              AI 助手
            </span>
          ),
          children: (
            <div style={{ 
              height: 'calc(100vh - 170px)', 
              overflowY: 'auto', 
              padding: 12,
            }}>
              {/* 摘要卡片 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: darkMode ? 'rgba(0, 212, 255, 0.05)' : 'rgba(0, 212, 255, 0.08)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  marginBottom: 12,
                  color: '#00d4ff',
                  fontWeight: 600,
                }}>
                  <RobotOutlined />
                  全文摘要
                </div>
                {!summary && !isSummarizing && (
                  <Button 
                    type="primary" 
                    block 
                    onClick={handleSummarize}
                    style={{ borderRadius: 8 }}
                  >
                    生成 AI 摘要
                  </Button>
                )}
                {isSummarizing && (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Spin />
                    <div style={{ marginTop: 8, color: darkMode ? 'var(--text-tertiary)' : '#999', fontSize: 12 }}>
                      AI 正在分析文献...
                    </div>
                  </div>
                )}
                {summary && (
                  <div style={{ 
                    fontSize: 13, 
                    lineHeight: 1.8, 
                    color: darkMode ? 'var(--text-secondary)' : '#555',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {summary}
                  </div>
                )}
              </motion.div>

              {/* 翻译结果 */}
              <div style={{ 
                borderTop: darkMode ? '1px solid var(--border-primary)' : '1px solid #e0e0e0', 
                paddingTop: 16,
              }}>
                <div style={{ 
                  color: darkMode ? 'var(--text-primary)' : '#333', 
                  fontWeight: 600, 
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <TranslationOutlined style={{ color: '#00ff88' }} />
                  选中翻译
                </div>
                {isTranslating && (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Spin />
                  </div>
                )}
                {translateResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: darkMode ? 'rgba(0, 255, 136, 0.05)' : 'rgba(0, 255, 136, 0.08)',
                      border: '1px solid rgba(0, 255, 136, 0.2)',
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    <div style={{ 
                      fontSize: 12, 
                      color: darkMode ? 'var(--text-tertiary)' : '#999', 
                      marginBottom: 8 
                    }}>
                      原文
                    </div>
                    <div style={{ 
                      fontSize: 13, 
                      color: darkMode ? 'var(--text-secondary)' : '#555', 
                      marginBottom: 12,
                      padding: 8,
                      background: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: 6,
                    }}>
                      {translateResult.original}
                    </div>
                    <div style={{ 
                      fontSize: 12, 
                      color: '#00ff88', 
                      marginBottom: 8 
                    }}>
                      译文
                    </div>
                    <div style={{ 
                      fontSize: 14, 
                      color: darkMode ? 'var(--text-primary)' : '#333', 
                      lineHeight: 1.8,
                    }}>
                      {translateResult.translation}
                    </div>
                  </motion.div>
                )}
                {!isTranslating && !translateResult && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 30, 
                    color: darkMode ? 'var(--text-tertiary)' : '#999',
                    fontSize: 13,
                  }}>
                    选中 PDF 中的文本后点击翻译按钮
                  </div>
                )}
              </div>
            </div>
          ),
        },
      ]}
    />
  );

  return (
    <div style={{ 
      height: '100vh', 
      overflow: 'hidden', 
      background: darkReadingMode ? 'var(--bg-primary)' : '#fafafa',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 内部样式 */}
      <style>{`
        .PdfHighlighter { position: absolute; overflow-y: auto; height: 100%; width: 100%; }
        .PdfHighlighter .textLayer { opacity: 1; mix-blend-mode: multiply; }
        .Highlight__part { margin: -2px; padding: 2px; }
        .Highlight__popup { 
          background: rgba(26, 35, 50, 0.95); 
          backdrop-filter: blur(10px);
          border-radius: 8px; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.3); 
          padding: 8px 12px; 
          font-size: 14px; 
          color: var(--text-primary); 
          z-index: 100; 
          min-width: 120px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .ant-tabs-nav { margin-bottom: 0 !important; }
        .ant-tabs-tab { padding: 12px 16px !important; }
      `}</style>
      
      {/* 顶部导航栏 */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ 
          background: darkReadingMode ? 'rgba(26, 35, 50, 0.9)' : 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(20px)',
          borderBottom: darkReadingMode ? '1px solid var(--border-primary)' : '1px solid #e0e0e0', 
          padding: '0 20px', 
          display: 'flex', 
          alignItems: 'center', 
          height: 56,
          gap: 12,
          flexShrink: 0,
        }}
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)} 
            type="text"
            style={{ color: darkReadingMode ? 'var(--text-primary)' : '#333' }}
          />
        </motion.div>
        
        <Title 
          level={5} 
          style={{ 
            margin: 0, 
            flex: 1, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            color: darkReadingMode ? 'var(--text-primary)' : '#333',
            fontWeight: 500,
          }}
        >
          {document.title}
        </Title>
        
        <div style={{ display: 'flex', gap: 8 }}>
          {/* 深色阅读模式切换 */}
          <Tooltip title={darkReadingMode ? '切换浅色模式' : '切换深色模式'}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                icon={darkReadingMode ? <BulbFilled style={{ color: '#ffeb3b' }} /> : <BulbOutlined />} 
                onClick={() => setDarkReadingMode(!darkReadingMode)}
                type="text"
                style={{ color: darkReadingMode ? '#ffeb3b' : 'var(--text-primary)' }}
              />
            </motion.div>
          </Tooltip>
          
          <Tooltip title="撤销 (Ctrl+Z)">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                icon={<UndoOutlined />} 
                onClick={handleUndo} 
                disabled={highlights.length === 0}
                type="text"
                style={{ color: darkReadingMode ? 'var(--text-primary)' : '#333' }}
              />
            </motion.div>
          </Tooltip>
          
          {!isMobile && (
            <Tooltip title={sidebarCollapsed ? '展开侧栏' : '收起侧栏'}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  type="text"
                  style={{ color: darkReadingMode ? 'var(--text-primary)' : '#333' }}
                />
              </motion.div>
            </Tooltip>
          )}
          
          {isMobile && (
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                icon={<MenuUnfoldOutlined />} 
                onClick={() => setMobileDrawerOpen(true)}
                type="text"
                style={{ color: 'var(--text-primary)' }}
              />
            </motion.div>
          )}
        </div>
      </motion.header>
      
      {/* 主内容区 - 可拖拽面板 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {isMobile ? (
          // 移动端：全屏 PDF + 抽屉侧栏
          <>
            <div style={{ 
              height: '100%', 
              position: 'relative',
              background: darkReadingMode ? '#1a1a1a' : '#f5f5f5',
              filter: darkReadingMode ? 'invert(1) hue-rotate(180deg)' : 'none',
            }}>
              <PdfLoader 
                url={pdfUrl} 
                beforeLoad={
                  <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Spin size="large" />
                  </div>
                } 
              >
                {(pdfDocument) => (
                  <PdfHighlighter
                    pdfDocument={pdfDocument}
                    enableAreaSelection={(event) => event.altKey}
                    onScrollChange={() => {}}
                    pdfScaleValue="page-width"
                    style={{ height: '100%', width: '100%', position: 'absolute' }}
                    scrollRef={(scrollTo) => { scrollViewerTo.current = scrollTo; }}
                    onSelectionFinished={(position, content, hide) => (
                      <ViewerTip 
                        onConfirm={(c, type) => { addHighlight({ content, position, comment: c }, type); hide(); }} 
                        onTranslate={() => { handleTranslate(content); hide(); }} 
                      />
                    )}
                    highlightTransform={(highlight, index, setTip, hideTip) => {
                      const color = highlight.type === 'note' ? NOTE_COLOR : HIGHLIGHT_COLOR;
                      return (
                        <Popup 
                          popupContent={<HighlightPopup comment={highlight.comment} onDelete={() => removeHighlight(highlight.id)} />} 
                          onMouseOver={(content) => setTip(highlight, () => content)} 
                          onMouseOut={hideTip} 
                          key={index}
                        >
                          <CustomHighlight 
                            position={highlight.position} 
                            comment={highlight.comment} 
                            color={color} 
                          />
                        </Popup>
                      );
                    }}
                    highlights={highlights}
                  />
                )}
              </PdfLoader>
            </div>
            
            <Drawer
              title="标注与 AI 助手"
              placement="right"
              onClose={() => setMobileDrawerOpen(false)}
              open={mobileDrawerOpen}
              width="85%"
              styles={{
                header: { 
                  background: darkReadingMode ? 'var(--bg-secondary)' : '#fff', 
                  borderBottom: darkReadingMode ? '1px solid var(--border-primary)' : '1px solid #e0e0e0',
                  color: darkReadingMode ? 'var(--text-primary)' : '#333',
                },
                body: { 
                  background: darkReadingMode ? 'var(--bg-secondary)' : '#fff', 
                  padding: 0 
                },
              }}
            >
              <SidebarContent darkMode={darkReadingMode} />
            </Drawer>
          </>
        ) : (
          // PC端：可拖拽面板，支持完全折叠
          <PanelGroup direction="horizontal">
            {/* PDF 阅读区 */}
            <Panel 
              defaultSize={70} 
              minSize={0} 
              collapsible={true}
              collapsedSize={0}
            >
              <div style={{ 
                height: '100%', 
                position: 'relative', 
                background: darkReadingMode ? '#1a1a1a' : '#f5f5f5',
                // 深色模式下对 PDF 应用反色滤镜
                filter: darkReadingMode ? 'invert(1) hue-rotate(180deg)' : 'none',
              }}>
                <PdfLoader 
                  url={pdfUrl} 
                  beforeLoad={
                    <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Spin size="large" />
                    </div>
                  } 
                >
                  {(pdfDocument) => (
                    <PdfHighlighter
                      pdfDocument={pdfDocument}
                      enableAreaSelection={(event) => event.altKey}
                      onScrollChange={() => {}}
                      pdfScaleValue="page-width"
                      style={{ height: '100%', width: '100%', position: 'absolute' }}
                      scrollRef={(scrollTo) => { scrollViewerTo.current = scrollTo; }}
                      onSelectionFinished={(position, content, hide) => (
                        <ViewerTip 
                          onConfirm={(c, type) => { addHighlight({ content, position, comment: c }, type); hide(); }} 
                          onTranslate={() => { handleTranslate(content); hide(); }} 
                        />
                      )}
                      highlightTransform={(highlight, index, setTip, hideTip) => {
                        const color = highlight.type === 'note' ? NOTE_COLOR : HIGHLIGHT_COLOR;
                        return (
                          <Popup 
                            popupContent={<HighlightPopup comment={highlight.comment} onDelete={() => removeHighlight(highlight.id)} />} 
                            onMouseOver={(content) => setTip(highlight, () => content)} 
                            onMouseOut={hideTip} 
                            key={index}
                          >
                            <CustomHighlight 
                              position={highlight.position} 
                              comment={highlight.comment} 
                              color={color} 
                            />
                          </Popup>
                        );
                      }}
                      highlights={highlights}
                    />
                  )}
                </PdfLoader>
              </div>
            </Panel>
            
            {/* 拖拽手柄 */}
            <ResizeHandle />
            
            {/* 侧边栏 */}
            <Panel 
              defaultSize={30} 
              minSize={0} 
              collapsible={true}
              collapsedSize={0}
            >
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  height: '100%',
                  background: darkReadingMode ? 'var(--bg-secondary)' : '#ffffff',
                  borderLeft: darkReadingMode ? '1px solid var(--border-primary)' : '1px solid #e0e0e0',
                }}
              >
                <SidebarContent darkMode={darkReadingMode} />
              </motion.div>
            </Panel>
          </PanelGroup>
        )}
      </div>
    </div>
  );
};

export default PDFReaderPage;
