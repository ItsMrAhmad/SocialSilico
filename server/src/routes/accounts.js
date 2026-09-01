const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// ─── Get Connected Accounts ─────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('connectedAccounts');
    res.json({ accounts: user.connectedAccounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Connect a Social Account ───────────────────────────────────────────────────
// Called after platform OAuth completes — frontend sends back the token
router.post('/connect', protect, async (req, res) => {
  try {
    const {
      platform, platformUserId, platformUsername, platformName, avatar,
      accessToken, refreshToken, pageId, pageAccessToken
    } = req.body;

    const validPlatforms = ['twitter', 'facebook', 'instagram', 'linkedin'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const user = await User.findById(req.user._id);

    // Check if already connected
    const existingIndex = user.connectedAccounts.findIndex(
      a => a.platform === platform && a.platformUserId === platformUserId
    );

    const accountData = {
      platform, platformUserId, platformUsername, platformName,
      avatar, accessToken, refreshToken, pageId, pageAccessToken,
      isActive: true,
    };

    if (existingIndex > -1) {
      user.connectedAccounts[existingIndex] = {
        ...user.connectedAccounts[existingIndex].toObject(),
        ...accountData
      };
    } else {
      user.connectedAccounts.push(accountData);
    }

    await user.save();
    res.json({ success: true, accounts: user.connectedAccounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Disconnect a Social Account ────────────────────────────────────────────────
router.delete('/:accountId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.connectedAccounts = user.connectedAccounts.filter(
      a => a._id.toString() !== req.params.accountId
    );
    await user.save();
    res.json({ success: true, message: 'Account disconnected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Toggle Account Active State ────────────────────────────────────────────────
router.patch('/:accountId/toggle', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const account = user.connectedAccounts.id(req.params.accountId);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    account.isActive = !account.isActive;
    await user.save();
    res.json({ success: true, isActive: account.isActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
