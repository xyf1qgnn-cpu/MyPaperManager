import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ReadOutlined,
  DeploymentUnitOutlined,
  SettingOutlined,
  UserOutlined,
  HeartOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import SettingsModal from './SettingsModal';
import { getProfile } from '../services/userService';

const { Header, Content, Sider } = Layout;

const MainLayout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // 获取用户信息
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

  // 侧边栏菜单项
  const siderItems = [
    { key: '/', label: '文献库', icon: <ReadOutlined /> },
    { key: '/favorites', label: '我的收藏', icon: <HeartOutlined /> },
    { key: '/graph', label: '知识图谱', icon: <DeploymentUnitOutlined /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div className="demo-logo" style={{ color: 'white', fontSize: 20, fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>
          MyScholar
        </div>
        <div>
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'white' }}>
              <Avatar icon={<UserOutlined />} src={userProfile?.avatar} style={{ marginRight: 8 }} />
              <span>{userProfile?.username || '用户'}</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer, position: 'relative' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={siderItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              marginTop: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      <SettingsModal 
        open={isSettingsModalVisible} 
        onCancel={() => setIsSettingsModalVisible(false)} 
      />
    </Layout>
  );
};

export default MainLayout;
