import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Tabs,
  Tab,
  Drawer,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useAuth } from "@/hooks/useAuth";
import dayjs from "dayjs";
import { AppDispatch } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSelectedAnnouncement,
  fetchPostsByStatus,
  setSelectedAnnouncement,
} from "@/store/slices/postsSlice";
import { logoutUser } from "@/store/slices/authSlice";
import ProfileModal from "../profileUserModal/ProfilModal";
import { toast } from "react-toastify";

interface SidebarProps {
  handleOpen: () => void;
  isLoggedIn: boolean;
}

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
  scheduledAtTelegram: string;
  publishedAtTelegram: string;
}

const Sidebar: React.FC<SidebarProps> = ({ handleOpen, isLoggedIn }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"drafts" | "scheduled" | "posted">("drafts");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // State for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const postsEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const dispatch = useDispatch<AppDispatch>();

  const { posts, totalPages, loading: postsLoading } = useSelector((state: any) => state.posts);

  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenProfile = () => {
    setOpenProfile(true);
  };

  const handleCloseProfile = () => {
    setOpenProfile(false);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        dispatch(logoutUser());
        window.location.href = "/";
      } else {
        console.error("Failed to logout", await response.text());
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const loadPosts = async () => {
    if (loading || postsLoading || currentPage > totalPages) return;
    setLoading(true);
    dispatch(fetchPostsByStatus({ status: activeTab, page: currentPage, limit: 10 }));
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn && currentPage <= totalPages) {
      loadPosts();
    }
  }, [activeTab, currentPage, isLoggedIn, dispatch, totalPages]);

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: "drafts" | "scheduled" | "posted"
  ) => {
    setActiveTab(newValue);
    setCurrentPage(1);
    setSelectedPostId(null);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const onManualGenerate = async () => {
    console.log("hi");
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}posts/addPost`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            prompt: "New Draft",
            twitter: "New Draft",
            telegram: "New Draft",
            discord: "New Draft",
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        dispatch(fetchPostsByStatus({ status: "drafts", page: 1, limit: 10 })).then(() => {
          setSelectedPostId(data._id);
        }); dispatch(setSelectedAnnouncement([data]));
        // setSelectedPostId(data._id);
        toast.success("New draft generated successfully!", { position: "top-right" });
      } else {
        console.error("Failed to add post", data.error);
        toast.error(`Failed to add post: ${data.error || "Unknown error"}`, {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error adding post:", error);
      toast.error("Error adding post!", { position: "top-right" });
    }
  };

  // Open the delete confirmation modal
  const handleOpenDeleteModal = (postIdToDelete: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent selecting the post when clicking the delete icon
    setPostToDelete(postIdToDelete);
    setDeleteModalOpen(true);
  };

  // Confirm deletion and delete the post
  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}posts/deletePost/${postToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        toast.success("Post deleted successfully!", { position: "top-right" });
        setDeleteModalOpen(false);
        setPostToDelete(null);
        // Refresh the posts list by reloading the first page
        setCurrentPage(1);
        dispatch(fetchPostsByStatus({ status: activeTab, page: 1, limit: 10 }));
      } else {
        const data = await response.json();
        toast.error(`Failed to delete post: ${data.error || "Unknown error"}`, { position: "top-right" });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Error deleting post!", { position: "top-right" });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setPostToDelete(null);
  };

  // Auto-select a new post when the current selection becomes empty and posts list is updated
  useEffect(() => {
    if (isLoggedIn && (!selectedPostId || !posts.some((p: Post) => p._id === selectedPostId)) && posts.length > 0) {
      setSelectedPostId(posts[0]._id);
      dispatch(setSelectedAnnouncement([posts[0]]));
    }
  }, [posts, isLoggedIn, selectedPostId, dispatch]);

  const sidebarContent = (
    <Box
      sx={{
        width: { xs: "100vw", md: 272 },
        backgroundColor: "#101010",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 3,
        height: "100%",
        justifyContent: "flex-start",
        px: 2,
        borderRight: "1px solid #222",
        fontFamily: "Sora, sans-serif",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            width: "100%",
            mb: 3,
          }}
        >
          <Box component="img" src="/BP_Logo.png" alt="BullPost Logo" sx={{ width: 50, height: 50, mr: 1 }} />
          <Typography variant="h6" sx={{ color: "#ff9c00", fontWeight: 600, fontSize: "16px" }}>
            BullPost
          </Typography>
        </Box>
        <IconButton sx={{ display: { md: "none" } }} onClick={handleDrawerToggle}>
          <CloseIcon sx={{ color: "#fff" }} />
        </IconButton>
      </Box>

      {/* New Post */}
      {isLoggedIn && (
        <Button
          variant="contained"
          sx={{
            width: "100%",
            backgroundColor: "#FFB300",
            color: "#111",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "14px",
            textTransform: "none",
            mt: "-20px",
            mb: 3,
            zIndex: 200,
            "&:hover": { backgroundColor: "#FFA500" },
          }}
          onClick={onManualGenerate}
        >
          New post
        </Button>
      )}

      {/* Tabs */}
      {isLoggedIn && (
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            "& .MuiTabs-indicator": { backgroundColor: "#FFB300" },
            "& .MuiTab-root": {
              color: "#aaa",
              fontWeight: 500,
              textTransform: "none",
              fontSize: "12px",
              "&.Mui-selected": { color: "#FFB300", fontWeight: 600 },
            },
          }}
        >
          <Tab label="Drafts" value="drafts" />
          <Tab label="Scheduled" value="scheduled" />
          <Tab label="Posted" value="posted" />
        </Tabs>
      )}

      {/* Posts */}
      {isLoggedIn && (
        <Box
          sx={{
            width: "100%",
            maxHeight: "400px",
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: "0px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#FFB300",
              borderRadius: "3px",
            },
          }}
        >
          {postsLoading ? (
            <Typography sx={{ fontSize: "14px", color: "#aaa", mt: 2, textAlign: "center" }}>
              Loading...
            </Typography>
          ) : posts.length > 0 ? (
            posts.map((item: Post, index: number) => (
              <Box
                key={index}
                sx={{
                  borderBottom: "1px solid #222",
                  pb: 2,
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  "&:hover": { cursor: "pointer" },
                }}
                onClick={() => {
                  setSelectedPostId(item._id);
                  dispatch(setSelectedAnnouncement([item]));
                }}
              >
                <Box sx={{ flexGrow: 1, mr: 1 }}>
                  <Typography
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "14px",
                      color: "#C0C0C0",
                      mb: 0.5,
                      fontWeight: selectedPostId === item._id ? 700 : 400,
                    }}
                  >
                    {item.prompt}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#A6A6A6" }}>
                    Last edited {dayjs(item.createdAt).format("MMM DD, YYYY")}
                  </Typography>
                </Box>
                {/* Trash Icon */}
                <IconButton
                  onClick={(e) => handleOpenDeleteModal(item._id, e)}
                  size="small"
                  sx={{ color: "#FFB300" }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))
          ) : (
            <Typography sx={{ fontSize: "14px", color: "#aaa", mt: 2, textAlign: "center" }}>
              No posts available.
            </Typography>
          )}

          {currentPage < totalPages && (
            <Button
              onClick={handleLoadMore}
              variant="outlined"
              sx={{
                marginTop: "20px",
                width: "100%",
                borderRadius: "10px",
                fontSize: "14px",
                color: "#FFB300",
                borderColor: "#FFB300",
                "&:hover": { backgroundColor: "#FFA500", color: "#111" },
              }}
            >
              Load More
            </Button>
          )}
        </Box>
      )}

      {/* Login */}
      {!isLoggedIn && (
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{
            mt: "auto",
            backgroundColor: "#FFB300",
            color: "#111",
            width: "100%",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "14px",
            "&:hover": { backgroundColor: "#FFA500" },
          }}
        >
          Login
        </Button>
      )}

      {/* User Info */}
      {isLoggedIn && (
        <Box
          sx={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderTop: "1px solid #222",
            width: "100%",
          }}
        >
          <Avatar
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user?.user_image}`}
            sx={{ width: 40, height: 40 }}
            onClick={handleOpenProfile}
          />
          <Box onClick={handleOpenProfile} sx={{ cursor: "pointer", flexGrow: 1 }}>
            <Typography sx={{ color: "#fff", fontWeight: 600 }}>{user?.userName}</Typography>
            <Typography sx={{ color: "#aaa", fontSize: "12px" }}>Pro subscription</Typography>
          </Box>
          <IconButton onClick={handleLogout}>
            <LogoutIcon sx={{ color: "#fff" }} />
          </IconButton>
        </Box>
      )}

      <ProfileModal open={openProfile} onClose={handleCloseProfile} user={user} />

      {/* Delete Confirmation Modal styled like ConnectModal */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleCancelDelete}
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#171717",
            color: "#555555",
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
            overflow: "hidden",
          },
        }}
      >
        <DialogContent
          sx={{
            backgroundColor: "#101010",
            py: 2,
            px: 3,
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#FFB300",
              borderRadius: "3px",
            },
            backgroundImage: "url('/Ellipse 4.png')",
            backgroundSize: "cover",
            backgroundPosition: "top",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Delete Post
            </Typography>
            <Divider sx={{ borderColor: "#444" }} />
            <Typography variant="body1">
              Are you sure you want to delete this post? This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: "#101010",
            py: 2,
            px: 3,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
            <Button
              variant="contained"
              onClick={handleCancelDelete}
              sx={{
                backgroundColor: "grey",
                color: "#fff",
                "&:hover": { backgroundColor: "#888" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={confirmDeletePost}
              sx={{
                backgroundColor: "#FFB300",
                color: "#000",
                ml: "10px",
                "&:hover": { backgroundColor: "#e6ac00" },
              }}
            >
              Delete
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <>
      {isMobile && !mobileOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#171717",
            padding: "10px 15px",
            borderBottom: "1px solid #222",
            zIndex: 4,
          }}
        >
          <Box component="img" src="/BP_Logo.png" alt="BullPost Logo" sx={{ width: 40, height: 40 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              sx={{
                backgroundColor: "#FFB300",
                color: "#111",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#FFA500" },
              }}
              onClick={() => {
                setSelectedPostId(null);
                dispatch(clearSelectedAnnouncement());
              }}
            >
              <AddIcon />
            </IconButton>
            {isLoggedIn && <Avatar src="/profile.jpg" sx={{ width: 32, height: 32 }} />}
            <IconButton onClick={handleDrawerToggle}>
              <MenuIcon sx={{ color: "#fff" }} />
            </IconButton>
          </Box>
        </Box>
      )}

      {!isMobile && <Box sx={{ width: 272 }}>{sidebarContent}</Box>}

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{ "& .MuiDrawer-paper": { backgroundColor: "#101010", width: "100vw" } }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
