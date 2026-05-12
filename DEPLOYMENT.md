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

The easiest way to make this app work fully is:
1.  **Frontend (React/Vite)** -> Deploy to **Vercel**
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

### Step 2: Deploying Frontend to Vercel
1. Go to [Vercel](https://vercel.com/) and create a new project.
2. Connect your GitHub repository.
3. In the Build settings, Vercel will automatically detect **Vite**.
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add this **Environment Variable**:
   - `VITE_API_URL` = `https://your-backend-url-from-render.onrender.com` *(Replace this with your actual Render URL)*
5. Deploy. 

Vercel will build the frontend, and it will use the `VITE_API_URL` to point all data and WebSocket requests to your newly created Render server. This ensures you get the fast global CDN of Vercel for your UI, and a powerful WebSocket-supported Node.js server on Render for instant chat.
