# RWS Social - Realtime Chat Platform

A modern, full-stack realtime social platform built with the MERN stack + Socket.IO + Vite.

## Features

- **Realtime Messaging**: Instant one-on-one chat using Socket.IO.
- **Glassmorphism UI**: Beautiful, fully responsive Dark Mode interface using TailwindCSS and Framer Motion.
- **Authentication**: Secure JWT-based authentication with bcrypt password hashing.
- **Image Sharing**: Send images in chats via Cloudinary integration.
- **Presence System**: Realtime online/offline status and typing indicators.
- **State Management**: Zustand for frontend state.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Zustand, Lucide React
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MongoDB (Mongoose)
- **Media Storage**: Cloudinary

## Environment Variables (.env)

Make sure to provide the following environment variables in `.env` or AI Studio Secrets before starting the server.

```env
MONGODB_URI="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

## Running the App

### Development

```bash
npm install
npm run dev
```

The application will start the Express API and the Vite development server on `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## Deployment

### Deploying to Render/Railway
1. Connect your Github Repository.
2. Ensure you have added the required Environment Variables.
3. Use the build command: `npm run build`
4. Use the start command: `npm start`
5. Since both frontend and backend are served by `server.ts` on the same port, you only need to deploy a single Node.js Web Service!
