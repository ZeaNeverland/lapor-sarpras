const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, nama, email, role } = req.body;

    // Check if user exists
    const { data: existingUser, error: existingError } = await db.from('users').select('*').or(`username.eq.${username},email.eq.${email}`).single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username atau email sudah digunakan'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data, error } = await db.from('users').insert({
      username,
      password: hashedPassword,
      nama,
      email,
      role: role || 'user'
    }).select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: data[0].id
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering user'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password, selectedRole } = req.body;

    // Build query based on whether role is specified
    let query = db.from('users').select('*').eq('username', username);

    // If role is specified, filter by that role
    if (selectedRole) {
      query = query.eq('role', selectedRole);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in'
    });
  }
});

module.exports = router;
