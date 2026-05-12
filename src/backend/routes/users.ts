import express, { Response } from 'express';
import { User } from '../models/User.js';
import { Message } from '../models/Message.js';
import { protectRoute, AuthRequest } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute limit
  max: 20, // max 20 requests per minute per IP
  message: { error: 'Too many search requests. Please try again later.' }
});

router.get('/conversations', protectRoute, async (req: AuthRequest, res: Response) => {
  try {
    const loggedInUserId = req.user._id;

    // Find all distinct chat partners from messages
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }]
    }).sort({ createdAt: -1 });

    const partnerIds = new Set<string>();
    messages.forEach(m => {
      if (m.senderId.toString() !== loggedInUserId.toString()) partnerIds.add(m.senderId.toString());
      if (m.receiverId.toString() !== loggedInUserId.toString()) partnerIds.add(m.receiverId.toString());
    });

    // Also include explicitly added contacts
    const user = await User.findById(loggedInUserId);
    if (user?.friends) {
      user.friends.forEach(f => partnerIds.add(f.toString()));
    }

    const partners = await User.find({ _id: { $in: Array.from(partnerIds) } }).select('-password');
    res.status(200).json(partners);
  } catch (error: any) {
    console.error('Error in getConversations: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/search', protectRoute, searchLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const loggedInUserId = req.user._id;
    const search = req.query.username ? String(req.query.username).trim() : '';

    if (!search || search.length < 2) {
      return res.status(200).json([]);
    }

    // Exact matching priority
    const exactMatch = await User.findOne({ username: search, _id: { $ne: loggedInUserId } }).select('-password');
    
    // Partial close matches (starts with or contains, case insensitive)
    const partialMatches = await User.find({
      username: { $regex: search, $options: 'i' },
      _id: { $ne: loggedInUserId },
      ...(exactMatch ? { _id: { $nin: [loggedInUserId, exactMatch._id] } } : {})
    }).select('-password').limit(4); // limit to 4 partial to prevent harvesting

    const results = [];
    if (exactMatch) results.push(exactMatch);
    results.push(...partialMatches);

    res.status(200).json(results);
  } catch (error: any) {
    console.error('Error in searchUsers: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/contacts/:id', protectRoute, async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: "Cannot add yourself" });
    }

    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { friends: targetUserId }
    });

    res.status(200).json({ message: "Contact added successfully" });
  } catch (error: any) {
    console.error('Error in addContact: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', protectRoute, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
