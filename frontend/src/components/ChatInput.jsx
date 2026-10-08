import {
  Code2,
  FileText,
  Globe,
  ImageIcon,
  MessageSquare,
  Mic,
  MicOff,
  Paperclip,
  Presentation,
  Send,
  X,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import sendMessage from "../features/sendMessage";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setArtifacts, setLoading, updateLastUserAttachment } from "../redux/messageSlice";
import { createConversation } from "../features/createConversation";
import {
  addConversation,
  setActiveDraft,
  setConversationTitle,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { updateConversation } from "../features/updateConversation";

function ChatInput() {
  const [input, setInput] = useState("");
  const [selectAgent, setSelectAgent] = useState("Auto");
  const [selectFile, setSelectFile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Memoize blob URL for image preview to avoid leaks
  const filePreviewUrl = useMemo(() => {
    if (selectFile && selectFile.type?.startsWith("image/")) {
      return URL.createObjectURL(selectFile);
    }
    return null;
  }, [selectFile]);

  // Revoke blob URL on cleanup
  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const { selectedConversation, activeDraft } = useSelector(
    (state) => state.conversation,
  );
  const { loading } = useSelector((state) => state.message);
  const dispatch = useDispatch();

  // Populate draft if suggestion clicked in MessageList
  useEffect(() => {
    if (activeDraft) {
      setInput(activeDraft);
      dispatch(setActiveDraft(""));
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [activeDraft, dispatch]);

  // Auto-resize textarea dynamically like ChatGPT
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  // ──────────────────────────────────────────────
  // Speech Recognition (Web Speech API)
  // ──────────────────────────────────────────────
  const initRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN"; // English (Indian accent)

    return recognition;
  }, []);

  const silenceTimerRef = useRef(null);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const startListening = useCallback(() => {
    const recognition = initRecognition();
    if (!recognition) {
      alert("Your browser does not support voice input.");
      return;
    }

    recognitionRef.current = recognition;
    let finalTranscript = input; // start from current input

    const resetSilenceTimer = () => {
      clearSilenceTimer();
      silenceTimerRef.current = setTimeout(() => {
        // Auto-stop after 2s of silence
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 2000);
    };

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? " " : "") + transcript;
        } else {
          interim += transcript;
        }
      }
      setInput(finalTranscript + (interim ? " " + interim : ""));
      resetSilenceTimer(); // reset on every speech input
    };

    // Also start the silence timer immediately (in case user doesn't speak at all)
    resetSilenceTimer();

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      clearSilenceTimer();
      setIsListening(false);
    };

    recognition.onend = () => {
      clearSilenceTimer();
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  }, [input, initRecognition]);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Stop mic if recording
    if (isListening) stopListening();

    let conversation = selectedConversation;

    if (!conversation) {
      const conv = await createConversation();
      dispatch(setSelectedConversation(conv));
      dispatch(addConversation(conv));
      conversation = conv;
    }

    if (conversation.title === "New Chat") {
      await updateConversation({
        id: conversation?._id,
        title: trimmedInput,
      });

      dispatch(
        setConversationTitle({
          conversationId: conversation?._id,
          title: trimmedInput.slice(0, 24),
        }),
      );
    }

    const formData = new FormData();
    formData.append("prompt", trimmedInput);
    formData.append("conversationId", conversation?._id);
    formData.append("agent", selectAgent.toLowerCase());
    if (selectFile) {
      formData.append("file", selectFile);
    }
    // Build attachment metadata for the message if a file is selected
    const attachment = selectFile
      ? {
          name: selectFile.name,
          type: selectFile.type,
          url: URL.createObjectURL(selectFile),
        }
      : null;

    dispatch(
      addMessage({
        role: "user",
        content: trimmedInput,
        ...(attachment ? { attachment } : {}),
      }),
    );
    setInput("");
    setSelectFile(null);
    if (fileRef.current) fileRef.current.value = "";

    // Start loading animation
    dispatch(setLoading(true));

    try {
      const data = await sendMessage(formData);
      // Replace the temporary blob URL with the persistent S3 URL
      if (data.attachment) {
        dispatch(updateLastUserAttachment(data.attachment));
      }
      dispatch(setArtifacts(data.artifacts || []));
      dispatch(
        addMessage({
          role: "assistant",
          content: data?.answer,
          images: data.images,
        }),
      );
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const agents = [
    { id: "auto", icon: Zap, label: "Auto" },
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "coding", icon: Code2, label: "Coding" },
    { id: "pdf", icon: FileText, label: "Pdf" },
    { id: "ppt", icon: Presentation, label: "PPT" },
    { id: "image", icon: ImageIcon, label: "Image" },
    { id: "search", icon: Globe, label: "Search" },
  ];

  return (
    <div className="w-full shrink-0 bg-[#0d0f14] px-3 sm:px-4 md:px-6 pb-3 pt-1">
      {/* Centered ChatGPT-Style Max-Width Container */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex flex-col bg-[#13151c] border border-white/[0.08] hover:border-white/[0.14] focus-within:border-indigo-400/30 focus-within:ring-1 focus-within:ring-indigo-400/15 rounded-2xl sm:rounded-[22px] p-2.5 sm:p-3 shadow-lg shadow-black/20 transition-all duration-200">

          {/* Agent Selector Pills - Sleek scrollable row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none [&::-webkit-scrollbar]:hidden">
            {agents.map((agent) => {
              const isActive = selectAgent === agent.label;
              const Icon = agent.icon;
              return (
                <button
                  type="button"
                  key={agent.id}
                  onClick={() => setSelectAgent(agent.label)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-150 cursor-pointer
                    ${
                      isActive
                        ? "bg-linear-to-r from-indigo-500/80 to-violet-600/80 text-white shadow-xs shadow-indigo-500/20"
                        : "bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.07] hover:text-slate-200"
                    }
                  `}
                >
                  <Icon
                    size={12}
                    className={isActive ? "text-white" : "text-slate-500"}
                  />
                  <span>{agent.label}</span>
                </button>
              );
            })}
          </div>

          {/* Selected File Preview Badge */}
          {selectFile && (
            <div className="my-1.5">
              {selectFile.type?.startsWith("image/") ? (
                <div className="relative group/preview w-fit">
                  <img
                    src={filePreviewUrl}
                    alt={selectFile.name}
                    className="h-20 max-w-[160px] rounded-lg object-cover border border-white/[0.1] shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectFile(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-slate-700 hover:bg-slate-600 border border-white/[0.15] rounded-full text-white transition-colors duration-150 cursor-pointer shadow-md"
                  >
                    <X size={10} />
                  </button>
                  <span className="absolute bottom-1 left-1 text-[9px] font-medium text-white/90 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded truncate max-w-[140px]">
                    {selectFile.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 pl-2.5 pr-2 py-2 bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.12] rounded-xl w-fit max-w-full transition-colors duration-150">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/15 border border-red-500/25 shrink-0">
                    <FileText size={14} className="text-red-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11.5px] font-medium text-slate-200 truncate max-w-[180px] leading-tight">
                      {selectFile.name}
                    </span>
                    <span className="text-[9.5px] text-slate-500 leading-tight">PDF Document</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectFile(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="text-slate-400 hover:text-red-400 p-1 rounded-md hover:bg-white/[0.05] transition-colors duration-150 cursor-pointer shrink-0"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Textarea: Starts at 1 row, auto-expands like ChatGPT */}
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent outline-none resize-none text-[13.5px] sm:text-[14px] text-slate-200 placeholder:text-slate-500 leading-relaxed max-h-[140px] min-h-[28px] py-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
            placeholder={isListening ? "Listening..." : "Ask anything..."}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <input
                type="file"
                accept=".pdf,image/*"
                hidden
                ref={fileRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectFile(file);
                }}
              />
              <button
                type="button"
                title="Attach file or image"
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors duration-150 cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip size={16} />
              </button>

              {/* ── Mic Button with Recording Animation ── */}
              <div className="relative flex items-center justify-center">
                {/* Pulse rings — only when recording */}
                {isListening && (
                  <>
                    <span className="absolute w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-500/30 mic-ring-1" />
                    <span className="absolute w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-500/20 mic-ring-2" />
                  </>
                )}
                <button
                  type="button"
                  title={isListening ? "Stop recording" : "Voice input"}
                  onClick={toggleMic}
                  className={`relative z-10 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all duration-200 cursor-pointer
                    ${
                      isListening
                        ? "bg-violet-500/90 text-white mic-glow"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
                    }
                  `}
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={16} />}
                </button>
              </div>

              {/* Soundwave bars visible while recording */}
              {isListening && (
                <div className="flex items-center gap-[3px] ml-1.5 h-6">
                  {[0, 0.15, 0.3, 0.45, 0.3, 0.15, 0].map((delay, i) => (
                    <span
                      key={i}
                      className="w-[3px] rounded-full bg-violet-400/80 soundwave-bar"
                      style={{
                        animationDelay: `${delay}s`,
                        height: "6px",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              title="Send message"
              disabled={!input.trim() || loading}
              onClick={handleSendMessage}
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all duration-150
                ${
                  input.trim() && !loading
                    ? "bg-linear-to-r from-indigo-500/80 to-violet-600/80 hover:opacity-90 text-white shadow-sm shadow-indigo-500/20 cursor-pointer"
                    : "bg-white/[0.04] text-slate-600 cursor-not-allowed"
                }
              `}
            >
              <Send size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ChatInput;
