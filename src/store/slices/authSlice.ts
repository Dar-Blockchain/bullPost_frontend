import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";
import { RootState } from "../store";

// ✅ Helper functions to safely access `localStorage`
const getInitialToken = (): string | undefined => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || undefined;
  }
  return undefined;
};

const getInitialUser = (): any | null => {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("user") || "null");
  }
  return null;
};

// ✅ Async thunk for requesting OTP
export const getCode = createAsyncThunk(
  "auth/getCode",
  async (email: string, thunkAPI) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const statusCode = response.status;

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue({ message: errorData.message, status: statusCode });
      }

      const data = await response.json();
      return { ...data, status: statusCode };
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ message: error.message, status: 500 });
    }
  }
);

// ✅ Async thunk for logging in
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, otp }: { email: string; otp: string }, thunkAPI) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const statusCode = response.status;
      console.log(statusCode, "statusCode");

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue({
          message: data.message || "Login failed",
          status: statusCode,
        });
      }

      // ✅ Save token & user data in `localStorage` on client-side
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return { ...data, status: statusCode };
    } catch (error: any) {
      return thunkAPI.rejectWithValue({
        message: error.message || "Server error",
        status: 500,
      });
    }
  }
);

// ✅ Logout action (removes token & user from localStorage)
export const logoutUser = (): ThunkAction<void, RootState, unknown, any> => (dispatch) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  dispatch(authSlice.actions.logout());
};

// ✅ Define the authentication state
interface AuthState {
  codeSent: boolean;
  token?: string;
  user?: any;
  error?: string;
  loading: boolean;
}

// ✅ Initial state
const initialState: AuthState = {
  codeSent: false,
  loading: false,
  token: getInitialToken(),
  user: getInitialUser(),
};

const authSlice = createSlice({
  name: "auth",
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
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ token: string; user: any }>) => {
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

// ✅ Export logout action
export const { logout } = authSlice.actions;
export default authSlice.reducer;
