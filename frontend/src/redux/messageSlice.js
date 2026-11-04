import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name: "message",
    initialState: {
        messages: [],
        artifacts: [],
        isLoading: false,
        agentActivity: null, // Current active step: { agent: string, message: string, timestamp: number }
        activityLogs: []     // History of agent steps for the active turn
    },
    reducers: {
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setArtifacts: (state, action) => {
            state.artifacts = action.payload;
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setAgentActivity: (state, action) => {
            state.agentActivity = action.payload;
            if (action.payload) {
                state.activityLogs.push(action.payload);
            }
        },
        clearAgentActivity: (state) => {
            state.agentActivity = null;
            state.activityLogs = [];
        }
    }
});

export const {
    setMessages,
    addMessage,
    setArtifacts,
    setIsLoading,
    setAgentActivity,
    clearAgentActivity
} = messageSlice.actions;

export default messageSlice.reducer;
