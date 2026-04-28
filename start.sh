#!/bin/bash

echo "🐾 正在启动宠物救助志愿者平台..."
echo ""

# 启动后端
echo "🔧 启动后端服务器 (端口 3000)..."
cd backend
node server.js &
BACKEND_PID=$!

# 等待后端启动
sleep 2

# 启动前端
echo "🌐 启动前端开发服务器 (端口 5173)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 平台启动完成！"
echo "📱 前端地址: http://localhost:5173"
echo "⚙️  后端地址: http://localhost:3000"
echo ""
echo "📋 测试账号:"
echo "   用户名: test"
echo "   密码:   123456"
echo ""
echo "⚠️  按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait