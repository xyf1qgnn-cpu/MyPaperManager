import React, { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: values.email,
        password: values.password,
      });

      const { token, user } = response;
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1a 0%, #1a2332 50%, #0a0f1a 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 40%),
          radial-gradient(circle at 80% 20%, rgba(0, 255, 136, 0.08) 0%, transparent 40%)
        `,
        pointerEvents: 'none',
      }} />
      
      {/* 浮动粒子效果 */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{ 
            opacity: [0.2, 0.5, 0.2],
            y: [null, Math.random() * -200 - 100],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: i % 2 === 0 ? '#00d4ff' : '#00ff88',
            filter: 'blur(1px)',
          }}
        />
      ))}

      {/* 登录卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          width: 420,
          padding: 40,
          background: 'rgba(26, 35, 50, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 100px rgba(0, 212, 255, 0.1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo 和标题 */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(0, 212, 255, 0.4)',
                '0 0 40px rgba(0, 212, 255, 0.6)',
                '0 0 20px rgba(0, 212, 255, 0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: 28,
              fontWeight: 'bold',
              color: '#0a0f1a',
            }}
          >
            M
          </motion.div>
          
          <Title 
            level={2} 
            style={{ 
              margin: 0,
              background: 'linear-gradient(90deg, #00d4ff, #00ff88)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            MyScholar
          </Title>
          <Text style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>
            智能文献管理平台
          </Text>
        </div>
        
        {/* 登录表单 */}
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />} 
              placeholder="邮箱" 
              size="large"
              style={{
                height: 50,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />} 
              placeholder="密码" 
              size="large"
              style={{
                height: 50,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                block 
                size="large"
                icon={<RocketOutlined />}
                style={{
                  height: 50,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 16,
                  boxShadow: '0 8px 25px rgba(0, 212, 255, 0.3)',
                }}
              >
                登录
              </Button>
            </motion.div>
          </Form.Item>
          
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
              还没有账户？{' '}
              <motion.a 
                whileHover={{ scale: 1.05 }}
                onClick={(e) => { e.preventDefault(); message.info('注册功能开发中'); }}
                style={{ 
                  color: '#00d4ff',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                立即注册
              </motion.a>
            </Text>
          </div>
        </Form>
      </motion.div>

      {/* 版权信息 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'absolute',
          bottom: 24,
          textAlign: 'center',
          color: 'var(--text-tertiary)',
          fontSize: 12,
        }}
      >
        © 2024 MyScholar. 专为科研人员打造
      </motion.div>
    </div>
  );
};

export default LoginPage;
