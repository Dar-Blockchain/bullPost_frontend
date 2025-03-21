// src/store/slices/accountsSlice.ts
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
}

const initialState: AccountsState = {
    accounts: [],
    loading: false,
    error: null,
};

// Generic async thunk to load accounts by type (e.g., "discord", "twitter", "telegram")
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
            // Using bracket notation to pick the right account array from response data
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
    },
    extraReducers: (builder) => {
        builder
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
            });
    },
});

export const { clearAccounts } = accountsSlice.actions;
export default accountsSlice.reducer;
