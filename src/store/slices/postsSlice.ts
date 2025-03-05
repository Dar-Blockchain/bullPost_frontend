import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Post {
    _id: string;
    title: string;
    prompt: string;
    status: string;
    telegram: string;
    createdAt: string;
    twitter: string;
    discord: string;
    image_discord: string;
    image_twitter: string;
    image_telegram: string;
    publishedAtDiscord: string;
    scheduledAtDiscord: string;
    publishedAtTwitter: string;
    scheduledAtTwitter: string;

    publishedAtTelegram: string;
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
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}posts/postsByStatus`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );
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

export const updatePost = createAsyncThunk(
    'posts/updatePost',
    async (
        payload: {
            id: string;
            body: FormData | { telegram?: string; discord?: string; twitter?: string };
        },
        { rejectWithValue }
    ) => {
        const token = localStorage.getItem("token");
        if (!token) {
            return rejectWithValue("Unauthorized: Token not found");
        }
        try {
            let requestBody: BodyInit;
            if (payload.body instanceof FormData) {
                requestBody = payload.body;
            } else {
                requestBody = JSON.stringify(payload.body);
            }
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}posts/updatePost/${payload.id}`,
                {
                    method: "PUT",
                    headers: payload.body instanceof FormData
                        ? { "Authorization": `Bearer ${token}` }
                        : {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                    body: requestBody,
                }
            );
            if (!response.ok) {
                const data = await response.json();
                return rejectWithValue(data.error || "Failed to update post");
            }
            const data = await response.json();
            return data.post || data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// New regeneratePost thunk
export const regeneratePost = createAsyncThunk(
    'posts/regeneratePost',
    async (
        payload: { platform: string; postId: string },
        { rejectWithValue }
    ) => {
        const token = localStorage.getItem("token");
        if (!token) {
            return rejectWithValue("Unauthorized: Token not found");
        }
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}generationGemini/regenerate`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );
            if (!response.ok) {
                const data = await response.json();
                return rejectWithValue(data.error || "Failed to regenerate post");
            }
            const data = await response.json();
            // Map the returned "content" to the "discord" property.
            if (payload.platform === "twitter") {
                return {
                    _id: data.postId,
                    twitter: data.content,
                    platform: data.platform,
                } as Partial<Post>;
            } else if (payload.platform === "telegram") {
                return {
                    _id: data.postId,
                    telegram: data.content,
                    platform: data.platform,
                } as Partial<Post>;
            } else {
                // Default to Discord if none match.
                return {
                    _id: data.postId,
                    discord: data.content,
                    platform: data.platform,
                } as Partial<Post>;
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
export const regeneratePostOpenAi = createAsyncThunk(
    'posts/regeneratePostOpenAi',
    async (
        payload: { platform: string; postId: string },
        { rejectWithValue }
    ) => {
        const token = localStorage.getItem("token");
        if (!token) {
            return rejectWithValue("Unauthorized: Token not found");
        }
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}generationOpenIA/regenerate`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );
            if (!response.ok) {
                const data = await response.json();
                return rejectWithValue(data.error || "Failed to regenerate post");
            }
            const data = await response.json();
            // Map the returned "content" to the "discord" property.
            if (payload.platform === "twitter") {
                return {
                    _id: data.postId,
                    twitter: data.content,
                    platform: data.platform,
                } as Partial<Post>;
            } else if (payload.platform === "telegram") {
                return {
                    _id: data.postId,
                    telegram: data.content,
                    platform: data.platform,
                } as Partial<Post>;
            } else {
                // Default to Discord if none match.
                return {
                    _id: data.postId,
                    discord: data.content,
                    platform: data.platform,
                } as Partial<Post>;
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        setSelectedAnnouncement(state, action: PayloadAction<Post[]>) {
            state.selectedAnnouncement = action.payload;
        },
        clearSelectedAnnouncement(state) {
            state.selectedAnnouncement = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchPostsByStatus cases
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
            })
            // updatePost cases
            .addCase(updatePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePost.fulfilled, (state, action: PayloadAction<Post>) => {
                state.loading = false;
                const updatedPost = action.payload;
                if (!updatedPost || !updatedPost._id) return;
                state.posts = state.posts.map((post) =>
                    post && post._id === updatedPost._id ? updatedPost : post
                );
                state.selectedAnnouncement = state.selectedAnnouncement.map((post) =>
                    post && post._id === updatedPost._id ? updatedPost : post
                );
            })
            .addCase(updatePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // regeneratePost cases
            .addCase(regeneratePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(regeneratePost.fulfilled, (state, action: PayloadAction<Partial<Post>>) => {
                state.loading = false;
                const updatedPost = action.payload;
                state.posts = state.posts.map((post) =>
                    post && post._id === updatedPost._id
                        ? { ...post, ...updatedPost }
                        : post
                );
                state.selectedAnnouncement = state.selectedAnnouncement.map((post) =>
                    post && post._id === updatedPost._id
                        ? { ...post, ...updatedPost }
                        : post
                );
            })
            .addCase(regeneratePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            }).addCase(regeneratePostOpenAi.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(regeneratePostOpenAi.fulfilled, (state, action: PayloadAction<Partial<Post>>) => {
                state.loading = false;
                const updatedPost = action.payload;
                state.posts = state.posts.map((post) =>
                    post && post._id === updatedPost._id
                        ? { ...post, ...updatedPost }
                        : post
                );
                state.selectedAnnouncement = state.selectedAnnouncement.map((post) =>
                    post && post._id === updatedPost._id
                        ? { ...post, ...updatedPost }
                        : post
                );
            })
            .addCase(regeneratePostOpenAi.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

    },
});

export const { setSelectedAnnouncement, clearSelectedAnnouncement } = postsSlice.actions;

export default postsSlice.reducer;
