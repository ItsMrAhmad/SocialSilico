const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Post = require('../models/Post');

// ─── User Analytics Overview ────────────────────────────────────────────────────
router.get('/overview', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalPosts, publishedPosts, failedPosts, platformBreakdown] = await Promise.all([
      Post.countDocuments({ user: userId }),
      Post.countDocuments({ user: userId, status: 'published' }),
      Post.countDocuments({ user: userId, status: 'failed' }),
      Post.aggregate([
        { $match: { user: userId } },
        { $unwind: '$platforms' },
        { $group: { _id: '$platforms', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    // Posts per day (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const postsOverTime = await Post.aggregate([
      { $match: { user: userId, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalPosts,
      publishedPosts,
      failedPosts,
      successRate: totalPosts > 0 ? Math.round((publishedPosts / totalPosts) * 100) : 0,
      platformBreakdown: platformBreakdown.map(p => ({ platform: p._id, count: p.count })),
      postsOverTime: postsOverTime.map(p => ({ date: p._id, count: p.count })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
