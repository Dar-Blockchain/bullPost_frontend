import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for requesting a code from your backend API
export const getCode = createAsyncThunk(
  'auth/getCode',
  async (email: string, thunkAPI) => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + 'auth/send-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        }
      );

      const statusCode = response.status; // Get status from response headers

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue({ message: errorData.message, status: statusCode });
      }

      const data = await response.json();
      return { ...data, status: statusCode }; // Return the status along with response data

    } catch (error: any) {
      return thunkAPI.rejectWithValue({ message: error.message, status: 500 });
    }
  }
);


export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, otp }: { email: string; otp: string }, thunkAPI) => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + "auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      const statusCode = response.status;
      console.log(statusCode, "statusCode");

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue({
          message: data.message || "Login failed",
          status: statusCode,
        });
      }

      return { ...data, status: statusCode }; // Return response + status
    } catch (error: any) {
      return thunkAPI.rejectWithValue({
        message: error.message || "Server error",
        status: 500,
      });
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
