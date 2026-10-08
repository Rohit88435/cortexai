import React, { useEffect, useState } from "react";
import {
  Coins,
  LogOut,
  MessageSquare,
  PanelLeftIcon,
  PanelRight,
  PenSquare,
  Plus,
  User,
  X,
} from "lucide-react";
import { getConversations } from "../features/getConversations";
import { useDispatch, useSelector } from "react-redux";
import {
  addConversation,
  setConversations,
  setMobileSidebarOpen,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { createConversation } from "../features/createConversation";
import logout from "../features/logout";
import { setUserData } from "../redux/userSlice";
import BillingDrawer from "./BillingDrawer";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();

  const [imageError, setImageError] = useState(false);
  const [showBilling, setShowBilling] = useState(false);

  const { conversations, selectedConversation, mobileSidebarOpen } = useSelector(
    (state) => state.conversation,
  );
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const getConv = async () => {
      const data = await getConversations();
      dispatch(setConversations(data));
    };

    getConv();
  }, [userData?._id]);

  const handleSelectConversation = (conv) => {
    dispatch(setSelectedConversation(conv));
    dispatch(setMobileSidebarOpen(false));
  };

  const handleNewChat = () => {
    dispatch(setSelectedConversation(null));
    dispatch(setMobileSidebarOpen(false));
  };

  // Reusable inner sidebar content
  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-[#0d0f14]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2.5 px-4 h-14 border-b border-white/[0.08] shrink-0">
        {!isMobile && (
          <button
            title="Collapse Sidebar"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer"
            onClick={() => setCollapsed(true)}
          >
            <PanelLeftIcon size={18} />
          </button>
        )}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[15px] font-semibold text-slate-100 tracking-tight truncate">
            CortexAI
          </span>
          <span className="text-[10px] font-medium text-indigo-300 bg-indigo-500/[0.08] border border-indigo-400/15 px-2 py-0.5 rounded-full tracking-wide">
            free
          </span>
        </div>

        {isMobile ? (
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer"
            onClick={() => dispatch(setMobileSidebarOpen(false))}
          >
            <X size={18} />
          </button>
        ) : (
          <button
            title="New Chat"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer"
            onClick={handleNewChat}
          >
            <PenSquare size={16} />
          </button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-linear-to-r from-indigo-500/80 to-violet-600/80 rounded-xl py-2.5 px-3 cursor-pointer hover:opacity-95 shadow-sm shadow-indigo-500/15 transition-all duration-150"
          onClick={handleNewChat}
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Recents Label */}
      <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {conversations.length === 0 ? "No Conversations" : "Recents"}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden">
        {conversations.map((conv) => {
          const isActive = selectedConversation?._id === conv?._id;

          return (
            <div
              key={conv?._id}
              onClick={() => handleSelectConversation(conv)}
              className={`group flex items-center gap-2.5 cursor-pointer px-3 py-2 rounded-xl border transition-all duration-150
                ${
                  isActive
                    ? "bg-indigo-500/10 border-indigo-500/20 text-white"
                    : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }
              `}
            >
              <div
                className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-lg border transition-colors duration-150
                  ${
                    isActive
                      ? "bg-indigo-500/15 border-indigo-400/20 text-indigo-300"
                      : "bg-white/[0.03] border-white/[0.05] text-slate-500 group-hover:text-slate-300"
                  }
                `}
              >
                <MessageSquare size={13} />
              </div>

              <span className="text-[13px] font-medium truncate flex-1">
                {conv?.title || "New Chat"}
              </span>
            </div>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-white/[0.08] mt-auto">
        {userData ? (
          <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-colors duration-150">
            <div className="relative shrink-0">
              {userData.avatar && !imageError ? (
                <img
                  className="h-8 w-8 rounded-lg border border-indigo-400/20 object-cover"
                  src={userData.avatar}
                  alt="User"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-400/20 bg-indigo-500/[0.08] text-indigo-300">
                  <User size={15} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-slate-200">
                {userData.name || "User"}
              </p>
              <p className="text-[11px] text-slate-500">Free Plan</p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                title="Credits & Plans"
                onClick={() => setShowBilling(true)}
                className="flex items-center justify-center w-7 h-7 rounded-lg text-amber-300/70 hover:text-amber-300 hover:bg-white/10 transition-colors duration-150 cursor-pointer"
              >
                <Coins size={15} />
              </button>
              <button
                title="Log out"
                className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/10 transition-colors duration-150 cursor-pointer"
                onClick={() => {
                  logout();
                  dispatch(setUserData(null));
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-1 text-xs text-slate-500">
            Guest User
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile / Tablet Off-canvas Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => dispatch(setMobileSidebarOpen(false))}
          />

          {/* Drawer Menu */}
          <div className="relative z-50 w-72 max-w-[80vw] h-full shadow-2xl border-r border-white/10 flex flex-col transform transition-transform duration-300 ease-out">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}

      {/* Desktop Collapsed Sidebar */}
      {collapsed ? (
        <div className="hidden lg:flex flex-col items-center w-14 h-screen bg-[#0d0f14] border-r border-white/[0.08] py-3 gap-2 shrink-0">
          <button
            title="Expand Sidebar"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer"
            onClick={() => setCollapsed(false)}
          >
            <PanelRight size={18} />
          </button>
          <button
            title="New Chat"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-150 cursor-pointer"
            onClick={handleNewChat}
          >
            <Plus size={18} />
          </button>

          <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden pt-4 space-y-1">
            {conversations.map((conv) => {
              const isActive = selectedConversation?._id === conv?._id;
              return (
                <button
                  key={conv?._id}
                  title={conv?.title || "New Chat"}
                  onClick={() => handleSelectConversation(conv)}
                  className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-colors duration-150 cursor-pointer
                    ${
                      isActive
                        ? "bg-indigo-500/15 border-indigo-400/20 text-indigo-300"
                        : "bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    }
                  `}
                >
                  <MessageSquare size={15} />
                </button>
              );
            })}
          </div>

          <div className="relative shrink-0 pt-2 border-t border-white/[0.08]">
            {userData?.avatar && !imageError ? (
              <img
                className="h-8 w-8 rounded-lg border border-indigo-400/20 object-cover"
                src={userData.avatar}
                alt="User"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-400/20 bg-indigo-500/[0.08] text-indigo-300">
                <User size={14} />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop Expanded Sidebar */
        <aside className="hidden lg:flex flex-col w-64 h-screen shrink-0 border-r border-white/[0.08] bg-[#0d0f14]">
          {renderSidebarContent(false)}
        </aside>
      )}

      <BillingDrawer
        open={showBilling}
        onClose={() => setShowBilling(false)}
      />
    </>
  );
}

export default Sidebar;
