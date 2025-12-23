import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Avatar, message, Upload, Spin } from 'antd';
import { UserOutlined, UploadOutlined, MailOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getProfile, updateProfile } from '../services/userService';
import { uploadFile } from '../services/documentService';

const { TextArea } = Input;

const ProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [form] = Form.useForm();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
      form.setFieldsValue({
        username: data.username,
        email: data.email,
        bio: data.bio || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      message.error('获取个人信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarUpload = async ({ file, onSuccess, onError }) => {
    setUploadingAvatar(true);
    try {
      const response = await uploadFile(file);
      const finalAvatarUrl = `/uploads/${response.file.filename}`;
      await updateProfile({ avatar: finalAvatarUrl });
      message.success('头像更新成功');
      onSuccess('ok');
      fetchProfile();
    } catch (error) {
      console.error('Avatar upload failed:', error);
      message.error('头像上传失败');
      onError(error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await updateProfile({
        username: values.username,
        bio: values.bio
      });
      message.success('个人信息更新成功');
      fetchProfile();
    } catch (error) {
      console.error('Update profile failed:', error);
      message.error('更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 400 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, 
          marginBottom: 32,
        }}
      >
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
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UserOutlined style={{ fontSize: 18, color: '#0a0f1a' }} />
        </motion.div>
        <h2 style={{ 
          margin: 0, 
          fontSize: 20, 
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}>
          个人中心
        </h2>
      </motion.div>

      {/* 头像区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          padding: 24,
          background: 'rgba(0, 212, 255, 0.05)',
          borderRadius: 16,
          border: '1px solid rgba(0, 212, 255, 0.1)',
          marginBottom: 32,
        }}
      >
        <div style={{ position: 'relative' }}>
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 4px rgba(0, 212, 255, 0.2)',
                '0 0 0 8px rgba(0, 212, 255, 0.1)',
                '0 0 0 4px rgba(0, 212, 255, 0.2)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ borderRadius: '50%' }}
          >
            <Avatar 
              size={100} 
              icon={<UserOutlined />} 
              src={profile?.avatar}
              style={{
                border: '3px solid rgba(0, 212, 255, 0.4)',
              }}
            />
          </motion.div>
          <Upload 
            customRequest={handleAvatarUpload} 
            showUploadList={false} 
            accept="image/*"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px solid var(--bg-secondary)',
              }}
            >
              {uploadingAvatar ? (
                <Spin size="small" />
              ) : (
                <EditOutlined style={{ fontSize: 14, color: '#0a0f1a' }} />
              )}
            </motion.div>
          </Upload>
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: 22, 
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}>
            {profile?.username}
          </h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6,
            color: 'var(--text-tertiary)',
            fontSize: 14,
          }}>
            <MailOutlined />
            {profile?.email}
          </div>
        </div>
      </motion.div>

      {/* 表单区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            label={<span style={{ color: 'var(--text-primary)' }}>昵称</span>}
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />}
              style={{ 
                height: 46, 
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.03)',
              }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={{ color: 'var(--text-primary)' }}>邮箱</span>}
          >
            <Input 
              prefix={<MailOutlined style={{ color: 'var(--text-tertiary)' }} />}
              disabled 
              style={{ 
                height: 46, 
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            />
          </Form.Item>

          <Form.Item
            name="bio"
            label={<span style={{ color: 'var(--text-primary)' }}>个人简介</span>}
          >
            <TextArea 
              rows={4} 
              placeholder="介绍一下你自己..."
              style={{ 
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.03)',
                resize: 'none',
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                icon={<SaveOutlined />}
                style={{
                  height: 46,
                  borderRadius: 10,
                  paddingLeft: 32,
                  paddingRight: 32,
                  fontWeight: 500,
                }}
              >
                保存修改
              </Button>
            </motion.div>
          </Form.Item>
        </Form>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
