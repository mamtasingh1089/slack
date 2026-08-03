import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  slackUser: null,
  slackUsers: [],
};

const slackUserSlice = createSlice({
  name: "slackUser",
  initialState,
  reducers: {
    setSlackUser: (state, action) => {
      state.slackUser = action.payload;
    },
    clearSlackUser: (state) => {
      state.slackUser = null;
    },
    setSlackUsers: (state, action) => {
      state.slackUsers = action.payload;
    },
  },
});

// correctly export actions from slackUserSlice
export const { setSlackUser, clearSlackUser, setSlackUsers } = slackUserSlice.actions;
export default slackUserSlice.reducer;
