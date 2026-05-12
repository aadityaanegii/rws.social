import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useRouterStore } from '../App';
import { MessageSquare, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const { login, isLoggingIn } = useAuthStore();
  const { navigate } = useRouterStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#09090b] text-zinc-200">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 cursor-pointer hover:shadow-indigo-500/30 transition-all">
                <span className="font-black text-white text-xl">R</span>
              </div>
              <h1 className="text-2xl font-bold mt-2 tracking-tight">Welcome Back</h1>
              <p className="text-zinc-500">Sign in to your account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-600">
                  <Mail className="size-5" />
                </div>
                <input
                  type="email"
                  className="w-full bg-zinc-900/50 border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-3 text-zinc-200 transition-colors outline-none"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-600">
                  <Lock className="size-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-zinc-900/50 border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-12 py-3 text-zinc-200 transition-colors outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 disabled:shadow-none disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? <Loader2 className="size-5 animate-spin" /> : 'Sign in'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-zinc-500">
              Don't have an account?{' '}
              <button onClick={() => navigate('/signup')} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Create account
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-col items-center justify-center bg-[#0f1015] p-12 border-l border-white/5">
        <div className="max-w-md text-center space-y-6">
          <div className="aspect-square rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 relative overflow-hidden backdrop-blur-3xl shadow-2xl">
             {/* Some abstract shapes */}
             <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"></div>
             <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-violet-600/20 rounded-full blur-3xl"></div>
             <MessageSquare className="size-24 text-zinc-700 relative z-10" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Connect with everyone.</h2>
          <p className="text-zinc-500 text-lg">Join the most advanced realtime social network designed for the modern web.</p>
        </div>
      </div>
    </div>
  );
}
