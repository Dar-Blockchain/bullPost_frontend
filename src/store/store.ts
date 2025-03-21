// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import accountsReducer from './slices/accountsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    accounts: accountsReducer, // Add it here

  },
});

// Export types for later use
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
