import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, message } from 'antd';
import { PlusOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { isLoggedIn, getUser, clearAuth } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    message.success('已退出登录');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-bold text-orange-500">宠物救助平台</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              <span className="text-gray-600 hidden sm:inline">
                <UserOutlined className="mr-1" />
                {user?.username}
              </span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/create-post')}
                className="bg-orange-500 border-orange-500 hover:bg-orange-600"
              >
                发布帖子
              </Button>
              <Button
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                退出
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => navigate('/login')}>登录</Button>
              <Button
                type="primary"
                onClick={() => navigate('/register')}
                className="bg-orange-500 border-orange-500"
              >
                注册
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
