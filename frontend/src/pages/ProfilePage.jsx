import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, message, Upload } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
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
      // 1. 上传图片
      const response = await uploadFile(file);
      // response: { message, file: { path: 'uploads/xxx.png', ... } }
      const avatarUrl = `/api/${response.file.path.replace(/\\/g, '/')}`; // 确保路径格式正确，并加上 /api 前缀 (如果后端返回相对路径)
      // 注意：后端返回的 path 可能是 "public/uploads/xxx" 或 "uploads/xxx"
      // 我们的静态文件服务是 /api/files/:filename 还是直接 /uploads ?
      // 查看 server.js: app.use('/uploads', express.static(path.resolve(config.upload.path)));
      // 所以访问路径应该是 /uploads/filename
      // 而 uploadFile 返回的 path 是文件系统路径。
      // 我们需要构建正确的 URL。
      // 假设 response.file.filename 是文件名。
      const finalAvatarUrl = `/uploads/${response.file.filename}`;
      
      // 2. 更新用户 Profile
      await updateProfile({ avatar: finalAvatarUrl });
      
      message.success('头像更新成功');
      onSuccess('ok');
      fetchProfile(); // 刷新头像显示
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
      // 假设后端接口为 PUT /api/user/profile
      // 如果没有 bio 字段，后端可能会忽略或报错，这里假设后端支持
      await updateProfile({
        username: values.username,
        bio: values.bio
      });
      message.success('个人信息更新成功');
      // 刷新数据
      fetchProfile();
    } catch (error) {
      console.error('Update profile failed:', error);
      message.error('更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Card title="个人中心" variant="borderless" loading={loading}>
        <div style={{ display: 'flex', marginBottom: 32, alignItems: 'center' }}>
          <div style={{ marginRight: 32, textAlign: 'center' }}>
            <Avatar size={100} icon={<UserOutlined />} src={profile?.avatar} />
            <div style={{ marginTop: 16 }}>
              <Upload 
                customRequest={handleAvatarUpload} 
                showUploadList={false} 
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} size="small" loading={uploadingAvatar}>更换头像</Button>
              </Upload>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h2>{profile?.username}</h2>
            <p style={{ color: '#666' }}>{profile?.email}</p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="bio"
            label="个人简介"
          >
            <TextArea rows={4} placeholder="介绍一下你自己..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage;
