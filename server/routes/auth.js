const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name is required and must be at least 2 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password is required and must be at least 6 characters long.' });
    }

    if (phone && typeof phone === 'string' && phone.trim().length > 0) {
      const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;
      if (!phoneRegex.test(phone.trim())) {
        return res.status(400).json({ error: 'Phone number format is invalid.' });
      }
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existingUsers = await query('SELECT * FROM users WHERE email = ?', [trimmedEmail]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), trimmedEmail, hashedPassword, 'user', phone ? phone.trim() : '']
    );

    const userId = result.insertId;
    const token = jwt.sign({ id: userId, email: trimmedEmail, role: 'user', name: name.trim() }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: { id: userId, name: name.trim(), email: trimmedEmail, role: 'user', phone: phone ? phone.trim() : '' }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login (User or Admin)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const users = await query('SELECT * FROM users WHERE email = ?', [trimmedEmail]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    // Authenticate securely against stored bcrypt password hash
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(users[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error fetching profile.' });
  }
});

// Update current user profile
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    }

    if (phone && typeof phone === 'string' && phone.trim().length > 0) {
      const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;
      if (!phoneRegex.test(phone.trim())) {
        return res.status(400).json({ error: 'Phone number format is invalid.' });
      }
    }

    await query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name.trim(), phone ? phone.trim() : '', req.user.id]);

    const updatedUsers = await query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json({
      message: 'Profile updated successfully!',
      user: updatedUsers[0]
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error updating profile.' });
  }
});

module.exports = router;
