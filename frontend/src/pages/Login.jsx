import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { setAuth } from '../utils/auth';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post('/login', values);
      setAuth(res.data.token, res.data.user);
      message.success('登录成功');
      navigate('/');
      window.location.reload();
    } catch (err) {
      message.error(err.response?.data?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐾</div>
          <h1 className="text-2xl font-bold text-gray-800">欢迎回来</h1>
          <p className="text-gray-500 mt-1">登录宠物救助志愿者平台</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="bg-orange-500 border-orange-500 hover:bg-orange-600 h-11 text-base font-medium"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center text-gray-500">
          还没有账号？{' '}
          <Link to="/register" className="text-orange-500 hover:text-orange-600 font-medium">
            立即注册
          </Link>
        </div>

        <div className="mt-4 p-3 bg-orange-50 rounded-lg text-sm text-gray-600 text-center">
          测试账号：<strong>test</strong> / 密码：<strong>123456</strong>
        </div>
      </Card>
    </div>
  );
};

export default Login;
