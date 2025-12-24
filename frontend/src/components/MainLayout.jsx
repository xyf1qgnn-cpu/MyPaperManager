import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Drawer, Button, Badge, Tooltip, Modal, Input, List, Empty, Spin } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ReadOutlined,
  DeploymentUnitOutlined,
  SettingOutlined,
  UserOutlined,
  HeartOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  SearchOutlined,
  BellOutlined,
  ThunderboltOutlined,
  BookOutlined,
  FileTextOutlined,
  RiseOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from './animations';
import SettingsModal from './SettingsModal';
import { getProfile } from '../services/userService';
import { getDocuments } from '../services/documentService';
import { useBreakpoint } from '../hooks/useBreakpoint';

const { Header, Content, Sider } = Layout;

// Logo 组件
const Logo = ({ collapsed, onClick }) => (
  <motion.div 
    className="logo-container"
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      cursor: 'pointer',
      padding: '0 8px',
    }}
  >
    <motion.div
      animate={{
        boxShadow: [
          '0 0 10px rgba(0, 212, 255, 0.5)',
          '0 0 20px rgba(0, 212, 255, 0.8)',
          '0 0 10px rgba(0, 212, 255, 0.5)',
        ],
      }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0a0f1a',
      }}
    >
      M
    </motion.div>
    {!collapsed && (
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        style={{
          fontSize: 20,
          fontWeight: 700,
          background: 'linear-gradient(90deg, #00d4ff, #00ff88)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
        }}
      >
        MyScholar
      </motion.span>
    )}
  </motion.div>
);

