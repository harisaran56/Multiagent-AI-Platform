import { configureStore } from '@reduxjs/toolkit'
import userReducer from "./userSlice"
import conversationReducer from "./conversationSlice"
import messageReducer from "./messageSlice"
import ideReducer from "./ideSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    conversation: conversationReducer,
    message: messageReducer,
    ide: ideReducer
  },
})
