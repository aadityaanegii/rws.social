import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useRouterStore } from '../App';
import { LogOut, ArrowLeft, Camera, User, Mail, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Profile() {
  const { authUser, updateProfile, isUpdatingProfile, logout } = useAuthStore();
  const { navigate } = useRouterStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [bio, setBio] = useState(authUser?.bio || '');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);

      // Instantly dispatch to backend
      const formData = new FormData();
      formData.append('profilePic', file);
      updateProfile(formData);
    }
  };

  const handleSaveBio = () => {
    const formData = new FormData();
    formData.append('bio', bio);
    updateProfile(formData);
  };

  if (!authUser) return null;

  return (
    <div className="min-h-screen bg-[#09090b] flex justify-center py-10 px-4 text-zinc-200">
      <div className="w-full max-w-2xl bg-[#0f1015] rounded-3xl border border-white/5 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="size-5" />
            Back to Chat
          </button>
          <button 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-zinc-500">Manage your account information</p>
        </div>

        {/* Avatar update */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="relative group">
            <div className="size-32 rounded-[2rem] overflow-hidden border-4 border-[#09090b] bg-zinc-800 relative z-10 shadow-lg">
              <img 
                src={selectedImage || authUser.profilePic || `https://ui-avatars.com/api/?name=${authUser.username}&background=random`} 
                alt="Profile"
                className="size-full object-cover"
              />
            </div>
            
            <label className="absolute bottom-0 right-[-0.5rem] bg-indigo-600 rounded-xl p-2.5 cursor-pointer z-20 hover:bg-indigo-500 transition-colors shadow-lg">
              <Camera className="size-5 text-white" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            
            {isUpdatingProfile && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-30">
                <Loader2 className="size-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <p className="text-sm text-neutral-400">Click the camera icon to update your photo</p>
        </div>

        {/* Form fields */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 flex items-center gap-2 block">
              <User className="size-4" /> Full Name
            </label>
            <div className="bg-[#09090b] border border-white/5 px-4 py-3 rounded-xl text-zinc-200">
              {authUser.username}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 flex items-center gap-2 block">
              <Mail className="size-4" /> Email Address
            </label>
            <div className="bg-[#09090b] border border-white/5 px-4 py-3 rounded-xl text-zinc-200">
              {authUser.email}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-zinc-500 flex items-center gap-2 block">
                Bio
              </label>
              {(bio !== (authUser.bio || '')) && (
                 <button onClick={handleSaveBio} className="text-indigo-400 text-sm hover:text-indigo-300 font-medium">Save Bio</button>
              )}
            </div>
            <textarea
              className="w-full bg-zinc-900/50 border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-zinc-200 transition-colors outline-none resize-none h-24"
              placeholder="Write a little bit about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="pt-6 border-t border-white/5 mt-6 mt">
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-zinc-500 flex items-center gap-2"><Calendar className="size-4"/> Member Since</span>
              <span className="text-zinc-200 font-medium">{format(new Date(authUser.createdAt || Date.now()), 'MMMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-zinc-500">Account Status</span>
              <span className="text-emerald-500 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium"><div className="size-1.5 rounded-full bg-emerald-500"></div> Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
