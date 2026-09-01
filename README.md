# 🐝 SocialBee — Social Media Manager

A full-stack social media manager that lets you post to **Twitter/X, Facebook, Instagram, and LinkedIn** with a single click. Secure OAuth sign-in — we never see your passwords.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **MongoDB** (local or Atlas)
- API keys for the social platforms you want to use

### 1. Start the Backend
```bash
cd socialbee/server
cp .env.example .env
# Fill in your API keys in .env
npm run dev
```

### 2. Start the Frontend
```bash
cd socialbee/client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔑 API Keys Setup

You need developer accounts on the platforms you want to support.

### Google OAuth (Sign in with Google)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add callback URL: `http://localhost:5000/api/auth/google/callback`
4. Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`

### GitHub OAuth (Sign in with GitHub)
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create an OAuth App
3. Callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy to `.env`

### Twitter / X (Sign in + Posting)
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Create an app with **OAuth 1.0a** (for sign-in) + **OAuth 2.0 User Context** (for tweeting)
3. Callback URL: `http://localhost:5000/api/auth/twitter/callback`
4. Needs **Basic** tier for posting (free tier = read only)

### Facebook + Instagram (Sign in + Posting)
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create an app, add **Facebook Login** and **Instagram Graph API** products
3. Callback URL: `http://localhost:5000/api/auth/facebook/callback`
4. Instagram posting requires a **Business/Creator account** linked to a Facebook Page

### LinkedIn (Posting)
1. Go to [linkedin.com/developers](https://www.linkedin.com/developers)
2. Create an app, request `w_member_social` permission
3. Add callback URL

---

## 🛡️ First Admin Setup

After signing in for the first time, run:
```bash
cd socialbee/server
npm run seed-admin
```
This promotes the first user in the database to admin.

---

## ✨ Features

| Feature | Description |
|---|---|
| OAuth Sign-in | Google, GitHub, Twitter, Facebook — no passwords stored |
| Multi-platform Posting | Post to Twitter, Facebook, Instagram, LinkedIn simultaneously |
| Platform Selector | Choose which platforms for each post |
| Media Upload | Attach up to 4 images per post |
| Post Scheduling | Schedule posts for a future date/time |
| Post History | View all posts with per-platform success/failure status |
| Analytics | Charts: posts over time, platform breakdown, success rates |
| **Admin Panel** | User management, post monitoring, platform stats |
| Admin: Ban/Unban | Suspend and restore user accounts |
| Admin: Promote | Promote users to admin or demote admins |

---

## 🗂️ Project Structure

```
socialbee/
├── client/          # React + Vite frontend
│   └── src/
│       ├── pages/   # Landing, Login, Dashboard, Compose, Accounts, Analytics
│       │   └── admin/  # AdminDashboard, AdminUsers, AdminPosts
│       ├── components/layout/AppLayout.jsx
│       ├── store/authStore.js   # Zustand state
│       └── index.css            # Full design system
│
└── server/          # Node.js + Express backend
    └── src/
        ├── config/  # db.js, passport.js
        ├── models/  # User.js, Post.js
        ├── routes/  # auth, posts, accounts, analytics, admin
        ├── middleware/ # auth.js, admin.js
        └── services/platforms/ # twitter, facebook, linkedin adapters
```

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, React Router, Zustand, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | Passport.js (OAuth 2.0), JWT |
| Platforms | Twitter API v2, Facebook Graph API, Instagram Graph API, LinkedIn UGC API |
| Styling | Vanilla CSS (custom design system) |
