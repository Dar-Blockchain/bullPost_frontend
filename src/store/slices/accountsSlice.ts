import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define a general interface for account objects (adjust as needed)
export interface Account {
    _id: string;
    groupName: string;
    webhookUrl: string;
    // Add other properties if needed
}

interface AccountsState {
    accounts: Account[];
    loading: boolean;
    error: string | null;
    preferences: { // Add preferences data
        Discord_Server_Name?: string;
        DISCORD_WEBHOOK_URL?: string;
        TELEGRAM_CHAT_ID?: string;
        TELEGRAM_GroupName?: string;
        OpenIA?: boolean;
        GeminiKey?: string;
        OpenIaKey?: string;
        Gemini?: boolean;
        telegram?: boolean;
        refresh_token?: string;
        twitter?: boolean;
        discord?: boolean;
        twitter_Name?: string;
    };
    preferencesLoading: boolean; // Track loading state for preferences
    preferencesError: string | null; // Track error for preferences
}

const initialState: AccountsState = {
    accounts: [],
    loading: false,
    error: null,
    preferences: {},
    preferencesLoading: false,
    preferencesError: null,
};

// Generic async thunk to load accounts by type (e.g., "discord", "telegram", "twitter")
export const loadAccountsByType = createAsyncThunk<
    Account[],
    string, // accountType parameter (e.g. "discord", "telegram", "twitter")
    { rejectValue: string }
>(
    'accounts/loadByType',
    async (accountType, { rejectWithValue }) => {
        const token = localStorage.getItem("token");
        if (!token) {
            return rejectWithValue("No token found");
        }
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/getAcountData`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({ types: [accountType] }),
                }
            );
            if (!response.ok) {
                const data = await response.json();
                return rejectWithValue(data.error || "Failed to fetch accounts");
            }
            const data = await response.json();
            const accountsArray: Account[] =
                data && data.data && Array.isArray(data.data[accountType])
                    ? data.data[accountType]
                    : [];
            return accountsArray;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for fetching preferences data
export const loadPreferences = createAsyncThunk<
    { Discord_Server_Name?: string; DISCORD_WEBHOOK_URL?: string; TELEGRAM_CHAT_ID?: string; TELEGRAM_GroupName?: string },
    void,
    { rejectValue: string }
>(
    'accounts/loadPreferences',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem("token");
        if (!token) {
            return rejectWithValue("No token found");
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/getPreferences`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                return rejectWithValue(data.error || "Failed to fetch preferences");
            }
            const data = await response.json();
            return data; // Returning preferences data
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const accountsSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        // Optional synchronous reducer(s)
        clearAccounts(state) {
            state.accounts = [];
            state.loading = false;
            state.error = null;
        },
        clearPreferences(state) {
            state.preferences = {};
            state.preferencesLoading = false;
            state.preferencesError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle accounts loading states
            .addCase(loadAccountsByType.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadAccountsByType.fulfilled, (state, action: PayloadAction<Account[]>) => {
                state.loading = false;
                state.accounts = action.payload;
            })
            .addCase(loadAccountsByType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Handle preferences loading states
            .addCase(loadPreferences.pending, (state) => {
                state.preferencesLoading = true;
                state.preferencesError = null;
            })
            .addCase(loadPreferences.fulfilled, (state, action: PayloadAction<{ Discord_Server_Name?: string; DISCORD_WEBHOOK_URL?: string; TELEGRAM_CHAT_ID?: string; TELEGRAM_GroupName?: string }>) => {
                state.preferencesLoading = false;
                state.preferences = action.payload; // Store preferences in state
            })
            .addCase(loadPreferences.rejected, (state, action) => {
                state.preferencesLoading = false;
                state.preferencesError = action.payload as string;
            });
    },
});

export const { clearAccounts, clearPreferences } = accountsSlice.actions;
export default accountsSlice.reducer;
