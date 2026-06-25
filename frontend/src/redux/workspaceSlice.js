import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  workspace: null,        // current workspace
  allWorkspaces: [],     // list of workspaces
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspace: (state, action) => {
      state.workspace = action.payload;
    },
    setAllWorkspaces: (state, action) => {
      state.allWorkspaces = action.payload;
    },
    clearWorkspace: (state) => {
      state.workspace = null;
      state.allWorkspaces = [];
    },
  },
});

export const { setWorkspace, setAllWorkspaces, clearWorkspace } =
  workspaceSlice.actions;

export default workspaceSlice.reducer;