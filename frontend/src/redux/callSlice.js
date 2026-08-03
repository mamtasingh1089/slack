import { createSlice } from '@reduxjs/toolkit';

const callSlice = createSlice({
  name: 'call',
  initialState: {
    isIncoming: false,
    incomingCallData: null,
    callHistory:[],
  },
  reducers: {
    setIncomingCall: (state, action) => {
      state.isIncoming = true;
      state.incomingCallData = action.payload;
    },
    clearIncomingCall: (state) => {
      state.isIncoming = false;
      state.incomingCallData = null;
    },
    addCallHistory:(state,action)=>{
      state.incomingCallData.unshift(action.payload);
    }
  },
});

export const { setIncomingCall, clearIncomingCall,addCallHistory } = callSlice.actions;
export default callSlice.reducer;