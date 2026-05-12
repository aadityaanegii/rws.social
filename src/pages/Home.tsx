import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import NoChatSelected from '../components/NoChatSelected';
import { Settings, User as UserIcon } from 'lucide-react';
import { useRouterStore } from '../App';

export default function Home() {
  const { selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const { navigate } = useRouterStore();

  return (
    <div className="h-screen flex bg-[#09090b] text-zinc-200 overflow-hidden">
      {/* Mobile-first layout: Sidebar takes full width when no chat is selected. Chat takes full width when selected. On desktop, they split. */}
      
      {/* Sidebar Area */}
      <div className={`h-full w-full md:w-80 lg:w-80 flex-shrink-0 border-r border-white/5 flex flex-col bg-[#09090b] ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#09090b]">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight">Messages</h1>
          </div>
          
          <button 
            onClick={() => navigate('/profile')} 
            className="size-10 rounded-full border-2 border-indigo-500/50 p-0.5 overflow-hidden hover:opacity-80 transition-opacity focus:ring-2 focus:ring-indigo-500 shrink-0"
          >
             <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800">
               <img 
                 src={authUser?.profilePic || `https://ui-avatars.com/api/?name=${authUser?.username}&background=random`} 
                 alt="avatar" 
                 className="size-full object-cover"
               />
             </div>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <Sidebar />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 h-full flex-col bg-[#0f1015] relative ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {selectedUser ? <ChatContainer /> : <NoChatSelected />}
      </div>
    </div>
  );
}
