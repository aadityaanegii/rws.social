import { create } from 'zustand';
import { fetchApi } from '../lib/utils';
import { useAuthStore } from './useAuthStore';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  image: string;
  createdAt: string;
}

interface User {
  _id: string;
  username: string;
  profilePic: string;
}

interface ChatState {
  messages: Message[];
  users: User[];
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  typingUsers: Set<string>;
  getUsers: () => Promise<void>;
  searchUsers: (username: string) => Promise<User[]>;
  addContact: (userId: string) => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (messageData: any) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  setSelectedUser: (selectedUser: User | null) => void;
  setTypingUser: (userId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: new Set(),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await fetchApi('/users/conversations');
      set({ users: res });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  searchUsers: async (username: string) => {
    try {
      if (!username || username.trim().length < 2) return [];
      const res = await fetchApi(`/users/search?username=${encodeURIComponent(username)}`);
      return res;
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  addContact: async (userId: string) => {
    try {
      await fetchApi(`/users/contacts/${userId}`, { method: 'POST' });
      await get().getUsers();
    } catch (error) {
      console.error(error);
    }
  },

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await fetchApi(`/messages/${userId}`);
      set({ messages: res });

      const socket = useAuthStore.getState().socket;
      if (socket) {
        const authUser = useAuthStore.getState().authUser;
        const chatId = [authUser!._id, userId].sort().join('_');
        socket.emit('join_chat', chatId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData: any) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;
    
    try {
      const isFormData = messageData instanceof FormData;
      const res = await fetchApi(`/messages/send/${selectedUser._id}`, {
        method: 'POST',
        body: isFormData ? messageData : JSON.stringify(messageData),
      });

      // Optimistic upate is not strictly needed if we reply entirely on socket response
      // But we can append it here directly
      // set({ messages: [...messages, res] });
      // Actually let's just let socket handle the newly created message for BOTH Sender and Receiver so it is simpler
      // Wait, socket only goes to room, and sender is in room. Will sender receive it via socket?
      // "io.to(`chat_${chatId}`).emit('new_message', newMessage);"
      // Yes, receiver and sender will receive it if both joined.
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
      console.error(error.message);
    }
  },

  subscribeToMessages: () => {
    const selectedUser = get().selectedUser;
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on('new_message', (newMessage: Message) => {
      const isMessageForCurrentChat = 
        newMessage.senderId === selectedUser._id || 
        newMessage.receiverId === selectedUser._id;
        
      if (!isMessageForCurrentChat) return;
      
      const isDuplicate = get().messages.some(m => m._id === newMessage._id);
      if(!isDuplicate) {
        set({ messages: [...get().messages, newMessage] });
      }
    });

    socket.on('typing', ({ userId }) => {
      if (userId === selectedUser._id) {
        set((state) => {
          const newTyping = new Set(state.typingUsers);
          newTyping.add(userId);
          return { typingUsers: newTyping };
        });
      }
    });

    socket.on('stop_typing', ({ userId }) => {
      if (userId === selectedUser._id) {
        set((state) => {
          const newTyping = new Set(state.typingUsers);
          newTyping.delete(userId);
          return { typingUsers: newTyping };
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off('new_message');
    socket?.off('typing');
    socket?.off('stop_typing');
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  setTypingUser: (userId, isTyping) => set((state) => {
    const newTyping = new Set(state.typingUsers);
    if (isTyping) newTyping.add(userId);
    else newTyping.delete(userId);
    return { typingUsers: newTyping };
  })
}));
