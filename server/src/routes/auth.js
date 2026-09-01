const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'jwt_secret',
    { expiresIn: '14d' }
  );
};


const redirectWithToken = (res, user) => {
  const token = generateToken(user);
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(`${clientUrl}/auth/callback?token=${token}`);
};

// ─── Current User ───────────────────────────────────────────────────────────────
router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const user = req.user.toObject();
  delete user.oauthProviders;
  res.json({ user });
});

// ─── Logout ─────────────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
  });
});

// ─── Google ─────────────────────────────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed` }),
  (req, res) => redirectWithToken(res, req.user)
);

// ─── GitHub ─────────────────────────────────────────────────────────────────────
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL}/login?error=github_failed` }),
  (req, res) => redirectWithToken(res, req.user)
);

// ─── Facebook ───────────────────────────────────────────────────────────────────
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
);
router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: `${process.env.CLIENT_URL}/login?error=facebook_failed` }),
  (req, res) => redirectWithToken(res, req.user)
);

// ─── Twitter/X ──────────────────────────────────────────────────────────────────
router.get('/twitter',
  passport.authenticate('twitter')
);
router.get('/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: `${process.env.CLIENT_URL}/login?error=twitter_failed` }),
  (req, res) => redirectWithToken(res, req.user)
);

// ─── Token Verify ───────────────────────────────────────────────────────────────
router.post('/verify', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret');
    res.json({ valid: true, decoded });
  } catch {
    res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
});

module.exports = router;
