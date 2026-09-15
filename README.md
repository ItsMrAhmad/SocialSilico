# ⚡ SocialSilico — Social Media Manager

> Built by **[TechsistLabs](https://techsistlabs.com)**.

A full-stack social media automation and management platform that lets you publish and schedule content to **Twitter/X, Facebook, Instagram, and LinkedIn** with a single click. Powered by secure OAuth 2.0 authentication — zero password storage.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **MongoDB** (Atlas or local)
- API keys for social networks you want to connect

### 1. Start the Backend
```bash
cd server
cp .env.example .env
# Configure your MongoDB URI & API keys in .env
npm install
npm run dev
```

### 2. Start the Frontend
```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🎨 Brand Identity

- **Name**: SocialSilico
- **Primary Palette**: Indigo (`#4F46E5`), Violet (`#7C3AED`), Purple (`#9333EA`)
- **Typography**: Montserrat (Headings / Wordmark), Inter (UI & Body)

---

## 🔑 API Keys Setup

### Google OAuth (Sign in with Google)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 Web credentials
3. Authorized Redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`

### GitHub OAuth (Sign in with GitHub)
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create an OAuth App
3. Authorization Callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to `.env`

### Twitter / X (Sign in + Posting)
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Configure App with **OAuth 2.0 User Context** (Read & Write permissions)
3. Callback URL: `http://localhost:5000/api/auth/twitter/callback`
4. Copy `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` to `.env`

### Facebook + Instagram (Sign in + Page/IG Posting)
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create app, add **Facebook Login** product
3. Valid OAuth Redirect URI: `http://localhost:5000/api/auth/facebook/callback`
4. Copy `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` to `.env`

### LinkedIn (Posting)
1. Go to [linkedin.com/developers](https://www.linkedin.com/developers)
2. Request `w_member_social` permission
3. Add callback URL to `.env`

---

## 🛡️ First Admin Setup

After signing in for the first time, run:
```bash
cd server
npm run seed-admin
```
This promotes the first registered user to **admin** with access to the Admin Panel.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Zero Passwords** | 100% OAuth 2.0 (Google, GitHub, Twitter, Facebook) |
| **Multi-Network Posting** | Post to Twitter/X, Facebook, Instagram, LinkedIn simultaneously |
| **Live Mockup Preview** | Real-time card previews for each platform before publishing |
| **Media Attachments** | Multi-image & video upload support with automated Twitter v1.1 upload |
| **Background Cron Scheduler** | Automatically publishes posts when scheduled date/time arrives |
| **Retry Failed Posts** | One-click instant retry for failed/partial network deliveries |
| **Analytics Dashboard** | Engagement tracking, platform performance breakdown, success rates |
| **Role-Gated Admin Panel** | Manage users, promote/demote admins, suspend/ban accounts, view all posts |
| **Dark / Light Mode** | Fluid theme switching with persistent local storage |

---

## 🗂️ Project Structure

```
SocialSilico/
├── client/          # React + Vite frontend
│   ├── public/      # Favicon, SVGs, PNG icons
│   └── src/
│       ├── pages/   # Landing, Login, Dashboard, Compose, Accounts, Analytics
│       │   └── admin/  # AdminDashboard, AdminUsers, AdminPosts
│       ├── components/common/SocialSilicoLogo.jsx
│       ├── components/layout/AppLayout.jsx
│       ├── store/authStore.js   # Zustand authentication state
│       └── index.css            # SocialSilico violet/indigo design system
│
└── server/          # Node.js + Express backend
    └── src/
        ├── config/  # db.js, passport.js
        ├── models/  # User.js, Post.js
        ├── routes/  # auth, posts, accounts, analytics, admin
        ├── middleware/ # auth.js, admin.js
        └── services/   # scheduler.js (node-cron) & platform adapters
```
