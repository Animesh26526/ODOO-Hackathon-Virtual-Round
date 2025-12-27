const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected route (dashboard)
router.get('/dashboard', authMiddleware, (req, res) => {
  res.json({ message: `Welcome to the dashboard, role: ${req.user.role}` });
});

module.exports = router;
