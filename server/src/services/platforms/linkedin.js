const axios = require('axios');

const LI_API = 'https://api.linkedin.com/v2';

/**
 * Post a text update to LinkedIn
 * @param {string} accessToken - LinkedIn OAuth access token
 * @param {string} personId - LinkedIn Person URN (urn:li:person:{id})
 * @param {string} content - Post text
 */
const postToLinkedIn = async (accessToken, personId, content) => {
  const urn = `urn:li:person:${personId}`;
  const payload = {
    author: urn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: content },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const res = await axios.post(`${LI_API}/ugcPosts`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });

  return { platformPostId: res.data.id || res.headers['x-restli-id'] };
};

/**
 * Get LinkedIn profile
 */
const getLinkedInProfile = async (accessToken) => {
  const res = await axios.get(`${LI_API}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { projection: '(id,localizedFirstName,localizedLastName,profilePicture)' }
  });
  return res.data;
};

module.exports = { postToLinkedIn, getLinkedInProfile };
