import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import messageSlice from "./messageSlice";
import socketSlice from "./SocketSlice";
import conversationSlice from "./conversationSlice"; 
import slackUserSlice from './slackUserSlice'
import workspaceReducer from "./workspaceSlice";
import channelSlice from './channelSlice'
import activitySlice from './activitySlice'
import channelMessageSlice from './channelMessageSlice';
import callReducer from './callSlice'
import notificationSlice from './notification'

const store = configureStore({
  reducer: {
    user: userSlice,
    message: messageSlice,
    socket: socketSlice,
    conversations: conversationSlice, 
    slackUser:slackUserSlice,
     workspace: workspaceReducer,
    channel:channelSlice,
    activityData:activitySlice,
    channelMessage: channelMessageSlice,
    call: callReducer,
    notification:notificationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;