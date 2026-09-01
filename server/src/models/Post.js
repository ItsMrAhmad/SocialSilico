const mongoose = require('mongoose');

const platformResultSchema = new mongoose.Schema({
  platform: { type: String, enum: ['twitter', 'facebook', 'instagram', 'linkedin'] },
  accountId: { type: mongoose.Schema.Types.ObjectId },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
  platformPostId: { type: String },
  error: { type: String },
  postedAt: { type: Date },
}, { _id: false });

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, required: true, maxlength: 5000 },
  media: [{
    url: { type: String },
    type: { type: String, enum: ['image', 'video'] },
    mimeType: { type: String },
  }],
  platforms: [{
    type: String,
    enum: ['twitter', 'facebook', 'instagram', 'linkedin']
  }],
  platformResults: [platformResultSchema],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'publishing', 'published', 'partial', 'failed'],
    default: 'draft',
    index: true
  },
  scheduledAt: { type: Date, index: true },
  publishedAt: { type: Date },

  // Platform-specific overrides
  twitterContent: { type: String },
  facebookContent: { type: String },
  instagramContent: { type: String },
  linkedinContent: { type: String },
}, { timestamps: true });

postSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
