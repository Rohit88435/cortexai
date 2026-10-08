import { Code2, Menu, MessageSquare, Plus } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedConversation,
  toggleMobileSidebar,
} from "../redux/conversationSlice";

function Nav() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages, artifacts } = useSelector((state) => state.message);
  const dispatch = useDispatch();

  return (
    <header className="h-13 min-h-[52px] flex items-center justify-between px-3.5 sm:px-5 border-b border-white/[0.08] bg-[#0d0f14] z-30 shrink-0">
      {/* Left: Mobile Menu Toggle + Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile / Tablet Menu Button */}
        <button
          aria-label="Open sidebar"
          onClick={() => dispatch(toggleMobileSidebar())}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 shrink-0">
            <MessageSquare size={13} />
          </div>
          <span className="text-[13.5px] sm:text-[14px] font-semibold text-slate-100 tracking-tight truncate max-w-[180px] sm:max-w-xs md:max-w-md">
            {selectedConversation?.title || "CortexAI"}
          </span>

          {selectedConversation && messages?.length > 0 && (
            <span className="hidden sm:inline-block text-[10px] font-medium text-slate-500 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full shrink-0">
              {messages.length} msgs
            </span>
          )}
        </div>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          title="New Chat"
          onClick={() => dispatch(setSelectedConversation(null))}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 border border-white/[0.06] transition-colors duration-150 cursor-pointer"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
}

export default Nav;