// 用户头像组件
const UserAvatar = ({ userProfile, menu }) => (
  <Dropdown menu={menu} placement="bottomRight" trigger={['click']}>
    <motion.div 
      whileHover={{ scale: 1.05 }}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        cursor: 'pointer',
        padding: '6px 12px',
        borderRadius: 20,
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.3s ease',
      }}
      className="user-avatar-wrapper"
    >
      <motion.div
        whileHover={{
          boxShadow: '0 0 15px rgba(0, 212, 255, 0.5)',
        }}
      >
        <Avatar 
          icon={<UserOutlined />} 
          src={userProfile?.avatar} 
          style={{ 
            marginRight: 8,
            border: '2px solid rgba(0, 212, 255, 0.3)',
          }} 
        />
      </motion.div>
      <span style={{ color: 'var(--text-primary)', fontSize: 14 }}>
        {userProfile?.username || '用户'}
      </span>
    </motion.div>
  </Dropdown>
);

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet } = useBreakpoint();
  
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  
  // 搜索相关状态
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allDocuments, setAllDocuments] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };
    fetchProfile();
  }, []);

  // 加载所有文档用于搜索
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await getDocuments();
        setAllDocuments(Array.isArray(docs) ? docs : []);
      } catch (error) {
        console.error('Failed to fetch documents for search', error);
      }
    };
    fetchDocuments();
  }, []);

  // 搜索文献
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    // 本地搜索（标题和作者）
    const results = allDocuments.filter(doc => {
      const titleMatch = doc.title?.toLowerCase().includes(keyword.toLowerCase());
      const authorMatch = doc.authors?.some(author => 
        author.toLowerCase().includes(keyword.toLowerCase())
      );
      return titleMatch || authorMatch;
    });
    setSearchResults(results);
    setSearchLoading(false);
  };

  // 打开搜索模态框
  const openSearchModal = () => {
    setSearchModalVisible(true);
    setSearchKeyword('');
    setSearchResults([]);
  };

  // 点击搜索结果
  const handleSearchResultClick = (docId) => {
    setSearchModalVisible(false);
    navigate(`/read/${docId}`);
  };

  // 侧边栏菜单项
  const siderItems = [
    { 
      key: '/', 
      label: '文献库', 
      icon: <ReadOutlined style={{ fontSize: 18 }} /> 
    },
    { 
      key: '/favorites', 
      label: '我的收藏', 
      icon: <HeartOutlined style={{ fontSize: 18 }} /> 
    },
    { 
      key: '/smart-groups', 
      label: '智能分组', 
      icon: <ThunderboltOutlined style={{ fontSize: 18 }} /> 
    },
    { 
      key: '/analytics', 
      label: '文献统计', 
      icon: <RiseOutlined style={{ fontSize: 18 }} /> 
    },
    { 
      key: '/graph', 
      label: '知识图谱', 
      icon: <DeploymentUnitOutlined style={{ fontSize: 18 }} /> 
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleMenuClick = (key) => {
    navigate(key);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: '个人中心',
        icon: <UserOutlined />,
        onClick: () => navigate('/profile'),
      },
      {
        key: 'settings',
        label: '系统设置',
        icon: <SettingOutlined />,
        onClick: () => setIsSettingsModalVisible(true),
      },
      { type: 'divider' },
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  // 侧边栏内容
  const SidebarContent = () => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!isMobile && (
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-primary)' }}>
          <Logo collapsed={siderCollapsed} onClick={() => navigate('/')} />
        </div>
      )}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ 
          flex: 1, 
          borderRight: 0,
          paddingTop: 8,
        }}
        items={siderItems.map(item => ({
          ...item,
          label: (
            <motion.span whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}>
              {item.label}
            </motion.span>
          ),
        }))}
        onClick={({ key }) => handleMenuClick(key)}
      />
      
      {/* 底部统计/励志小组件 */}
      {!siderCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            margin: 12,
            padding: 16,
            background: 'linear-gradient(145deg, rgba(0, 212, 255, 0.08) 0%, rgba(0, 255, 136, 0.05) 100%)',
            borderRadius: 12,
            border: '1px solid rgba(0, 212, 255, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
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
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              今日阅读
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                style={{ fontSize: 20, fontWeight: 700, color: '#00d4ff' }}
              >
                3
              </motion.div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>篇文献</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                style={{ fontSize: 20, fontWeight: 700, color: '#00ff88' }}
              >
                45
              </motion.div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>分钟</div>
            </div>
          </div>
          
          <div style={{
            fontSize: 11,
            color: 'var(--text-tertiary)',
            fontStyle: 'italic',
            textAlign: 'center',
            paddingTop: 8,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            <BookOutlined style={{ marginRight: 4 }} />
            知识改变命运
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--gradient-dark)', position: 'relative' }}>
      {/* 粒子背景效果 */}
      <ParticleBackground count={30} />
      {/* 顶部导航栏 */}
      <Header 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 24px',
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* 移动端汉堡菜单 */}
          {isMobile && (
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: 20, color: 'var(--text-primary)' }} />}
                onClick={() => setMobileMenuOpen(true)}
                style={{ padding: 4 }}
              />
            </motion.div>
          )}
          
          {/* 移动端Logo */}
          {isMobile && <Logo collapsed={false} onClick={() => navigate('/')} />}
        </div>

        {/* 顶部右侧小组件 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* 搜索按钮 */}
          <Tooltip title="搜索文献">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="text"
                icon={<SearchOutlined style={{ fontSize: 18, color: 'var(--text-secondary)' }} />}
                onClick={openSearchModal}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              />
            </motion.div>
          </Tooltip>

          {/* 通知铃铛 */}
          <Tooltip title="通知">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Badge count={0} size="small" offset={[-4, 4]}>
                <Button
                  type="text"
                  icon={<BellOutlined style={{ fontSize: 18, color: 'var(--text-secondary)' }} />}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                />
              </Badge>
            </motion.div>
          </Tooltip>

          {/* 分隔线 */}
          <div style={{
            width: 1,
            height: 24,
            background: 'rgba(255, 255, 255, 0.1)',
            margin: '0 8px',
          }} />

          <UserAvatar userProfile={userProfile} menu={userMenu} />
        </div>
      </Header>

      <Layout>
        {/* PC端侧边栏 */}
        {!isMobile && (
          <Sider 
            width={220} 
            collapsible
            collapsed={siderCollapsed}
            onCollapse={setSiderCollapsed}
            collapsedWidth={70}
            trigger={null}
            style={{ 
              overflow: 'auto',
              height: 'calc(100vh - 64px)',
              position: 'sticky',
              top: 64,
              left: 0,
            }}
          >
            <SidebarContent />
          </Sider>
        )}

        {/* 移动端抽屉菜单 */}
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Logo collapsed={false} onClick={() => { navigate('/'); setMobileMenuOpen(false); }} />
            </div>
          }
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
          closeIcon={<CloseOutlined style={{ color: 'var(--text-primary)' }} />}
          styles={{
            header: {
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-primary)',
            },
            body: {
              background: 'var(--bg-secondary)',
              padding: 0,
            },
          }}
        >
          <SidebarContent />
        </Drawer>

        {/* 主内容区 */}
        <Layout style={{ padding: isMobile ? '16px' : '24px' }}>
          <Content>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-primary)',
                padding: isMobile ? 16 : 24,
                minHeight: 'calc(100vh - 64px - 48px)',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </Content>
        </Layout>
      </Layout>

      <SettingsModal 
        open={isSettingsModalVisible} 
        onCancel={() => setIsSettingsModalVisible(false)} 
      />

      {/* 搜索模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SearchOutlined style={{ color: '#00d4ff' }} />
            搜索文献
          </div>
        }
        open={searchModalVisible}
        onCancel={() => setSearchModalVisible(false)}
        footer={null}
        width={600}
        styles={{
          header: { background: 'var(--bg-secondary)' },
          body: { background: 'var(--bg-secondary)', padding: '16px 24px' },
        }}
      >
        <Input
          placeholder="输入标题或作者名搜索..."
          prefix={<SearchOutlined style={{ color: 'var(--text-tertiary)' }} />}
          value={searchKeyword}
          onChange={(e) => handleSearch(e.target.value)}
          size="large"
          style={{ 
            borderRadius: 10, 
            marginBottom: 16,
            background: 'rgba(0, 0, 0, 0.2)',
          }}
          autoFocus
        />
        
        <div style={{ 
          maxHeight: 400, 
          overflowY: 'auto',
          borderRadius: 8,
        }}>
          {searchLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : searchKeyword && searchResults.length === 0 ? (
            <Empty 
              description={<span style={{ color: 'var(--text-tertiary)' }}>未找到相关文献</span>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : searchResults.length > 0 ? (
            <List
              dataSource={searchResults}
              renderItem={(item) => (
                <motion.div
                  whileHover={{ x: 4, background: 'rgba(0, 212, 255, 0.08)' }}
                  onClick={() => handleSearchResultClick(item._id)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    marginBottom: 8,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 255, 136, 0.2))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <FileTextOutlined style={{ color: '#00d4ff' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: 600, 
                        color: 'var(--text-primary)',
                        marginBottom: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.title}
                      </div>
                      <div style={{ 
                        fontSize: 12, 
                        color: 'var(--text-tertiary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.authors?.join(', ') || '未知作者'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            />
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: 40, 
              color: 'var(--text-tertiary)',
              fontSize: 13,
            }}>
              输入关键词开始搜索
            </div>
          )}
        </div>
      </Modal>

      {/* 全局样式补充 */}
      <style>{`
        .user-avatar-wrapper:hover {
          background: rgba(0, 212, 255, 0.1) !important;
          border-color: rgba(0, 212, 255, 0.3) !important;
        }
        
        .ant-drawer-content {
          background: var(--bg-secondary) !important;
        }
        
        .ant-drawer-header {
          background: var(--bg-secondary) !important;
          border-bottom: 1px solid var(--border-primary) !important;
        }
        
        .ant-drawer-title {
          color: var(--text-primary) !important;
        }
        
        .ant-layout-sider-trigger {
          background: var(--bg-tertiary) !important;
          border-top: 1px solid var(--border-primary) !important;
        }
      `}</style>
    </Layout>
  );
};

export default MainLayout;
