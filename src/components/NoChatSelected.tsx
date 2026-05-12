import { MessageSquare } from 'lucide-react';

export default function NoChatSelected() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#0f1015] text-zinc-200">
      <div className="size-20 rounded-3xl mb-6 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20">
        <MessageSquare className="size-10 text-indigo-500" />
      </div>
      <h2 className="text-2xl font-bold mb-2 tracking-tight">Welcome to RWS Social</h2>
      <p className="text-zinc-500 max-w-sm text-center text-sm">
        Select a conversation from the sidebar to start messaging. Your messages are synchronized in realtime.
      </p>
    </div>
  );
}
