import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      await api.post('/register', {
        username: values.username,
        password: values.password,
        phone: values.phone,
      });
      message.success('注册成功，请登录');
      navigate('/login');
    } catch (err) {
      message.error(err.response?.data?.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐾</div>
          <h1 className="text-2xl font-bold text-gray-800">注册账号</h1>
          <p className="text-gray-500 mt-1">加入宠物救助志愿者平台</p>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度3-20个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名（3-20个字符）" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度6-20个字符' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码（6-20个字符）" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: '请确认密码' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="手机号" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="bg-orange-500 border-orange-500 hover:bg-orange-600 h-11 text-base font-medium"
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center text-gray-500">
          已有账号？{' '}
          <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">
            立即登录
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
