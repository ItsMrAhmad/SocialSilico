const { TwitterApi } = require('twitter-api-v2');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

/**
 * Upload an image or video to Twitter v1.1 endpoint to get media_id
 */
const uploadMediaToTwitter = async (client, mediaUrl) => {
  try {
    // If it's a local upload
    if (mediaUrl.includes('/uploads/')) {
      const filename = mediaUrl.split('/uploads/')[1];
      const localPath = path.join(__dirname, '..', '..', '..', 'uploads', filename);
      if (fs.existsSync(localPath)) {
        const mediaId = await client.v1.uploadMedia(localPath);
        return mediaId;
      }
    }

    // If it's a remote URL
    const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    const mediaId = await client.v1.uploadMedia(buffer, { mimeType });
    return mediaId;
  } catch (err) {
    console.error(`[Twitter] Failed to upload media ${mediaUrl}:`, err.message);
    return null;
  }
};

/**
 * Post a tweet using Twitter API v2 (supports text + media attachments)
 * @param {string} accessToken - User's OAuth2 access token
 * @param {string} content - Tweet text
 * @param {string[]} mediaUrls - Optional media URLs
 */
const postTweet = async (accessToken, content, mediaUrls = []) => {
  const client = new TwitterApi(accessToken);
  const rwClient = client.readWrite;

  const tweetPayload = { text: content.slice(0, 280) };

  if (mediaUrls && mediaUrls.length > 0) {
    const mediaIdPromises = mediaUrls.slice(0, 4).map(url => uploadMediaToTwitter(rwClient, url));
    const mediaIds = (await Promise.all(mediaIdPromises)).filter(Boolean);

    if (mediaIds.length > 0) {
      tweetPayload.media = { media_ids: mediaIds };
    }
  }

  const { data } = await rwClient.v2.tweet(tweetPayload);
  return { platformPostId: data.id, url: `https://twitter.com/i/web/status/${data.id}` };
};

/**
 * Get Twitter user info
 */
const getTwitterProfile = async (accessToken) => {
  const client = new TwitterApi(accessToken);
  const me = await client.v2.me({ 'user.fields': ['profile_image_url', 'username', 'name'] });
  return me.data;
};

module.exports = { postTweet, getTwitterProfile };
