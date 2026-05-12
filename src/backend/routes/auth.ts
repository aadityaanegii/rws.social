import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { protectRoute, AuthRequest } from '../middleware/auth.js';
import cloudinary from '../lib/cloudinary.js';
import multer from 'multer';

// In-memory storage for the profile pic upload
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'changeme123', {
    expiresIn: '7d',
  });
};

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'User ID must be at least 3 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ message: 'Email already exists' });

    const usernameExists = await User.findOne({ username });
    if (usernameExists) return res.status(400).json({ message: 'Username already taken' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      const token = generateToken(newUser._id.toString());
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profilePic: newUser.profilePic,
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (err: any) {
    console.error('Error in signup controller', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found with this email' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      token
    });
  } catch (error: any) {
    console.log('Error in login controller', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/logout', (req, res) => {
  try {
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.log('Error in logout controller', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/check', async (req: AuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(200).json(null);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme123') as any;
    if (!decoded) {
      return res.status(200).json(null);
    }
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(200).json(null);
    }
    res.status(200).json(user);
  } catch (error: any) {
    console.log('Error in check auth controller', error.message);
    res.status(200).json(null);
  }
});

router.put('/update-profile', protectRoute, upload.single('profilePic'), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    let newProfilePicUrl = user.profilePic;

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
          folder: 'rws-social-profiles'
        });
        newProfilePicUrl = uploadResponse.secure_url;
      } else {
        newProfilePicUrl = dataURI;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: newProfilePicUrl, bio: req.body.bio || user.bio },
      { new: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.log('Error in update profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
