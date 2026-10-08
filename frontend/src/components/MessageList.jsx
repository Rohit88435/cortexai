import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";
import { setActiveDraft } from "../redux/conversationSlice";
import { Code2, Compass, Sparkles } from "lucide-react";

function MessageList() {
  const { selectedConversation } = useSelector((state) => state.conversation);
  const { messages, loading } = useSelector((state) => state.message);
  const dispatch = useDispatch();

  const containerRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, loading, selectedConversation?._id]);

  const suggestions = [
    { text: "Build a Netflix clone in React", icon: Code2 },
    { text: "Explain Redis caching with examples", icon: Compass },
    { text: "Design a clean dashboard in Tailwind", icon: Sparkles },
  ];

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      <div className="max-w-3xl mx-auto w-full min-h-full flex flex-col justify-between">
        {messages.length === 0 || !selectedConversation ? (
          <div className="my-auto flex flex-col items-center justify-center gap-6 text-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <Sparkles className="text-indigo-400" size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                CortexAI
              </h1>
              <p className="text-sm sm:text-base font-medium text-slate-400">
                How can I help you today?
              </p>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
                Ask anything — code, design, ideas, debug solutions, or generate content.
              </p>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mt-2">
              {suggestions.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => dispatch(setActiveDraft(item.text))}
                    className="group inline-flex items-center gap-2 text-xs text-slate-300 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-indigo-500/30 px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-xs"
                  >
                    <Icon size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span>{item.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5 pb-4">
            {messages.map((msg, i) => (
              <div key={msg?._id || i}>
              <MessageBubble
                  role={msg?.role}
                  content={msg?.content}
                  images={msg.images || []}
                  attachment={msg.attachment}
                />
              </div>
            ))}

            {/* ── AI Thinking Animation ── */}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-fit max-w-[88%] sm:max-w-[80%] md:max-w-[75%] px-4 py-3.5 rounded-2xl rounded-tl-xs">
                  <div className="flex items-center gap-3">
                    {/* CortexAI mini avatar */}
                    <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/25 flex items-center justify-center shrink-0">
                      <Sparkles className="text-indigo-400" size={14} />
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Shimmer bar */}
                      <div className="relative w-48 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="absolute inset-0 w-1/2 rounded-full bg-linear-to-r from-transparent via-indigo-400/40 to-transparent thinking-shimmer" />
                      </div>

                      {/* Thinking dots */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] text-slate-500">Thinking</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80 thinking-dot-1" />
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400/80 thinking-dot-2" />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80 thinking-dot-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageList;
