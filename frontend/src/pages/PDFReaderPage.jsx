import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Layout, List, Typography, Button, message, Empty, Tabs, Card, Tooltip } from 'antd';
import { ArrowLeftOutlined, HighlightOutlined, TranslationOutlined, FileTextOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { PdfLoader, PdfHighlighter, Highlight, Popup, AreaHighlight } from 'react-pdf-highlighter';
import * as pdfjsLib from 'pdfjs-dist';

// Import Services
import { getDocumentById } from '../services/documentService';
import { saveAnnotation, getAnnotations, deleteAnnotation } from '../services/annotationService';
import { translateText, getDocSummary } from '../services/aiService';

// -------------------------------------------------------------
// Core Config: Local Worker
// -------------------------------------------------------------
pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;

const { Sider, Content, Header } = Layout;
const { Title, Text, Paragraph } = Typography;

// --- Constants ---
const HIGHLIGHT_COLOR = '#ffeb3b';
const NOTE_COLOR = '#ccf1fd';

// --- Components ---
const ViewerTip = ({ onOpen, onConfirm, onTranslate }) => {
  return (
    <div style={{ background: 'white', borderRadius: '4px', padding: '5px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', gap: '8px' }}>
      <Tooltip title="高亮 (Highlight)">
        <Button type="text" icon={<HighlightOutlined style={{ color: '#faad14' }} />} onClick={() => onConfirm({ text: '', emoji: '' }, 'highlight')} />
      </Tooltip>
      <Tooltip title="笔记 (Note)">
        <Button type="text" icon={<FileTextOutlined style={{ color: '#1890ff' }} />} onClick={() => onConfirm({ text: '', emoji: '' }, 'note')} />
      </Tooltip>
      <Tooltip title="AI 翻译">
        <Button type="text" icon={<TranslationOutlined style={{ color: '#52c41a' }} />} onClick={onTranslate} />
      </Tooltip>
    </div>
  );
};

const HighlightPopup = ({ comment, onDelete }) => (
  <div className="Highlight__popup" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    {comment.emoji} {comment.text}
    <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={onDelete} style={{ marginLeft: 'auto' }} />
  </div>
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
          style={{ ...rect, background: color, opacity: 1, mixBlendMode: 'multiply' }}
          className="Highlight__part"
        />
      ))}
      {comment && comment.emoji && (
        <div style={{ position: 'absolute', left: boundingRect.left - 20, top: boundingRect.top, width: 20, fontSize: 20 }}>
            {comment.emoji}
        </div>
      )}
    </div>
  );
};

const PDFReaderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // States
  const [highlights, setHighlights] = useState([]);
  const [activeTab, setActiveTab] = useState('notes');
  const [translateResult, setTranslateResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  // Ref
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
        message.error('Failed to load data');
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
    message.info('Undo successful');
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
    } catch (error) { message.error('Failed to summarize'); }
    finally { setIsSummarizing(false); }
  };

  const handleTranslate = async (content) => {
    const text = content.text; if (!text) return;
    setActiveTab('ai'); setIsTranslating(true); setTranslateResult(null);
    try {
      const res = await translateText(text);
      setTranslateResult({ original: text, translation: res.translation });
    } catch (error) { message.error('Translation failed'); }
    finally { setIsTranslating(false); }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}><Spin size="large" /></div>;
  if (!document || !document.pdfUrl) return <Empty description="No Document Found" style={{marginTop: 100}} />;

  const pdfUrl = document.pdfUrl;

  const sidebarItems = [
    {
      key: 'notes', label: '标注列表',
      children: (
        <div style={{ height: 'calc(100vh - 110px)', overflowY: 'auto', padding: '0 16px' }}>
          {highlights.length === 0 ? <Empty description="暂无标注" image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
            <List dataSource={highlights} renderItem={(item) => (
              <List.Item>
                <Card size="small" variant="borderless" style={{ width: '100%', background: '#f9f9f9', borderLeft: `4px solid ${item.type === 'note' ? NOTE_COLOR : HIGHLIGHT_COLOR}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <blockquote style={{ margin: '0 0 8px', paddingLeft: 8, color: '#666', flex: 1 }}>{item.content.text}</blockquote>
                    <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeHighlight(item.id)} />
                  </div>
                  {item.comment && item.comment.text && <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>{item.comment.text}</Text>}
                </Card>
              </List.Item>
            )} />
          }
        </div>
      )
    },
    {
      key: 'ai', label: 'AI 助手',
      children: (
        <div style={{ height: 'calc(100vh - 110px)', overflowY: 'auto', padding: 16 }}>
          <Card size="small" title="文献摘要 (Summary)" style={{ marginBottom: 16 }}>
            {!summary && !isSummarizing && <Button type="primary" block onClick={handleSummarize}>生成全文摘要</Button>}
            {isSummarizing && <div style={{textAlign:'center', padding:20}}><Spin /></div>}
            {summary && <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6 }}>{summary}</div>}
          </Card>
          <div style={{ borderTop: '1px solid #f0f0f0', margin: '16px 0' }} />
          <Title level={5} style={{ fontSize: 14 }}>选中翻译</Title>
          {isTranslating && <div style={{textAlign:'center', padding:20}}><Spin /></div>}
          {translateResult && (
            <Card title="翻译结果" variant="borderless" style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
              <Paragraph>{translateResult.translation}</Paragraph>
            </Card>
          )}
        </div>
      )
    }
  ];

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      {/* 1. Internal Styles to Guarantee Stability */}
      <style>{`
        .PdfHighlighter { position: absolute; overflow-y: auto; height: 100%; width: 100%; }
        .PdfHighlighter .textLayer { opacity: 1; mix-blend-mode: multiply; }
        .Highlight__part { margin: -2px; padding: 2px; }
        .Highlight__popup { background: white; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); padding: 8px 12px; font-size: 14px; color: #333; z-index: 100; min-width: 120px; }
      `}</style>
      
      <Header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 24px', display: 'flex', alignItems: 'center', height: 50 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" style={{ marginRight: 16 }} />
        <Title level={5} style={{ margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{document.title}</Title>
        <div style={{ marginLeft: 'auto' }}>
            <Tooltip title="撤销 (Ctrl+Z)">
                <Button icon={<UndoOutlined />} onClick={handleUndo} disabled={highlights.length === 0} />
            </Tooltip>
        </div>
      </Header>
      <Layout style={{ height: 'calc(100vh - 50px)' }}>
        <Content style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
          
          <PdfLoader 
            url={pdfUrl} 
            beforeLoad={<div style={{height:'100%', display:'flex', justifyContent:'center', alignItems:'center'}}><Spin size="large" /></div>} 
            errorMessage={<div style={{padding: 50, textAlign: 'center', color: 'red'}}>PDF Load Failed</div>} 
          >
            {(pdfDocument) => (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => event.altKey}
                onScrollChange={() => {}}
                pdfScaleValue="page-width"
                
                // --- 🔥 FIX: Inline Styles Force Absolute Positioning 🔥 ---
                style={{ height: '100%', width: '100%', position: 'absolute' }}
                
                scrollRef={(scrollTo) => { scrollViewerTo.current = scrollTo; }}
                
                onSelectionFinished={(position, content, hide, transform) => (
                  <ViewerTip 
                    onOpen={transform} 
                    onConfirm={(c, type) => { addHighlight({ content, position, comment: c }, type); hide(); }} 
                    onTranslate={() => { handleTranslate(content); hide(); }} 
                  />
                )}
                highlightTransform={(highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo) => {
                  const isTextHighlight = !Boolean(highlight.content && highlight.content.image);
                  let color = highlight.type === 'note' ? NOTE_COLOR : HIGHLIGHT_COLOR;
                  
                  const component = isTextHighlight ? (
                    <CustomHighlight isScrolledTo={isScrolledTo} position={highlight.position} comment={highlight.comment} color={color} />
                  ) : (
                    <AreaHighlight isScrolledTo={isScrolledTo} highlight={highlight} onChange={() => {}} />
                  );

                  return (
                    <Popup 
                        popupContent={<HighlightPopup comment={highlight.comment} onDelete={() => removeHighlight(highlight.id)} />} 
                        onMouseOver={(content) => setTip(highlight, (highlight) => content)} 
                        onMouseOut={hideTip} 
                        key={index}
                    >
                        {component}
                    </Popup>
                  );
                }}
                highlights={highlights}
              />
            )}
          </PdfLoader>
        </Content>
        <Sider width={350} theme="light" style={{ borderLeft: '1px solid #f0f0f0' }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={sidebarItems} centered style={{ height: '100%' }} />
        </Sider>
      </Layout>
    </Layout>
  );
};

export default PDFReaderPage;
