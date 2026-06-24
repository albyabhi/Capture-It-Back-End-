const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();
const Account = require('../models/AccountSchema');
const RefreshToken = require('../models/RefreshTokenSchema');
const Room = require('../models/RoomSchema');
const verifyAccountToken = require('../Middleware/verifyAccountToken');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function generateAccessToken(accountId) {
  return jwt.sign({ accountId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

function setRefreshTokenCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: '/auth',
  });
}

// Signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ message: 'Password must contain uppercase, lowercase, and number.' });
  }

  try {
    const existingAccount = await Account.findOne({ $or: [{ email }, { username }] });
    if (existingAccount) {
      const field = existingAccount.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(409).json({ message: `${field} already in use.` });
    }

    const account = new Account({ username, email, passwordHash: password });
    await account.save();

    const accessToken = generateAccessToken(account._id);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await new RefreshToken({ account: account._id, token: refreshToken, expiresAt }).save();
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({ message: 'Account created.', account, accessToken });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Error creating account.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const account = await Account.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!account) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await account.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const accessToken = generateAccessToken(account._id);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await new RefreshToken({ account: account._id, token: refreshToken, expiresAt }).save();
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({ message: 'Login successful.', account, accessToken });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error during login.' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token.' });
  }

  try {
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token.' });
    }

    const accessToken = generateAccessToken(tokenDoc.account);
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({ message: 'Error refreshing token.' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
  res.clearCookie('refreshToken', { path: '/auth' });
  return res.status(200).json({ message: 'Logged out.' });
});

// Get current account
router.get('/me', verifyAccountToken, async (req, res) => {
  try {
    const account = await Account.findById(req.accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    return res.status(200).json({ account });
  } catch (error) {
    console.error('Get account error:', error);
    return res.status(500).json({ message: 'Error fetching account.' });
  }
});

// Update profile
router.put('/profile', verifyAccountToken, async (req, res) => {
  const { username, email } = req.body;

  try {
    const account = await Account.findById(req.accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    if (email && email.toLowerCase() !== account.email) {
      const emailExists = await Account.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(409).json({ message: 'Email already in use.' });
      }
      account.email = email.toLowerCase();
    }

    if (username && username !== account.username) {
      const usernameExists = await Account.findOne({ username });
      if (usernameExists) {
        return res.status(409).json({ message: 'Username already in use.' });
      }
      account.username = username;
    }

    await account.save();
    return res.status(200).json({ message: 'Profile updated.', account });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ message: 'Error updating profile.' });
  }
});

// Change password
router.put('/password', verifyAccountToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters.' });
  }

  if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return res.status(400).json({ message: 'New password must contain uppercase, lowercase, and number.' });
  }

  try {
    const account = await Account.findById(req.accountId).select('+passwordHash');
    if (!account) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    const isMatch = await account.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    account.passwordHash = newPassword;
    await account.save();

    await RefreshToken.deleteMany({ account: account._id });
    res.clearCookie('refreshToken', { path: '/auth' });

    return res.status(200).json({ message: 'Password changed. Please login again.' });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ message: 'Error changing password.' });
  }
});

// Get my events
router.get('/my-events', verifyAccountToken, async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.accountId }).sort({ created_date: -1 });
    return res.status(200).json({ rooms });
  } catch (error) {
    console.error('Fetch my events error:', error);
    return res.status(500).json({ message: 'Error fetching events.' });
  }
});

module.exports = router;
