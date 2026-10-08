import React, { useEffect } from "react";
import Nav from "./Nav";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import getMessage from "../features/getMessage";
import { useDispatch, useSelector } from "react-redux";
import { setArtifacts, setMessages } from "../redux/messageSlice";

function ChatArea() {
  const { selectedConversation } = useSelector((state) => state.conversation);

  const dispatch = useDispatch();

  useEffect(() => {
    const getMessg = async () => {
      if (selectedConversation) {
        // clear previous conversation messages immediately so the UI
        // doesn't show messages from the prior conversation while we
        // fetch the current conversation's messages.
        dispatch(setMessages([]));

        if (selectedConversation.title == "New Chat") return;

        const data = await getMessage(selectedConversation?._id);
        dispatch(setMessages(data));
        const latestArtifactsMessage = [...data]
          .reverse()
          .find((msg) => msg.artifacts && msg.artifacts.length > 0);
        dispatch(setArtifacts(latestArtifactsMessage.artifacts || []));
      }
    };

    getMessg();
  }, [selectedConversation?._id]);

  return (
    <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden relative bg-[#0d0f14]">
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
  );
}

export default ChatArea;
