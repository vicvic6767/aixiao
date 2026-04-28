const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'pet-rescue.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create posts table
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      pet_type TEXT NOT NULL,
      description TEXT NOT NULL,
      images TEXT,
      contact_phone TEXT NOT NULL,
      location TEXT,
      status TEXT DEFAULT '待救助',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create test user
  const hashedPassword = bcrypt.hashSync('123456', 10);
  db.run(
    `INSERT OR IGNORE INTO users (username, password, phone) VALUES (?, ?, ?)`,
    ['test', hashedPassword, '13800138000'],
    (err) => {
      if (err) {
        console.log('Test user may already exist');
      } else {
        console.log('Test user created successfully');
      }
    }
  );
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database initialized successfully at:', dbPath);
  }
});