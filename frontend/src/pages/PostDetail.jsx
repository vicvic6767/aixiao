import React, { useState, useEffect } from 'react';
import {
  Card, Tag, Button, Image, Popconfirm, message, Spin, Modal, Form, Input, Select
} from 'antd';
import {
  EnvironmentOutlined, PhoneOutlined, ClockCircleOutlined,
  UserOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getUser, isLoggedIn } from '../utils/auth';

const { Option } = Select;
const { TextArea } = Input;

const statusColors = {
  '待救助': 'red',
  '已救助': 'green',
  '已领养': 'blue',
};

const petTypeEmojis = {
  '狗狗': '🐶',
  '猫咪': '🐱',
  '其他': '🐾',
};

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [form] = Form.useForm();
  const currentUser = getUser();

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/posts/${id}`);
      setPost(res.data.post);
    } catch (err) {
      message.error('帖子不存在或已被删除');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const isOwner = isLoggedIn() && currentUser?.id === post?.user_id;

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${id}`);
      message.success('帖子已删除');
      navigate('/');
    } catch (err) {
      message.error(err.response?.data?.message || '删除失败');
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await api.put(`/posts/${id}/status`, { status: newStatus });
      message.success('状态已更新');
      fetchPost();
    } catch (err) {
      message.error(err.response?.data?.message || '更新状态失败');
    } finally {
      setStatusLoading(false);
    }
  };

  const openEditModal = () => {
    const images = parseImages(post.images);
    form.setFieldsValue({
      title: post.title,
      pet_type: post.pet_type,
      description: post.description,
      contact_phone: post.contact_phone,
      location: post.location,
    });
    setEditModalOpen(true);
  };

  const handleEdit = async (values) => {
    setEditLoading(true);
    try {
      const images = parseImages(post.images);
      await api.put(`/posts/${id}`, {
        ...values,
        images,
      });
      message.success('帖子已更新');
      setEditModalOpen(false);
      fetchPost();
    } catch (err) {
      message.error(err.response?.data?.message || '更新失败');
    } finally {
      setEditLoading(false);
    }
  };

  const parseImages = (imagesStr) => {
    try {
      return JSON.parse(imagesStr || '[]');
    } catch {
      return [];
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!post) return null;

  const images = parseImages(post.images);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back button */}
      <Button
        onClick={() => navigate('/')}
        className="mb-4"
      >
        ← 返回列表
      </Button>

      <Card className="shadow-md rounded-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Tag color={statusColors[post.status] || 'default'} className="text-sm">
                {post.status}
              </Tag>
              <Tag color="orange">
                {petTypeEmojis[post.pet_type]} {post.pet_type}
              </Tag>
            </div>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex gap-2 flex-wrap">
              <Button
                icon={<EditOutlined />}
                onClick={openEditModal}
              >
                编辑
              </Button>
              <Popconfirm
                title="确定要删除这个帖子吗？"
                onConfirm={handleDelete}
                okText="确定"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
              {post.status === '待救助' && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={statusLoading}
                  onClick={() => handleStatusChange('已救助')}
                  className="bg-green-500 border-green-500 hover:bg-green-600"
                >
                  标记为已救助
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Images */}
        {images.length > 0 && (
          <div className="mb-6">
            <Image.PreviewGroup>
              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={`http://localhost:3000${img}`}
                    alt={`图片${idx + 1}`}
                    className="rounded-lg object-cover"
                    style={{ width: 200, height: 160, objectFit: 'cover' }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyBYlFiXAHMN6MQyyIP7LDiAGcwN6CgHIap1OMDo3oKCgYGBgZ+SmJqanBiTWJRYlAhVYWBgYNiZXFqUChHfAEDFdYSx"
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          </div>
        )}

        {/* Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-600">
            <UserOutlined className="text-orange-500" />
            <span className="text-sm">发布者：<strong>{post.username}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <ClockCircleOutlined className="text-orange-500" />
            <span className="text-sm">发布时间：{formatDate(post.created_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <PhoneOutlined className="text-orange-500" />
            <span className="text-sm">联系电话：<strong>{post.contact_phone}</strong></span>
          </div>
          {post.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <EnvironmentOutlined className="text-orange-500" />
              <span className="text-sm">所在地址：{post.location}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-2">详细描述</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{post.description}</p>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="编辑帖子"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEdit}
          size="large"
        >
          <Form.Item
            label="帖子标题"
            name="title"
            rules={[{ required: true, message: '请输入帖子标题' }]}
          >
            <Input maxLength={100} showCount />
          </Form.Item>

          <Form.Item
            label="宠物类型"
            name="pet_type"
            rules={[{ required: true, message: '请选择宠物类型' }]}
          >
            <Select>
              <Option value="狗狗">🐶 狗狗</Option>
              <Option value="猫咪">🐱 猫咪</Option>
              <Option value="其他">🐾 其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="详细描述"
            name="description"
            rules={[{ required: true, message: '请输入详细描述' }]}
          >
            <TextArea rows={4} maxLength={1000} showCount />
          </Form.Item>

          <Form.Item
            label="联系电话"
            name="contact_phone"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="所在地址" name="location">
            <Input />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-3">
              <Button
                type="primary"
                htmlType="submit"
                loading={editLoading}
                className="bg-orange-500 border-orange-500 flex-1"
              >
                保存修改
              </Button>
              <Button onClick={() => setEditModalOpen(false)}>取消</Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PostDetail;