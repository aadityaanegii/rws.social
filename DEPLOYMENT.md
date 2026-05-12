# Deployment Guide

This app uses a full-stack architecture (Express + Socket.io for Real-time Chat + MongoDB). 
Because it relies on **WebSockets** (Socket.io) to support instant messaging, online presence, and typing indicators, there are specific hosting requirements you should be aware of.

## ⚠️ Important Vercel Limitations

**Vercel is a Serverless platform. Serverless functions do NOT support WebSockets or long-running processes.**
If you try to host the entire backend on Vercel:
- Instantly delivered messages via Socket.io will fail.
- Live user status (Online/Offline) will not work properly.
- The server will crash or drop requests frequently due to timeout constraints on Serverless.

Therefore, you must separate the frontend from the backend if you wish to use Vercel.

## Recommended Approach

You have two main paths to deploy this app depending on whether you need real-time chat (socket.io) to work perfectly.

### Approach 1: Full-Stack on Vercel (Easiest)
You can deploy this entire repository directly to Vercel. We have added a serverless fallback (`/api/index.ts`) so your backend will work on Vercel.
**However**, because Vercel is serverless, WebSockets will fallback to long-polling and may drop connections/status updates.
1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster and get your connection string.
2. In Vercel, import your repository.
3. In the Environment Variables section, add:
   - `MONGODB_URI` = `your_mongodb_connection_string` (Required!)
   - `JWT_SECRET` = `any_secret_random_string`
   - `CLOUDINARY_CLOUD_NAME` = `...` (optional)
   - `CLOUDINARY_API_KEY` = `...` (optional)
   - `CLOUDINARY_API_SECRET` = `...` (optional)
4. Deploy! No `VITE_API_URL` is needed because the backend is hosted on the same domain.

### Approach 2: Separating Frontend and Backend (Best for Real-Time)

To get seamless, instant WebSocket performance without serverless teardown drops:
1.  **Frontend (React/Vite)** -> Deploy to **Vercel** or **GitHub Pages**
2.  **Backend (Express/Node)** -> Deploy to **Render**, **Railway**, or **Fly.io**

---

### Step 1: Deploying Backend to Render (or Railway)
1. Push your repository to GitHub.
2. Go to [Render](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add these **Environment Variables**:
   - `JWT_SECRET` = your_secret_string
   - `MONGODB_URI` = your_mongodb_connection_string
   - `CLOUDINARY_CLOUD_NAME` = your_cloudinary_name (optional)
   - `CLOUDINARY_API_KEY` = your_cloudinary_key (optional)
   - `CLOUDINARY_API_SECRET` = your_cloudinary_secret (optional)
6. Deploy the backend and copy the **Render URL** (e.g., `https://my-chat-api.onrender.com`).

### Step 2: Deploying Frontend to Vercel or GitHub Pages

**For Vercel (Recommended):**
1. Go to [Vercel](https://vercel.com/) and create a new project.
2. Select your repository. Important: **Framework Preset should be Vite**.
3. In the Environment Variables section, add:
   - `VITE_API_URL` = `https://your-backend-url-from-render.onrender.com`
4. Deploy.

**For GitHub Pages:**
1. Go to your repository settings on GitHub.
2. Under "Pages", set your source configuration.
3. Because the site now uses Hash routing (e.g. `/#/login`) and relative paths, navigating directly on GitHub Pages will work seamlessly without blank screens or 404s.
4. **Important:** You still need to let the frontend know where the backend is. Add an Action Secret or an environment variable `VITE_API_URL` pointing to your Render backend to your GitHub Actions build step if you are building via actions, or hardcode it before pushing if you just want to test.
