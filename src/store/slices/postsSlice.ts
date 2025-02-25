import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Post {
    _id: string;
    title: string;
    prompt: string;
    status: string;
    // Add other properties as needed
}

interface PostsState {
    posts: Post[];
    selectedAnnouncement: Post[];
    loading: boolean;
    error: string | null;
}

const initialState: PostsState = {
    posts: [],
    selectedAnnouncement: [],
    loading: false,
    error: null,
};

export const fetchPostsByStatus = createAsyncThunk(
    'posts/fetchPostsByStatus',
    async (status: string, { rejectWithValue }) => {
        const token = localStorage.getItem("token");
        if (!token) {
            return rejectWithValue("Unauthorized: Token not found");
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}posts/postsByStatus`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                const data = await response.json();
                return rejectWithValue(data.error || "Failed to fetch posts");
            }
            const data = await response.json();
            return data.posts || [];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        // Reducer to set selected announcements
        setSelectedAnnouncement(state, action: PayloadAction<Post[]>) {
            state.selectedAnnouncement = action.payload;
        },
        // Optionally, a reducer to clear the selected announcements
        clearSelectedAnnouncement(state) {
            state.selectedAnnouncement = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPostsByStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPostsByStatus.fulfilled, (state, action: PayloadAction<Post[]>) => {
                state.loading = false;
                state.posts = action.payload;
            })
            .addCase(fetchPostsByStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setSelectedAnnouncement, clearSelectedAnnouncement } = postsSlice.actions;

export default postsSlice.reducer;
