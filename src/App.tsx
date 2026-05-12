import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from 'lucide-react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Profile from './pages/Profile';
import { create } from 'zustand';
import { Toaster, toast } from 'react-hot-toast';
import { useChatStore } from './store/useChatStore';

// Simple router to avoid adding react-router-dom for just 4 pages
export const useRouterStore = create<{ path: string; navigate: (path: string) => void }>((set, get) => ({
  path: window.location.pathname,
  navigate: (path) => {
    if (get().path === path) return;
    window.history.pushState({}, '', path);
    set({ path });
  }
}));

export default function App() {
  const authUser = useAuthStore((state) => state.authUser);
  const user_checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const { path, navigate } = useRouterStore();

  useEffect(() => {
    user_checkAuth();

    const handlePopState = () => navigate(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user_checkAuth, navigate]);

  useEffect(() => {
    const handleNewMessage = (e: any) => {
      const message = e.detail;
      const selectedUser = useChatStore.getState().selectedUser;
      
      // If we are not currently chatting with the sender, show a toast
      if (selectedUser?._id !== message.senderId) {
        toast(`New message received`, {
          icon: '💬',
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #27272a'
          }
        });
      }
    };
    
    window.addEventListener('global_new_message', handleNewMessage);
    return () => window.removeEventListener('global_new_message', handleNewMessage);
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && !authUser && (path === '/' || path === '/profile')) {
      navigate('/login');
    }
    if (!isCheckingAuth && authUser && (path === '/login' || path === '/signup')) {
      navigate('/');
    }
  }, [authUser, path, isCheckingAuth, navigate]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-900 text-white">
        <Loader className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  let Content = <Home />;
  if (path === '/login') Content = <Login />;
  if (path === '/signup') Content = <Signup />;
  if (path === '/profile') Content = <Profile />;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans selection:bg-indigo-500/30">
      {Content}
      <Toaster position="top-center" />
    </div>
  );
}
