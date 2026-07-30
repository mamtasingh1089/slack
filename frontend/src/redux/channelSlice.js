import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    channel: null,
    allChannels: [],
    selectedChannelId: null,
    addMember: []
};

const channelSlice = createSlice({
    name: "channel",
    initialState,
    reducers: {
        setChannel: (state, action) => {
            state.channel = action.payload;
        },
        setAllChannels: (state, action) => {
            state.allChannels = action.payload;
        },
        setSelectedChannelId: (state, action) => {
            state.selectedChannelId = action.payload;
        },
        addMembers: (state, action) => { 
            const newMembers = action.payload;
            // Safety check to ensure array exists
            if (!state.addMember) state.addMember = [];

            const existingMemberIds = new Set(state.addMember.map(member => member._id));
            const uniqueNewMembers = newMembers.filter(
                member => !existingMemberIds.has(member._id)
            );
            state.addMember.push(...uniqueNewMembers);
        },
        // ACTION 1: Increment count when a message comes for a different channel
        incrementUnreadCount: (state, action) => {
            const { channelId, userId } = action.payload;
            
            state.allChannels = state.allChannels.map(ch => {
                if (ch._id === channelId) {
                    const currentCounts = ch.unreadCounts || {};
                    const currentCount = currentCounts[userId] || 0;
                    return {
                        ...ch,
                        unreadCounts: {
                            ...currentCounts,
                            [userId]: currentCount + 1
                        }
                    };
                }
                return ch;
            });
        },
        // ACTION 2: Clear count when user enters the channel
        resetChannelUnread: (state, action) => {
            const { channelId, userId } = action.payload;
            state.allChannels = state.allChannels.map(ch => {
                if (ch._id === channelId) {
                    const currentCounts = ch.unreadCounts || {};
                    return {
                        ...ch,
                        unreadCounts: {
                            ...currentCounts,
                            [userId]: 0
                        }
                    };
                }
                return ch;
            });
        }
    }
});

export const { 
    setChannel, 
    setAllChannels, 
    setSelectedChannelId, 
    addMembers, 
    incrementUnreadCount, 
    resetChannelUnread 
} = channelSlice.actions;

export default channelSlice.reducer;