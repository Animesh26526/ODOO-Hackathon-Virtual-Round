const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// ---------------- REGISTER ----------------
async function register(req, res) {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ error: 'Missing fields: name, email, password, confirmPassword, role required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role }
    });

    const { password: _p, ...safe } = user;
    res.status(201).json(safe);
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
}

// ---------------- LOGIN ----------------
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields: email, password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

    const { password: _p, ...safe } = user;
    res.json({ token, user: safe, redirect: '/dashboard' });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Server error during login' });
  }
}

// ---------------- FORGOT PASSWORD ----------------
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate short-lived reset token
    const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });

    // In production: send via email. For simplicity: return link in response
    const resetLink = `https://frontend-app.com/reset-password?token=${resetToken}`;

    res.json({ message: 'Password reset link generated', resetLink });
  } catch (err) {
    console.error('Forgot password error', err);
    res.status(500).json({ error: 'Server error during forgot password' });
  }
}

// ---------------- RESET PASSWORD ----------------
async function resetPassword(req, res) {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Missing fields: token, newPassword, confirmPassword required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired reset token' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashed }
    });

    res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (err) {
    console.error('Reset password error', err);
    res.status(500).json({ error: 'Server error during password reset' });
  }
}

module.exports = { register, login, forgotPassword, resetPassword };
