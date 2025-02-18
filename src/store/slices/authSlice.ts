// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

// Async thunk for login using email and code
export const loginWithEmailAndCode = createAsyncThunk<
  User, // Return type (User)
  { email: string; code: string }, // Argument type
  { rejectValue: string } // Rejection type
>(
  'auth/loginWithEmailAndCode',
  async ({ email, code }, thunkAPI) => {
    try {
      const response = await fetch('https://your-backend.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Reject with a custom error message from your API
        return thunkAPI.rejectWithValue(errorData.message || 'Login failed');
      }

      const data: User = await response.json();
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'An unexpected error occurred');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithEmailAndCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithEmailAndCode.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(loginWithEmailAndCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
