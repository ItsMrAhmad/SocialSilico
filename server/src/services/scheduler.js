const cron = require('node-cron');
const Post = require('../models/Post');
const User = require('../models/User');
const { postTweet } = require('./platforms/twitter');
const { postToFacebook, postToInstagram } = require('./platforms/facebook');
const { postToLinkedIn } = require('./platforms/linkedin');

const publishToPlatform = async (platform, account, content, mediaUrls) => {
  if (account.accessToken?.startsWith('token_') || account.accessToken === 'mock_token') {
    return { platformPostId: `${platform}_sim_${Date.now()}` };
  }

  switch (platform) {
    case 'twitter':
      return postTweet(account.accessToken, content, mediaUrls);
    case 'facebook':
      return postToFacebook(account.pageAccessToken || account.accessToken, account.pageId || account.platformUserId, content);
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

const processScheduledPosts = async () => {
  try {
    const now = new Date();
    const duePosts = await Post.find({
      status: 'scheduled',
      scheduledAt: { $lte: now }
    }).populate('user');

    if (duePosts.length === 0) return;

    console.log(`[Scheduler] ⏰ Found ${duePosts.length} scheduled post(s) ready to publish.`);

    for (const post of duePosts) {
      post.status = 'publishing';
      await post.save();

      const user = await User.findById(post.user._id || post.user);
      if (!user) {
        post.status = 'failed';
        post.platformResults = post.platforms.map(p => ({
          platform: p,
          status: 'failed',
          error: 'User not found or deleted'
        }));
        await post.save();
        continue;
      }

      const mediaUrls = (post.media || []).map(m => {
        if (m.url.startsWith('http')) return m.url;
        const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
        return `${serverUrl}${m.url}`;
      });

      const results = await Promise.allSettled(
        post.platforms.map(async (platform) => {
          const account = user.connectedAccounts.find(
            a => a.platform === platform && a.isActive
          );
          if (!account) throw new Error(`No active ${platform} account connected`);

          const res = await publishToPlatform(platform, account, post.content, mediaUrls);
          return { platform, ...res };
        })
      );

      let hasSuccess = false;
      let hasFailed = false;
      const platformResults = results.map((r, i) => {
        const platform = post.platforms[i];
        if (r.status === 'fulfilled') {
          hasSuccess = true;
          return {
            platform,
            status: 'success',
            platformPostId: r.value.platformPostId,
            postedAt: new Date()
          };
        } else {
          hasFailed = true;
          return {
            platform,
            status: 'failed',
            error: r.reason?.message || 'Failed to publish'
          };
        }
      });

      const finalStatus = hasSuccess && hasFailed ? 'partial' : hasSuccess ? 'published' : 'failed';
      post.platformResults = platformResults;
      post.status = finalStatus;
      post.publishedAt = hasSuccess ? new Date() : null;
      await post.save();

      if (hasSuccess) {
        await User.findByIdAndUpdate(user._id, { $inc: { postsCount: 1 } });
      }

      console.log(`[Scheduler] ✅ Processed post ${post._id} -> Status: ${finalStatus}`);
    }
  } catch (error) {
    console.error('[Scheduler] ❌ Error in scheduled posts worker:', error);
  }
};

const initScheduler = () => {
  // Check every minute
  cron.schedule('* * * * *', () => {
    processScheduledPosts();
  });
  console.log('⏰ SocialSilico Post Scheduler initialized (running every minute)');
};

module.exports = { initScheduler, processScheduledPosts };
