import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],           // array of { id, type, title, body, data, createdAt, isRead }
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications(state, action) {
      state.list = action.payload || [];
      state.unreadCount = state.list.filter(n => !n.isRead).length;
    },
    addNotification(state, action) {
      const n = action.payload;
      // keep newest first
      state.list = [n, ...state.list];
      if (!n.isRead) state.unreadCount += 1;
    },
    markAsRead(state, action) {
      const id = action.payload;
      const idx = state.list.findIndex(x => String(x.id) === String(id));
      if (idx !== -1 && !state.list[idx].isRead) {
        state.list[idx].isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead(state) {
      state.list = state.list.map(n => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
    clearNotifications(state) {
      state.list = [];
      state.unreadCount = 0;
    }
  }
});

export const { setNotifications, addNotification, markAsRead, markAllRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
