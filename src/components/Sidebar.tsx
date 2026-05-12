import { useEffect, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { Search, Loader2, UserPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from 'use-debounce';

export default function Sidebar() {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, searchUsers, addContact } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [search, setSearch] = useState('');

  // New chat modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(userSearchQuery, 500);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Optionally we can debounce search and call api, but since load all we can filter locally for fast UX.
    if (authUser) {
      getUsers();
    }
  }, [getUsers, authUser]);

  useEffect(() => {
    const handleSearch = async () => {
      if (debouncedSearchQuery.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchUsers(debouncedSearchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    };
    handleSearch();
  }, [debouncedSearchQuery, searchUsers]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase());
    const matchesOnline = showOnlineOnly ? onlineUsers.includes(u._id) : true;
    return matchesSearch && matchesOnline;
  });

  const handleStartChat = async (user: any) => {
    await addContact(user._id);
    setSelectedUser(user);
    setIsSearchModalOpen(false);
    setUserSearchQuery('');
    setSearch('');
  };

  if (isUsersLoading && users.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="size-6 text-neutral-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="p-6 border-b border-white/5 space-y-4">
        <button 
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-600/20"
        >
          <UserPlus className="size-4" />
          Add Contact / New Chat
        </button>
        
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 size-4 text-zinc-600" />
          <input 
            type="text" 
            placeholder="Search chats..." 
            className="w-full bg-zinc-900 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-indigo-500 placeholder:text-zinc-600 transition-colors text-zinc-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => setShowOnlineOnly(!showOnlineOnly)}
            className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${showOnlineOnly ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-zinc-400 hover:text-zinc-200'}`}
          >
            <div className={`size-2 rounded-full ${showOnlineOnly ? 'bg-indigo-400' : 'bg-zinc-500'}`}></div>
            Online Only
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <AnimatePresence>
          {filteredUsers.map((user) => (
            <motion.button
              key={user._id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setSelectedUser(user)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors mb-2
                ${selectedUser?._id === user._id ? 'bg-white/5 shadow-sm' : 'hover:bg-white/5'}
              `}
            >
              <div className="relative flex-shrink-0">
                <img 
                  src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                  alt={user.username} 
                  className="size-12 rounded-full object-cover border border-[#09090b] shadow-sm bg-zinc-800"
                />
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-[#09090b] rounded-full z-10" />
                )}
              </div>
              
              <div className="text-left flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="font-semibold text-sm truncate">{user.username}</h3>
                </div>
                <p className={`text-xs truncate ${onlineUsers.includes(user._id) ? 'text-indigo-400 font-medium' : 'text-zinc-500'}`}>
                   {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                </p>
              </div>
            </motion.button>
          ))}

          {filteredUsers.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 text-neutral-500 text-sm">
              No conversations yet.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isSearchModalOpen && (
        <div className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-sm z-50 flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold tracking-tight text-zinc-100">Find User</h2>
            <button onClick={() => setIsSearchModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-2 rounded-full hover:bg-white/5">
              <X className="size-5" />
            </button>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-3.5 size-4 text-zinc-500" />
            <input 
              type="text" 
              autoFocus
              placeholder="Search by exact username ID..." 
              className="w-full bg-[#0f1015] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-indigo-500 placeholder:text-zinc-500 text-zinc-200 outline-none"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {isSearching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-6 text-indigo-500 animate-spin" />
              </div>
            ) : userSearchQuery.trim().length >= 2 ? (
              searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div key={result._id} className="flex items-center justify-between p-3 bg-[#0f1015] border border-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <img 
                          src={result.profilePic || `https://ui-avatars.com/api/?name=${result.username}&background=random`} 
                          alt={result.username}
                          className="size-10 rounded-full object-cover bg-zinc-800"
                        />
                        <div className="text-sm font-medium text-zinc-200">{result.username}</div>
                      </div>
                      <button 
                        onClick={() => handleStartChat(result)}
                        className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Message
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  No users found with that precise username ID.
                </div>
              )
            ) : (
              <div className="text-center py-8 text-zinc-500 text-sm pt-20">
                <Search className="size-8 mx-auto mb-3 opacity-20" />
                Enter at least 2 characters to search for a user ID.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
