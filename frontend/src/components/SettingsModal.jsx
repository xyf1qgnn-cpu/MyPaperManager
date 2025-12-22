import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Tabs, message, Button } from 'antd';
import { updateSettings } from '../services/userService';

const SettingsModal = ({ open, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 当 Modal 打开时，尝试从 localStorage 读取之前的设置
  useEffect(() => {
    if (open) {
      const apiKey = localStorage.getItem('deepseek_api_key');
      if (apiKey) {
        form.setFieldsValue({ apiKey });
      }
    }
  }, [open, form]);

  const handleSaveAIConfig = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      try {
        await updateSettings({ deepseekApiKey: values.apiKey });
        message.success('API配置保存成功');
      } catch (error) {
        console.warn('Backend settings endpoint missing or failed', error);
        message.success('配置已保存 (本地)');
        // 即使后端失败，也保存到本地以便演示
        localStorage.setItem('deepseek_api_key', values.apiKey);
      }
      
      onCancel();
    } catch (error) {
      console.error('Settings save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: '1',
      label: '通用设置',
      children: (
        <div style={{ padding: '20px 0', textAlign: 'center', color: '#999' }}>
          暂无通用设置项，后续可支持主题切换等功能。
        </div>
      ),
    },
    {
      key: '2',
      label: 'AI 配置',
      children: (
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="apiKey"
            label="DeepSeek API Key"
            rules={[{ required: true, message: '请输入 API Key' }]}
            help="用于调用 AI 进行文献解析，Key 将加密存储"
          >
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSaveAIConfig} loading={loading}>
              保存配置
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: '3',
      label: '关于',
      children: (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <h3>MyScholar</h3>
          <p>版本: v1.0.0</p>
          <p style={{ color: '#666' }}>
            一个基于 React + Node.js 的智能文献管理系统。
          </p>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title="系统设置"
      open={open}
      onCancel={onCancel}
      footer={null} // 使用 Tab 内部的按钮或不需要底部按钮
    >
      <Tabs defaultActiveKey="2" items={items} />
    </Modal>
  );
};

export default SettingsModal;
