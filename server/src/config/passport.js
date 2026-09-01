const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-__v');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Helper: find or create user from OAuth profile
const findOrCreateUser = async (profile, provider, accessToken, refreshToken) => {
  let user = await User.findOne({
    $or: [
      { [`oauthProviders.${provider}.id`]: profile.id },
      { email: profile.emails?.[0]?.value }
    ]
  });

  if (!user) {
    user = await User.create({
      name: profile.displayName || profile.username || `${profile.name?.givenName} ${profile.name?.familyName}`,
      email: profile.emails?.[0]?.value || `${profile.id}@${provider}.socialbee`,
      avatar: profile.photos?.[0]?.value || '',
      oauthProviders: {
        [provider]: {
          id: profile.id,
          accessToken,
          refreshToken,
        }
      },
      role: 'user'
    });
  } else {
    // Update tokens
    user.oauthProviders = user.oauthProviders || {};
    user.oauthProviders[provider] = { id: profile.id, accessToken, refreshToken };
    user.lastLogin = new Date();
    await user.save();
  }
  return user;
};

// ─── Google ────────────────────────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'google', accessToken, refreshToken);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));
}

// ─── GitHub ────────────────────────────────────────────────────────────────────
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback',
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'github', accessToken, refreshToken);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));
}

// ─── Facebook ──────────────────────────────────────────────────────────────────
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/api/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'facebook', accessToken, refreshToken);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));
}

// ─── Twitter/X ─────────────────────────────────────────────────────────────────
if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CLIENT_ID,
    consumerSecret: process.env.TWITTER_CLIENT_SECRET,
    callbackURL: '/api/auth/twitter/callback',
    includeEmail: true
  }, async (token, tokenSecret, profile, done) => {
    try {
      const user = await findOrCreateUser(profile, 'twitter', token, tokenSecret);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));
}

module.exports = passport;
