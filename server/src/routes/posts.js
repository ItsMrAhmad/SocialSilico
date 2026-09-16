const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const { protect } = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const { postTweet } = require('../services/platforms/twitter');
const { postToFacebook, postToInstagram } = require('../services/platforms/facebook');
const { postToLinkedIn } = require('../services/platforms/linkedin');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// Publish post to a specific platform
const publishToPlatform = async (platform, account, content, mediaUrls) => {
  if (account.accessToken?.startsWith('token_') || account.accessToken === 'mock_token') {
    return { platformPostId: `${platform}_sim_${Date.now()}` };
  }

  switch (platform) {
    case 'twitter':
      return postTweet(account.accessToken, content, mediaUrls);
    case 'facebook':
      return postToFacebook(account.pageAccessToken || account.accessToken, account.pageId || account.platformUserId, content, mediaUrls);
    case 'instagram': {
      const imageUrl = mediaUrls[0];
      if (!imageUrl) throw new Error('Instagram requires at least one image URL');
      return postToInstagram(account.pageAccessToken || account.accessToken, account.platformUserId, content, imageUrl);
    }
    case 'linkedin':
      return postToLinkedIn(account.accessToken, account.platformUserId, content);
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
};

// ─── Create & Publish Post ──────────────────────────────────────────────────────
router.post('/', protect, upload.array('media', 4), async (req, res) => {
  try {
    const { content, platforms, scheduledAt } = req.body;
    const selectedPlatforms = JSON.parse(platforms || '[]');

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }
    if (!selectedPlatforms.length) {
      return res.status(400).json({ error: 'Select at least one platform' });
    }

    const user = await User.findById(req.user._id);
    const mediaFiles = req.files?.map(f => ({
      url: `/uploads/${f.filename}`,
      type: f.mimetype.startsWith('video') ? 'video' : 'image',
      mimeType: f.mimetype,
    })) || [];

    const mediaUrls = mediaFiles.map(m => `${process.env.SERVER_URL || 'http://localhost:5000'}${m.url}`);

    // Create post record
    const post = await Post.create({
      user: user._id,
      content,
      media: mediaFiles,
      platforms: selectedPlatforms,
      status: scheduledAt ? 'scheduled' : 'publishing',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      platformResults: selectedPlatforms.map(p => ({ platform: p, status: 'pending' })),
    });

    // If scheduled, return and let scheduler handle it
    if (scheduledAt) {
      return res.json({ success: true, post, message: 'Post scheduled successfully' });
    }

    // Publish NOW to all selected platforms
    const results = await Promise.allSettled(
      selectedPlatforms.map(async (platform) => {
        const account = user.connectedAccounts.find(
          a => a.platform === platform && a.isActive
        );
        if (!account) throw new Error(`No connected ${platform} account`);

        const result = await publishToPlatform(platform, account, content, mediaUrls);
        return { platform, ...result };
      })
    );

    // Update platform results
    let hasSuccess = false;
    let hasFailed = false;
    const platformResults = results.map((r, i) => {
      const platform = selectedPlatforms[i];
      if (r.status === 'fulfilled') {
        hasSuccess = true;
        return { platform, status: 'success', platformPostId: r.value.platformPostId, postedAt: new Date() };
      } else {
        hasFailed = true;
        return { platform, status: 'failed', error: r.reason?.message };
      }
    });

    const finalStatus = hasSuccess && hasFailed ? 'partial' : hasSuccess ? 'published' : 'failed';
    post.platformResults = platformResults;
    post.status = finalStatus;
    post.publishedAt = hasSuccess ? new Date() : null;
    await post.save();

    // Update user post count
    await User.findByIdAndUpdate(user._id, { $inc: { postsCount: 1 } });

    res.json({
      success: true,
      post,
      platformResults,
      message: `Post ${finalStatus === 'published' ? 'published' : finalStatus === 'partial' ? 'partially published' : 'failed'}`
    });
  } catch (err) {
    console.error('Post error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Get User Posts ─────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Post.countDocuments(filter);
    res.json({ posts, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Get Single Post ────────────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, user: req.user._id });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Retry Failed Post ─────────────────────────────────────────────────────────
router.post('/:id/retry', protect, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, user: req.user._id });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const user = await User.findById(req.user._id);
    const mediaUrls = (post.media || []).map(m => {
      if (m.url.startsWith('http')) return m.url;
      const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
      return `${serverUrl}${m.url}`;
    });

    // Identify failed or pending platforms
    const failedPlatforms = post.platformResults
      .filter(r => r.status === 'failed' || r.status === 'pending')
      .map(r => r.platform);

    const platformsToRetry = failedPlatforms.length > 0 ? failedPlatforms : post.platforms;

    const retryResults = await Promise.allSettled(
      platformsToRetry.map(async (platform) => {
        const account = user.connectedAccounts.find(
          a => a.platform === platform && a.isActive
        );
        if (!account) throw new Error(`No active ${platform} account connected`);

        const result = await publishToPlatform(platform, account, post.content, mediaUrls);
        return { platform, ...result };
      })
    );

    // Merge results
    retryResults.forEach((r, i) => {
      const platform = platformsToRetry[i];
      const existingIdx = post.platformResults.findIndex(pr => pr.platform === platform);
      const newResult = r.status === 'fulfilled'
        ? { platform, status: 'success', platformPostId: r.value.platformPostId, postedAt: new Date(), error: null }
        : { platform, status: 'failed', error: r.reason?.message || 'Retry failed' };

      if (existingIdx > -1) {
        post.platformResults[existingIdx] = newResult;
      } else {
        post.platformResults.push(newResult);
      }
    });

    const hasSuccess = post.platformResults.some(r => r.status === 'success');
    const hasFailed = post.platformResults.some(r => r.status === 'failed' || r.status === 'pending');
    post.status = hasSuccess && hasFailed ? 'partial' : hasSuccess ? 'published' : 'failed';
    if (hasSuccess && !post.publishedAt) post.publishedAt = new Date();

    await post.save();

    res.json({
      success: true,
      post,
      message: `Retry completed. Status: ${post.status}`
    });
  } catch (err) {
    console.error('Retry error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
