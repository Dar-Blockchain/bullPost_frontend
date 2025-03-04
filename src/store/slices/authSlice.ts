import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";
import { RootState } from "../store";

// ✅ Helper functions to safely access localStorage
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

      const data = await response.json().catch(() => {
        throw new Error("Invalid JSON response from server");
      });

      if (!response.ok) {
        return thunkAPI.rejectWithValue({
          message: data?.message || "Login failed",
          status: statusCode,
        });
      }

      // ✅ Store token and user data in localStorage
      if (typeof window !== "undefined") {
        try {
          if (data.token && data.user) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
          } else {
            console.warn("Login successful but missing token or user data");
          }
        } catch (e) {
          console.error("Error storing login data in localStorage", e);
        }
      }

      return { ...data, status: statusCode };
    } catch (error: any) {
      console.error("Login error:", error);
      return thunkAPI.rejectWithValue({
        message: error.message || "Server error",
        status: 500,
      });
    }
  }
);

// ✅ Logout thunk that removes token/user from localStorage and clears cookies
export const logoutUser = (): ThunkAction<void, RootState, unknown, any> => (dispatch) => {
  if (typeof window !== "undefined") {
    // Remove localStorage items
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Name of the cookie we want to delete
    const cookieName = "next-auth.session-token";

    // Delete cookie by setting expiration date in the past.
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;

    // Force a page reload to ensure changes take effect.
    // window.location.reload();
  }
  dispatch(logout());
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
    // Add other reducers if needed...
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
        state.error = (action.payload as any)?.message || "Error sending OTP";
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ token: string; user: any }>) => {
          state.loading = false;
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Login failed";
      });
  },
});

// ✅ Export logout action and reducer
export const { logout } = authSlice.actions;
export default authSlice.reducer;
