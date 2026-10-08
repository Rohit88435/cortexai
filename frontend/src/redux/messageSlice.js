import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",

  initialState: {
    messages: [],
    artifacts: [],
    loading: false,
  },

  reducers: {
    // all get messages
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setArtifacts: (state, action) => {
      state.artifacts = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // Replace the blob URL on the last user message with the persistent S3 URL
    updateLastUserAttachment: (state, action) => {
      for (let i = state.messages.length - 1; i >= 0; i--) {
        if (state.messages[i].role === "user" && state.messages[i].attachment) {
          state.messages[i].attachment = action.payload;
          break;
        }
      }
    },
  },
});

export const { setMessages, addMessage, setArtifacts, setLoading, updateLastUserAttachment } =
  messageSlice.actions;

export default messageSlice.reducer;

