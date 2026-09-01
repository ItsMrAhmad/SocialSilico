const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const User = require('../models/User');
const Post = require('../models/Post');

// Apply auth + admin guards to all routes
router.use(protect, requireAdmin);

// ─── Admin Stats Overview ───────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalPosts, bannedUsers, publishedPosts, failedPosts] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'failed' }),
    ]);

    const platformStats = await Post.aggregate([
      { $unwind: '$platformResults' },
      { $group: {
        _id: '$platformResults.platform',
        total: { $sum: 1 },
        success: { $sum: { $cond: [{ $eq: ['$platformResults.status', 'success'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$platformResults.status', 'failed'] }, 1, 0] } },
      }},
      { $sort: { total: -1 } }
    ]);

    // New users per day (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersOverTime = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalUsers, totalPosts, bannedUsers, publishedPosts, failedPosts,
      platformStats,
      newUsersOverTime: newUsersOverTime.map(u => ({ date: u._id, count: u.count })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get All Users ──────────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, banned } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    if (role) filter.role = role;
    if (banned !== undefined) filter.isBanned = banned === 'true';

    const users = await User.find(filter)
      .select('-oauthProviders')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(filter);
    res.json({ users, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get Single User ────────────────────────────────────────────────────────────
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-oauthProviders');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const postCount = await Post.countDocuments({ user: user._id });
    res.json({ user, postCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Ban / Unban User ───────────────────────────────────────────────────────────
router.patch('/users/:id/ban', async (req, res) => {
  try {
    const { ban, reason } = req.body;
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot ban yourself' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: ban, banReason: ban ? reason : '' },
      { new: true }
    ).select('-oauthProviders');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Promote / Demote User ──────────────────────────────────────────────────────
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-oauthProviders');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get All Posts ──────────────────────────────────────────────────────────────
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, platform } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (platform) filter.platforms = platform;

    const posts = await Post.find(filter)
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Post.countDocuments(filter);
    res.json({ posts, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Delete Any Post ────────────────────────────────────────────────────────────
router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
