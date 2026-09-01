const mongoose = require('mongoose');

const connectedAccountSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['twitter', 'facebook', 'instagram', 'linkedin'],
    required: true
  },
  platformUserId: { type: String, required: true },
  platformUsername: { type: String },
  platformName: { type: String },
  avatar: { type: String },
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  tokenExpiry: { type: Date },
  pageId: { type: String },        // for Facebook Pages / Instagram Business
  pageAccessToken: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, sparse: true, trim: true, lowercase: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },

  // OAuth sign-in providers (for authentication only)
  oauthProviders: {
    google: { id: String, accessToken: String, refreshToken: String },
    github: { id: String, accessToken: String, refreshToken: String },
    facebook: { id: String, accessToken: String, refreshToken: String },
    twitter: { id: String, accessToken: String, tokenSecret: String },
  },

  // Connected social media accounts for POSTING
  connectedAccounts: [connectedAccountSchema],

  lastLogin: { type: Date, default: Date.now },
  postsCount: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.index({ 'oauthProviders.google.id': 1 });
userSchema.index({ 'oauthProviders.github.id': 1 });
userSchema.index({ 'oauthProviders.facebook.id': 1 });
userSchema.index({ 'oauthProviders.twitter.id': 1 });

module.exports = mongoose.model('User', userSchema);
