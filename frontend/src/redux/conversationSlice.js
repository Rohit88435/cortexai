import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

const conversationSlice = createSlice({
  name: "conversation",

  initialState: {
    conversations: [],
    selectedConversation: null,
    mobileSidebarOpen: false,
    activeDraft: "",
  },

  reducers: {
    // all get conversations
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },

    // add conversation exists
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },

    // select  conversation exists
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },

    setConversationTitle: (state, action) => {
      const { title, conversationId } = action.payload;
      state.conversations = state.conversations.map((conv) =>
        conv._id == conversationId ? { ...conv, title } : conv,
      );

      if (state.selectedConversation?._id == conversationId) {
        state.selectedConversation = { ...state.selectedConversation, title };
      }
    },

    setMobileSidebarOpen: (state, action) => {
      state.mobileSidebarOpen = action.payload;
    },

    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },

    setActiveDraft: (state, action) => {
      state.activeDraft = action.payload;
    },
  },
});

export const {
  setConversations,
  addConversation,
  setSelectedConversation,
  setConversationTitle,
  setMobileSidebarOpen,
  toggleMobileSidebar,
  setActiveDraft,
} = conversationSlice.actions;

export default conversationSlice.reducer;
