import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Tabs,
  Tab,
  Drawer,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useAuth } from "@/hooks/useAuth";
import dayjs from "dayjs";
import { AppDispatch } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { clearSelectedAnnouncement, fetchPostsByStatus, setSelectedAnnouncement } from "@/store/slices/postsSlice";
import LogoutIcon from "@mui/icons-material/Logout";
import { logout, logoutUser } from "@/store/slices/authSlice";

interface SidebarProps {
  handleOpen: () => void;
  isLoggedIn: boolean;
  // postPrompt: string;
  // setPostPrompt: (prompt: string) => void;
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

  publishedAtTelegram: string;
}


const Sidebar: React.FC<SidebarProps> = ({
  handleOpen,
  isLoggedIn,
  // postPrompt,
  // setPostPrompt,
}) => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/logout`, {
        method: "POST",
        credentials: "include", // include credentials if required (for HTTP-only cookies)
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        dispatch(logoutUser());
        // Optionally, force a page reload
        window.location.reload();
      } else {
        console.error("Failed to logout", await response.text());
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const dispatch = useDispatch<AppDispatch>();
  // Get posts and loading state from Redux slice
  const { posts, loading } = useSelector((state: any) => state.posts);

  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // activeTab state controls which posts to fetch
  const [activeTab, setActiveTab] = useState<"drafts" | "scheduled" | "posted">("drafts");

  // Dispatch fetchPostsByStatus thunk whenever activeTab or isLoggedIn changes
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchPostsByStatus(activeTab));
      console.log("Dispatched fetchPostsByStatus", posts.length);
    }
  }, [activeTab, posts.length, isLoggedIn, dispatch]);

  // Handle tab change
  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: "drafts" | "scheduled" | "posted"
  ) => {
    setActiveTab(newValue);
  };

  const sidebarContent = (
    <Box
      sx={{
        width: { xs: "100vw", md: 272 },
        backgroundColor: "#101010",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 3,
        height: "100vh",
        justifyContent: "flex-start",
        px: 2,
      }}
    >
      {/* Header: Logo & Close Button (mobile only) */}
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
          <Box
            component="img"
            src="/BP_Logo.png"
            alt="BullPost Logo"
            sx={{ width: 56, height: 52 }}
          />
          <Typography
            variant="h6"
            sx={{ color: "#ff9c00", fontWeight: 600, fontSize: "16px" }}
          >
            BullPost
          </Typography>
        </Box>
        <IconButton sx={{ display: { md: "none" } }} onClick={handleDrawerToggle}>
          <CloseIcon sx={{ color: "#fff" }} />
        </IconButton>
      </Box>

      {/* New Post Button */}
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
            "&:hover": { backgroundColor: "#FFA500" },
          }}
          onClick={() => dispatch(clearSelectedAnnouncement())}
        >
          New post
        </Button>
      )}

      {/* Tabs Section */}
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

      {/* Posts Section */}
      {isLoggedIn && (
        <Box
          sx={{
            width: "100%",
            maxHeight: "400px", // adjust as needed
            overflowY: "auto",  // enables vertical scrolling
            "&::-webkit-scrollbar": {
              width: "0px", // smaller scrollbar width
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#FFB300", // gold scrollbar thumb
              borderRadius: "3px",
            },
          }}
        >
          {loading ? (
            <Typography
              sx={{
                fontSize: "14px",
                color: "#aaa",
                mt: 2,
                textAlign: "center",
              }}
            >
              Loading...
            </Typography>
          ) : posts && posts.length > 0 ? (
            posts.map((item: Post, index: number) => (
              <Box
                key={index}
                sx={{ borderBottom: "1px solid #222", pb: 2, mt: 2 }}
                onClick={() => {
                  // Update local state and dispatch the selected announcement
                  dispatch(setSelectedAnnouncement([item]));
                }}
              >
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
                  }}
                >
                  {item.prompt}
                </Typography>
                <Typography sx={{ fontSize: "12px", color: "#A6A6A6" }}>
                  Last edited {dayjs(item.createdAt).format("MMM DD, YYYY")}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography
              sx={{
                fontSize: "14px",
                color: "#aaa",
                mt: 2,
                textAlign: "center",
              }}
            >
              No posts available.
            </Typography>
          )}
        </Box>
      )}


      {/* Login Button (if not logged in) */}
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

      {/* User Info Block at the bottom */}
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
            src={`http://localhost:5000/${user?.user_image}`}
            sx={{ width: 40, height: 40 }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 600 }}>
                {user && user.userName}
              </Typography>
              <Typography sx={{ color: "#aaa", fontSize: "12px" }}>
                Pro subscription
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleLogout}          >
            <LogoutIcon sx={{ color: "#fff" }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile Top Bar */}
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
            zIndex: 1500,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              component="img"
              src="/BP_Logo.png"
              alt="BullPost Logo"
              sx={{ width: 40, height: 40 }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              sx={{
                backgroundColor: "#FFB300",
                color: "#111",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#FFA500" },
              }}
              onClick={handleOpen}
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

      {/* Desktop Sidebar */}
      {!isMobile && <Box sx={{ width: 272 }}>{sidebarContent}</Box>}

      {/* Mobile Sidebar (Drawer) */}
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
