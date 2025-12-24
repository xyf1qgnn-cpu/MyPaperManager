import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Spin, Empty, Tag, Select, Button, message } from 'antd';
import {
  FileTextOutlined,
  HeartOutlined,
  EyeOutlined,
  TrophyOutlined,
  RiseOutlined,
  BookOutlined,
  UserOutlined,
  TagOutlined,
  CalendarOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { getOverview, getKeywordStats, getJournalStats, getReadingStats, generateReport } from '../services/analyticsService';

const COLORS = ['#00d4ff', '#00ff88', '#ff6b6b', '#ffd93d', '#6c5ce7', '#a29bfe', '#fd79a8', '#00b894'];

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [journals, setJournals] = useState([]);
  const [readingStats, setReadingStats] = useState(null);
  const [reportPeriod, setReportPeriod] = useState('month');
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [overviewData, keywordsData, journalsData, readingData] = await Promise.all([
        getOverview(),
        getKeywordStats(),
        getJournalStats(),
        getReadingStats(30)
      ]);
      setOverview(overviewData);
      setKeywords(keywordsData || []);
      setJournals(journalsData || []);
      setReadingStats(readingData);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const report = await generateReport(reportPeriod);
      message.success(`${report.period}报告：添加 ${report.summary.addedCount} 篇，阅读 ${report.summary.readCount} 篇`);
    } catch (error) {
      message.error('生成报告失败');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            <RiseOutlined style={{ fontSize: 20, color: '#0a0f1a' }} />
          </motion.div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>
              文献计量分析
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>
              数据驱动，洞察研究趋势
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Select
            value={reportPeriod}
            onChange={setReportPeriod}
            options={[
              { value: 'week', label: '本周' },
              { value: 'month', label: '本月' },
              { value: 'year', label: '今年' }
            ]}
            style={{ width: 100 }}
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={generatingReport}
            onClick={handleGenerateReport}
          >
            生成报告
          </Button>
        </div>
      </motion.div>

      {/* 概览卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card
              style={{
                background: 'linear-gradient(145deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: 12
              }}
            >
              <Statistic
                title={<span style={{ color: 'var(--text-tertiary)' }}>总文献数</span>}
                value={overview?.summary?.totalCount || 0}
                prefix={<FileTextOutlined style={{ color: '#00d4ff' }} />}
                valueStyle={{ color: '#00d4ff', fontWeight: 600 }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={12} sm={6}>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card
              style={{
                background: 'linear-gradient(145deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.05) 100%)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                borderRadius: 12
              }}
            >
              <Statistic
                title={<span style={{ color: 'var(--text-tertiary)' }}>已阅读</span>}
                value={overview?.summary?.readCount || 0}
                prefix={<EyeOutlined style={{ color: '#00ff88' }} />}
                valueStyle={{ color: '#00ff88', fontWeight: 600 }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={12} sm={6}>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card
              style={{
                background: 'linear-gradient(145deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 107, 107, 0.05) 100%)',
                border: '1px solid rgba(255, 107, 107, 0.2)',
                borderRadius: 12
              }}
            >
              <Statistic
                title={<span style={{ color: 'var(--text-tertiary)' }}>收藏</span>}
                value={overview?.summary?.favoriteCount || 0}
                prefix={<HeartOutlined style={{ color: '#ff6b6b' }} />}
                valueStyle={{ color: '#ff6b6b', fontWeight: 600 }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={12} sm={6}>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card
              style={{
                background: 'linear-gradient(145deg, rgba(255, 217, 61, 0.15) 0%, rgba(255, 217, 61, 0.05) 100%)',
                border: '1px solid rgba(255, 217, 61, 0.2)',
                borderRadius: 12
              }}
            >
              <div style={{ color: 'var(--text-tertiary)', marginBottom: 8, fontSize: 13 }}>阅读进度</div>
              <Progress
                percent={overview?.summary?.readingProgress || 0}
                strokeColor={{ '0%': '#ffd93d', '100%': '#f7b731' }}
                trailColor="rgba(255, 255, 255, 0.1)"
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 年度分布 */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarOutlined style={{ color: '#00d4ff' }} />
                  <span>年度分布</span>
                </div>
              }
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--border-primary)',
                borderRadius: 12
              }}
              styles={{ body: { padding: '16px' } }}
            >
              {overview?.byYear?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={overview.byYear.slice(0, 10).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="year" stroke="var(--text-tertiary)" fontSize={12} />
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 8
                      }}
                    />
                    <Bar dataKey="count" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="暂无数据" />
              )}
            </Card>
          </motion.div>
        </Col>

        {/* 阅读状态分布 */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOutlined style={{ color: '#00ff88' }} />
                  <span>阅读状态</span>
                </div>
              }
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--border-primary)',
                borderRadius: 12
              }}
              styles={{ body: { padding: '16px' } }}
            >
              {overview?.byStatus?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={overview.byStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {overview.byStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 8
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="暂无数据" />
              )}
            </Card>
          </motion.div>
        </Col>

        {/* 高产作者 */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserOutlined style={{ color: '#6c5ce7' }} />
                  <span>高产作者 TOP10</span>
                </div>
              }
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--border-primary)',
                borderRadius: 12
              }}
              styles={{ body: { padding: '16px' } }}
            >
              {overview?.byAuthor?.length > 0 ? (
                <div style={{ maxHeight: 250, overflow: 'auto' }}>
                  {overview.byAuthor.map((item, index) => (
                    <motion.div
                      key={item.author}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        marginBottom: 4,
                        background: index < 3 
                          ? `rgba(${index === 0 ? '255, 215, 0' : index === 1 ? '192, 192, 192' : '205, 127, 50'}, 0.1)`
                          : 'transparent',
                        borderRadius: 8,
                        border: index < 3 
                          ? `1px solid rgba(${index === 0 ? '255, 215, 0' : index === 1 ? '192, 192, 192' : '205, 127, 50'}, 0.3)`
                          : '1px solid transparent'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ 
                          width: 24, 
                          textAlign: 'center',
                          fontWeight: 600,
                          color: index < 3 ? COLORS[index] : 'var(--text-tertiary)'
                        }}>
                          {index + 1}
                        </span>
                        <span style={{ 
                          color: 'var(--text-primary)',
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.author}
                        </span>
                      </div>
                      <Tag color={COLORS[index % COLORS.length]}>{item.count} 篇</Tag>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无数据" />
              )}
            </Card>
          </motion.div>
        </Col>

        {/* 近30天添加趋势 */}
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RiseOutlined style={{ color: '#00d4ff' }} />
                  <span>近30天添加趋势</span>
                </div>
              }
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--border-primary)',
                borderRadius: 12
              }}
              styles={{ body: { padding: '16px' } }}
            >
              {overview?.recentlyAdded?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={overview.recentlyAdded}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="var(--text-tertiary)" 
                      fontSize={11}
                      tickFormatter={(value) => value.slice(5)}
                    />
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 8
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#00d4ff" 
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="暂无数据" />
              )}
            </Card>
          </motion.div>
        </Col>

        {/* 热门关键词 */}
        <Col xs={24}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TagOutlined style={{ color: '#fd79a8' }} />
                  <span>热门关键词</span>
                </div>
              }
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--border-primary)',
                borderRadius: 12
              }}
              styles={{ body: { padding: '16px' } }}
            >
              {keywords.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {keywords.map((item, index) => (
                    <motion.div
                      key={item.keyword}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Tag
                        style={{
                          padding: '4px 12px',
                          borderRadius: 16,
                          fontSize: Math.max(12, 16 - index * 0.3),
                          background: `${COLORS[index % COLORS.length]}20`,
                          border: `1px solid ${COLORS[index % COLORS.length]}40`,
                          color: COLORS[index % COLORS.length],
                          cursor: 'pointer'
                        }}
                      >
                        {item.keyword}
                        <span style={{ 
                          marginLeft: 6, 
                          fontSize: 10, 
                          opacity: 0.7 
                        }}>
                          {item.count}
                        </span>
                      </Tag>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无关键词数据" />
              )}
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsPage;

