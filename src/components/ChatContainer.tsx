import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { Send, Image as ImageIcon, X, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatContainer() {
  const { messages, selectedUser, isMessagesLoading, getMessages, subscribeToMessages, unsubscribeFromMessages, sendMessage, setSelectedUser, typingUsers } = useChatStore();
  const { authUser, socket } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    
    if (socket && selectedUser) {
      const chatId = [authUser!._id, selectedUser._id].sort().join('_');
      socket.emit('typing', { chatId, receiverId: selectedUser._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { chatId });
      }, 2000);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !selectedFile) || isSending) return;
    
    setIsSending(true);

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('text', text.trim());
        await sendMessage(formData);
      } else {
        await sendMessage({ text: text.trim() });
      }
      
      setText('');
      handleRemoveImage();
      
      if (socket && selectedUser) {
        const chatId = [authUser!._id, selectedUser._id].sort().join('_');
        socket.emit('stop_typing', { chatId });
      }
    } finally {
      setIsSending(false);
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-neutral-950">
        <Loader2 className="size-10 text-indigo-500 animate-spin" />
        <p className="text-neutral-500 mt-4 text-sm font-mono">ENCRYPTING CONNECTION...</p>
      </div>
    );
  }

  const isUserOnline = selectedUser ? useAuthStore.getState().onlineUsers.includes(selectedUser._id) : false;
  const isTyping = selectedUser ? typingUsers.has(selectedUser._id) : false;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0f1015]">
      {/* Header */}
      <div className="h-20 px-6 md:px-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setSelectedUser(null)} 
             className="md:hidden p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-400"
           >
             <ArrowLeft className="size-5" />
           </button>
           <div className="relative">
             <img src={selectedUser?.profilePic || `https://ui-avatars.com/api/?name=${selectedUser?.username}&background=random`} alt={selectedUser?.username} className="size-10 rounded-xl object-cover bg-indigo-500 flex items-center justify-center font-bold text-white shrink-0" />
           </div>
           <div>
              <h2 className="font-bold text-sm tracking-tight">{selectedUser?.username}</h2>
              <span className={`text-xs font-medium ${isUserOnline ? 'text-emerald-500' : 'text-zinc-500'}`}>
                {isTyping ? <span className="text-indigo-400 italic">typing...</span> : (isUserOnline ? 'Online' : 'Offline')}
              </span>
           </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        <AnimatePresence>
          {messages.map((message) => {
            const isMine = message.senderId === authUser?._id;
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={message._id}
                className={`flex items-end gap-3 ${isMine ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase overflow-hidden shrink-0 ${isMine ? 'bg-zinc-800 text-zinc-400' : 'bg-indigo-500 text-white'}`}>
                  <img src={(isMine ? authUser?.profilePic : selectedUser?.profilePic) || `https://ui-avatars.com/api/?name=${isMine ? authUser?.username : selectedUser?.username}&background=random`} className="w-full h-full object-cover" />
                </div>
                <div className={`max-w-[70%] space-y-1`}>
                  {message.image && (
                    <div className="mb-2 w-full rounded-2xl overflow-hidden border border-white/5">
                      <img src={message.image} alt="Attachment" className="w-full h-auto object-cover" />
                    </div>
                  )}
                  {message.text && (
                    <div className={`px-4 py-3 text-sm flex flex-col
                      ${isMine ? 'bg-indigo-600 rounded-2xl rounded-br-none shadow-lg shadow-indigo-500/10 text-white' : 'bg-zinc-800 rounded-2xl rounded-bl-none text-zinc-200'}
                    `}>
                      {message.text}
                    </div>
                  )}
                  <div className={`flex items-center gap-1.5 ${isMine ? 'justify-end' : ''}`}>
                    <span className={`text-[10px] text-zinc-500 ${isMine ? 'pr-1' : 'pl-1'}`}>{format(new Date(message.createdAt), 'HH:mm')}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {isTyping && (
          <div className="flex items-center gap-2 text-zinc-500 pl-[3.25rem]">
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-[10px] font-medium italic">{selectedUser?.username} is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6">
        {imagePreview && (
          <div className="mb-3 relative w-24 h-24 rounded-2xl overflow-hidden border border-white/5 mx-2">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80 backdrop-blur-sm"
            >
              <X className="size-3 text-white" />
            </button>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-2 flex items-center gap-2 backdrop-blur-xl">
           <label className="p-2 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors shrink-0">
             <ImageIcon className="size-5" />
             <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
           </label>
              
           <input
             type="text"
             placeholder="Type a message..."
             className="flex-1 bg-transparent border-none text-sm py-2 text-zinc-200 placeholder:text-zinc-600 outline-none focus:ring-0"
             value={text}
             onChange={handleTyping}
           />
           
           <div className="flex items-center gap-1">
             <button
               type="submit"
               disabled={(!text.trim() && !selectedFile) || isSending}
               className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
             >
               {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 transform rotate-12" />}
             </button>
           </div>
        </form>
      </div>
    </div>
  );
}
