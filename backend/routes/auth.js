const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const dbPath = path.join(__dirname, '..', 'pet-rescue.db');

// Register
router.post(
  '/register',
  [
    body('username').isLength({ min: 3, max: 20 }).withMessage('用户名长度3-20个字符'),
    body('password').isLength({ min: 6, max: 20 }).withMessage('密码长度6-20个字符'),
    body('phone').matches(/^1[3-9]\d{9}$/).withMessage('请输入正确的手机号'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { username, password, phone } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const db = new sqlite3.Database(dbPath);
    db.run(
      'INSERT INTO users (username, password, phone) VALUES (?, ?, ?)',
      [username, hashedPassword, phone],
      function (err) {
        if (err) {
          return res.status(400).json({ message: '用户名已存在' });
        }
        res.json({ message: '注册成功', userId: this.lastID });
      }
    );
    db.close();
  }
);

// Login
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('请输入用户名'),
    body('password').notEmpty().withMessage('请输入密码'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { username, password } = req.body;
    const db = new sqlite3.Database(dbPath);

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (err || !user) {
        return res.status(400).json({ message: '用户名或密码错误' });
      }

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: '用户名或密码错误' });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: '登录成功',
        token,
        user: { id: user.id, username: user.username, phone: user.phone },
      });
    });
    db.close();
  }
);

// Get user info
router.get('/user/info', authMiddleware, (req, res) => {
  const db = new sqlite3.Database(dbPath);

  db.get('SELECT id, username, phone FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({ user });
  });
  db.close();
});

module.exports = router;