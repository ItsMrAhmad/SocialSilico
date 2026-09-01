const axios = require('axios');

const FB_GRAPH = 'https://graph.facebook.com/v19.0';

/**
 * Exchange short-lived User Access Token (1h) for long-lived User Access Token (60 days)
 */
const exchangeLongLivedToken = async (shortLivedToken) => {
  try {
    const res = await axios.get(`${FB_GRAPH}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        fb_exchange_token: shortLivedToken,
      }
    });
    return {
      accessToken: res.data.access_token,
      expiresIn: res.data.expires_in, // in seconds (~60 days)
    };
  } catch (err) {
    console.error('[Facebook] Token exchange error:', err.response?.data?.error?.message || err.message);
    return { accessToken: shortLivedToken, expiresIn: 3600 };
  }
};

/**
 * Post to a Facebook Page (supports text and image attachments)
 * @param {string} pageAccessToken - Facebook Page access token
 * @param {string} pageId - Facebook Page ID
 * @param {string} content - Post message
 * @param {string[]} mediaUrls - Optional media URLs
 */
const postToFacebook = async (pageAccessToken, pageId, content, mediaUrls = []) => {
  if (mediaUrls && mediaUrls.length > 0) {
    // Post as Photo with caption
    const res = await axios.post(`${FB_GRAPH}/${pageId}/photos`, {
      url: mediaUrls[0],
      caption: content,
      access_token: pageAccessToken,
    });
    return { platformPostId: res.data.id || res.data.post_id };
  }

  // Standard Text Feed Post
  const res = await axios.post(`${FB_GRAPH}/${pageId}/feed`, {
    message: content,
    access_token: pageAccessToken,
  });
  return { platformPostId: res.data.id };
};

/**
 * Get Facebook pages the user manages (including page access tokens)
 */
const getFacebookPages = async (userAccessToken) => {
  const res = await axios.get(`${FB_GRAPH}/me/accounts`, {
    params: { access_token: userAccessToken }
  });
  return res.data.data; // array of { id, name, access_token, category }
};

/**
 * Post to Instagram Business Account via Graph API
 * Requires a connected Facebook Page with an Instagram Business Account
 */
const postToInstagram = async (pageAccessToken, igUserId, content, imageUrl) => {
  // Step 1: Create media container
  const containerRes = await axios.post(`${FB_GRAPH}/${igUserId}/media`, {
    image_url: imageUrl,
    caption: content,
    access_token: pageAccessToken,
  });
  const creationId = containerRes.data.id;

  // Step 2: Publish the container
  const publishRes = await axios.post(`${FB_GRAPH}/${igUserId}/media_publish`, {
    creation_id: creationId,
    access_token: pageAccessToken,
  });
  return { platformPostId: publishRes.data.id };
};

/**
 * Get Instagram Business Account IDs linked to Facebook pages
 */
const getInstagramAccounts = async (userAccessToken) => {
  const pages = await getFacebookPages(userAccessToken);
  const igAccounts = [];
  for (const page of pages) {
    try {
      const res = await axios.get(`${FB_GRAPH}/${page.id}`, {
        params: {
          fields: 'instagram_business_account,name,access_token',
          access_token: page.access_token
        }
      });
      if (res.data.instagram_business_account) {
        igAccounts.push({
          igUserId: res.data.instagram_business_account.id,
          pageName: page.name,
          pageId: page.id,
          pageAccessToken: page.access_token,
        });
      }
    } catch (e) {
      // Page may not have an Instagram account
    }
  }
  return igAccounts;
};

module.exports = {
  postToFacebook,
  getFacebookPages,
  postToInstagram,
  getInstagramAccounts,
  exchangeLongLivedToken
};
