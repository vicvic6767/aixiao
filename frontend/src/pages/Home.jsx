import React, { useState, useEffect } from 'react';
import { Card, Tag, Select, Button, Empty, Spin, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EnvironmentOutlined, PhoneOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Option } = Select;

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

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [petTypeFilter, setPetTypeFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState('全部');
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (petTypeFilter !== '全部') params.petType = petTypeFilter;
      if (statusFilter !== '全部') params.status = statusFilter;
      const res = await api.get('/posts', { params });
      setPosts(res.data.posts);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [petTypeFilter, statusFilter]);

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

  const getFirstImage = (imagesStr) => {
    try {
      const images = JSON.parse(imagesStr || '[]');
      return images.length > 0 ? `http://localhost:3000${images[0]}` : null;
    } catch {
      return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl p-8 mb-8 text-white text-center">
        <div className="text-5xl mb-3">🐾</div>
        <h1 className="text-3xl font-bold mb-2">宠物救助志愿者平台</h1>
        <p className="text-orange-100 text-lg">每一个生命都值得被爱护，加入我们一起帮助流浪动物</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm flex flex-wrap gap-4 items-center">
        <span className="text-gray-600 font-medium">筛选：</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">宠物类型：</span>
          <Select
            value={petTypeFilter}
            onChange={setPetTypeFilter}
            style={{ width: 120 }}
          >
            <Option value="全部">全部</Option>
            <Option value="狗狗">🐶 狗狗</Option>
            <Option value="猫咪">🐱 猫咪</Option>
            <Option value="其他">🐾 其他</Option>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">状态：</span>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
          >
            <Option value="全部">全部</Option>
            <Option value="待救助">待救助</Option>
            <Option value="已救助">已救助</Option>
          </Select>
        </div>
        <Button
          onClick={() => { setPetTypeFilter('全部'); setStatusFilter('全部'); }}
          size="small"
        >
          重置
        </Button>
        <span className="ml-auto text-gray-400 text-sm">共 {posts.length} 条帖子</span>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : posts.length === 0 ? (
        <Empty description="暂无帖子" className="py-20" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const firstImage = getFirstImage(post.images);
            return (
              <Card
                key={post.id}
                hoverable
                className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                cover={
                  firstImage ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={firstImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-orange-50 flex items-center justify-center">
                      <span className="text-6xl">{petTypeEmojis[post.pet_type] || '🐾'}</span>
                    </div>
                  )
                }
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-800 line-clamp-1 flex-1 mr-2">
                    {post.title}
                  </h3>
                  <Tag color={statusColors[post.status] || 'default'} className="shrink-0">
                    {post.status}
                  </Tag>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Tag color="orange">{petTypeEmojis[post.pet_type]} {post.pet_type}</Tag>
                  <span className="text-gray-400 text-sm">by {post.username}</span>
                </div>

                <p className="text-gray-500 text-sm line-clamp-2 mb-3">{post.description}</p>

                <div className="flex flex-col gap-1 text-xs text-gray-400">
                  {post.location && (
                    <span><EnvironmentOutlined className="mr-1" />{post.location}</span>
                  )}
                  <span><ClockCircleOutlined className="mr-1" />{formatDate(post.created_at)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
