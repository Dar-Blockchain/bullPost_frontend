import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for requesting a code from your backend API
export const getCode = createAsyncThunk(
  'auth/getCode',
  async (email: string, thunkAPI) => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + 'Users/getCode',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(errorData.message);
      }
      const data = await response.json();
      return data; // Adjust according to your API response structure
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Async thunk for logging in with email and code
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, code }: { email: string; code: string }, thunkAPI) => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + 'Users/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, code })
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(errorData.message);
      }
      const data = await response.json();
      return data; // Expecting a token or user info in response
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

interface AuthState {
  codeSent: boolean;
  token?: string;
  user?: any;
  error?: string;
  loading: boolean;
}

const initialState: AuthState = {
  codeSent: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = undefined;
      state.user = undefined;
      state.codeSent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCode.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getCode.fulfilled, (state) => {
        state.loading = false;
        state.codeSent = true;
      })
      .addCase(getCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
