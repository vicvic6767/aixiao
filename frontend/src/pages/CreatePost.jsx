import React, { useState } from 'react';
import {
  Form, Input, Button, Select, Upload, Card, message, Image
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const CreatePost = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const navigate = useNavigate();

  const handlePreview = async (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(0, 3));
  };

  const customUpload = async ({ file, onSuccess, onError, onProgress }) => {
    const formData = new FormData();
    formData.append('images', file);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          onProgress({ percent: Math.round((e.loaded / e.total) * 100) });
        },
      });
      onSuccess(res.data);
    } catch (err) {
      onError(err);
      message.error('图片上传失败');
    }
  };

  const beforeUpload = (file) => {
    const isImage = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
    if (!isImage) {
      message.error('只支持 JPG/PNG 格式的图片');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB');
      return false;
    }
    return true;
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const images = fileList
        .filter((f) => f.status === 'done' && f.response?.urls)
        .map((f) => f.response.urls[0]);

      await api.post('/posts', {
        title: values.title,
        pet_type: values.pet_type,
        description: values.description,
        images,
        contact_phone: values.contact_phone,
        location: values.location || '',
      });

      message.success('帖子发布成功！');
      navigate('/');
    } catch (err) {
      message.error(err.response?.data?.message || '发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card className="shadow-md rounded-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">发布救助帖子</h1>
          <p className="text-gray-500 mt-1">填写宠物信息，让更多人看到并提供帮助</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            label="帖子标题"
            name="title"
            rules={[{ required: true, message: '请输入帖子标题' }]}
          >
            <Input placeholder="例如：发现一只受伤的流浪狗，急需救助" maxLength={100} showCount />
          </Form.Item>

          <Form.Item
            label="宠物类型"
            name="pet_type"
            rules={[{ required: true, message: '请选择宠物类型' }]}
          >
            <Select placeholder="请选择宠物类型">
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
            <TextArea
              placeholder="请详细描述宠物的情况、发现地点、需要什么帮助等..."
              rows={5}
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item label="上传图片（最多3张，支持拖拽）">
            <Dragger
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              customRequest={customUpload}
              beforeUpload={beforeUpload}
              multiple
              maxCount={3}
              accept=".jpg,.jpeg,.png"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
              <p className="ant-upload-hint">支持 JPG/PNG，单张不超过 5MB，最多 3 张</p>
            </Dragger>
          </Form.Item>

          {previewOpen && (
            <Image
              wrapperStyle={{ display: 'none' }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(''),
              }}
              src={previewImage}
            />
          )}

          <Form.Item
            label="联系电话"
            name="contact_phone"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入您的联系电话" />
          </Form.Item>

          <Form.Item
            label="所在地址"
            name="location"
          >
            <Input placeholder="例如：北京市朝阳区（选填）" />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-3">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-orange-500 border-orange-500 hover:bg-orange-600 flex-1 h-11 text-base font-medium"
              >
                发布帖子
              </Button>
              <Button onClick={() => navigate('/')} className="h-11">
                取消
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreatePost;