import { create } from 'zustand';
import { fetchApi } from '../lib/utils';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  username: string;
  email: string;
  profilePic: string;
  bio?: string;
  createdAt: string;
}

interface AuthState {
  authUser: User | null;
  isCheckingAuth: boolean;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  isUpdatingProfile: boolean;
  onlineUsers: string[];
  socket: Socket | null;
  checkAuth: () => Promise<void>;
  signup: (data: any) => Promise<void>;
  login: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: FormData) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await fetchApi('/auth/check');
      set({ authUser: res });
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data: any) => {
    set({ isSigningUp: true });
    try {
      const res = await fetchApi('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      localStorage.setItem('jwt', res.token);
      set({ authUser: res });
      get().connectSocket();
      toast.success('Account created successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data: any) => {
    set({ isLoggingIn: true });
    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      localStorage.setItem('jwt', res.token);
      set({ authUser: res });
      get().connectSocket();
      toast.success('Logged in successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: () => {
    localStorage.removeItem('jwt');
    set({ authUser: null });
    get().disconnectSocket();
  },

  updateProfile: async (data: FormData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await fetchApi('/auth/update-profile', {
        method: 'PUT',
        body: data,
      });
      set({ authUser: res });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socketUrl = import.meta.env.VITE_API_URL || '/';
    const socket = io(socketUrl, {
      auth: { token: localStorage.getItem('jwt') },
      reconnection: true,
    });

    socket.connect();

    set({ socket });

    socket.on('initial_online_users', (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });

    socket.on('new_message', (message: any) => {
      // Show toast if message is not from authUser
      if (message.senderId !== get().authUser?._id) {
        // Find if this is the currently selected chat
        // To avoid circular dependency with useChatStore, we can just show toast, 
        // or let useChatStore handle the selected user logic.
        // Actually, we can dispatch a custom event.
        window.dispatchEvent(new CustomEvent('global_new_message', { detail: message }));
      }
    });

    socket.on('user_status', ({ userId, status }) => {
      set((state) => {
        let newOnline = [...state.onlineUsers];
        if (status === 'online' && !newOnline.includes(userId)) {
          newOnline.push(userId);
        } else if (status === 'offline') {
          newOnline = newOnline.filter((id) => id !== userId);
        }
        return { onlineUsers: newOnline };
      });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket?.disconnect();
  },
}));
