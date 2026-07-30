import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],  
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setSingleUser: (state, action) => {
      state.singleUser = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
     addMessage: (state, action) => {
    // Prevent duplicates
    const exists = state.messages.find(m => m._id === action.payload._id);
    if (!exists) {
      state.messages.push(action.payload);
    }
  },
  updateMessage: (state, action) => {
      const updatedMsg = action.payload;
      state.messages = state.messages.map(m => 
        m._id === updatedMsg._id ? updatedMsg : m
      );
    },
    // UNCOMMENT AND FIX THIS:
    incrementReplyCount: (state, action) => {
  const { parentId, replyId } = action.payload; 
  const message = state.messages.find((m) => m._id === parentId);

  if (message) {
    // Create a tracking array if it doesn't exist
    if (!message.countedReplies) {
      message.countedReplies = [];
    }

    // ONLY increment if this replyId hasn't been counted yet
    if (!message.countedReplies.includes(replyId)) {
      message.replyCount = (message.replyCount || 0) + 1;
      message.countedReplies.push(replyId); // Mark this ID as "counted"
    }
  }
},
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setMessages, updateMessage, addMessage, removeMessage, clearMessages, setSingleUser, incrementReplyCount } = messageSlice.actions;
export default messageSlice.reducer;