import express, { Response } from 'express';
import { Message } from '../models/Message.js';
import { protectRoute, AuthRequest } from '../middleware/auth.js';
import { generateChatId, getIO } from '../lib/socket.js';
import multer from 'multer';
import cloudinary from '../lib/cloudinary.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/:id', protectRoute, async (req: AuthRequest, res: Response) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const chatId = generateChatId(myId.toString(), userToChatId.toString());

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 }); // Sort chronologically

    res.status(200).json(messages);
  } catch (error: any) {
    console.log('Error in getMessages controller: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/send/:id', protectRoute, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
          folder: 'rws-social-messages'
        });
        imageUrl = uploadResponse.secure_url;
      } else {
        imageUrl = dataURI;
      }
    }

    const chatId = generateChatId(senderId.toString(), receiverId.toString());

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || '',
      image: imageUrl || '',
      chatId
    });

    await newMessage.save();

    // realtime functionality with socket.io
    const io = getIO();
    if (io) {
      // Emit to both users room
      io.to(`user_${senderId}`).to(`user_${receiverId}`).emit('new_message', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error: any) {
    console.log('Error in sendMessage controller: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
