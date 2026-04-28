const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const router = express.Router();
const dbPath = path.join(__dirname, '..', 'pet-rescue.db');

// Get all posts with optional filters
router.get('/', (req, res) => {
  const { petType, status } = req.query;
  let query = `
    SELECT p.*, u.username 
    FROM posts p 
    JOIN users u ON p.user_id = u.id 
    WHERE 1=1
  `;
  const params = [];

  if (petType && petType !== '全部') {
    query += ' AND p.pet_type = ?';
    params.push(petType);
  }
  if (status && status !== '全部') {
    query += ' AND p.status = ?';
    params.push(status);
  }

  query += ' ORDER BY p.created_at DESC';

  const db = new sqlite3.Database(dbPath);
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: '获取帖子列表失败' });
    }
    res.json({ posts: rows });
  });
  db.close();
});

// Get single post
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = new sqlite3.Database(dbPath);

  db.get(
    `SELECT p.*, u.username 
     FROM posts p 
     JOIN users u ON p.user_id = u.id 
     WHERE p.id = ?`,
    [id],
    (err, post) => {
      if (err || !post) {
        return res.status(404).json({ message: '帖子不存在' });
      }
      res.json({ post });
    }
  );
  db.close();
});

// Create post
router.post(
  '/',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('标题不能为空'),
    body('pet_type').notEmpty().withMessage('宠物类型不能为空'),
    body('description').notEmpty().withMessage('描述不能为空'),
    body('contact_phone').notEmpty().withMessage('联系电话不能为空'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, pet_type, description, images, contact_phone, location } = req.body;
    const imagesJson = images ? JSON.stringify(images) : '[]';

    const db = new sqlite3.Database(dbPath);
    db.run(
      `INSERT INTO posts (user_id, title, pet_type, description, images, contact_phone, location) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, title, pet_type, description, imagesJson, contact_phone, location || ''],
      function (err) {
        if (err) {
          return res.status(500).json({ message: '发布失败' });
        }
        res.json({ message: '发布成功', postId: this.lastID });
      }
    );
    db.close();
  }
);

// Update post
router.put(
  '/:id',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('标题不能为空'),
    body('pet_type').notEmpty().withMessage('宠物类型不能为空'),
    body('description').notEmpty().withMessage('描述不能为空'),
    body('contact_phone').notEmpty().withMessage('联系电话不能为空'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { title, pet_type, description, images, contact_phone, location } = req.body;
    const imagesJson = images ? JSON.stringify(images) : '[]';

    const db = new sqlite3.Database(dbPath);

    // Check if post belongs to user
    db.get('SELECT user_id FROM posts WHERE id = ?', [id], (err, post) => {
      if (err || !post) {
        return res.status(404).json({ message: '帖子不存在' });
      }
      if (post.user_id !== req.userId) {
        return res.status(403).json({ message: '无权限修改此帖子' });
      }

      db.run(
        `UPDATE posts SET title = ?, pet_type = ?, description = ?, images = ?, contact_phone = ?, location = ? 
         WHERE id = ?`,
        [title, pet_type, description, imagesJson, contact_phone, location || '', id],
        (err) => {
          if (err) {
            return res.status(500).json({ message: '修改失败' });
          }
          res.json({ message: '修改成功' });
        }
      );
    });
    db.close();
  }
);

// Delete post
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const db = new sqlite3.Database(dbPath);

  db.get('SELECT user_id, images FROM posts WHERE id = ?', [id], (err, post) => {
    if (err || !post) {
      return res.status(404).json({ message: '帖子不存在' });
    }
    if (post.user_id !== req.userId) {
      return res.status(403).json({ message: '无权限删除此帖子' });
    }

    // Delete associated images
    try {
      const images = JSON.parse(post.images || '[]');
      images.forEach((img) => {
        const imagePath = path.join(__dirname, '..', 'uploads', path.basename(img));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    } catch (e) {
      // Ignore image deletion errors
    }

    db.run('DELETE FROM posts WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ message: '删除失败' });
      }
      res.json({ message: '删除成功' });
    });
  });
  db.close();
});

// Update post status
router.put(
  '/:id/status',
  authMiddleware,
  [body('status').isIn(['待救助', '已救助']).withMessage('状态无效')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { status } = req.body;
    const db = new sqlite3.Database(dbPath);

    db.get('SELECT user_id FROM posts WHERE id = ?', [id], (err, post) => {
      if (err || !post) {
        return res.status(404).json({ message: '帖子不存在' });
      }
      if (post.user_id !== req.userId) {
        return res.status(403).json({ message: '无权限修改此帖子' });
      }

      db.run('UPDATE posts SET status = ? WHERE id = ?', [status, id], (err) => {
        if (err) {
          return res.status(500).json({ message: '修改状态失败' });
        }
        res.json({ message: '状态更新成功' });
      });
    });
    db.close();
  }
);

module.exports = router;