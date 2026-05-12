import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profilePic: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastSeen: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
