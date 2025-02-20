import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Avatar, Tabs, Tab, Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  handleOpen: () => void;
  isLoggedIn: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ handleOpen, isLoggedIn }) => {
  const [tabIndex, setTabIndex] = useState(0); // ✅ Ensure state is initialized
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const { user } = useAuth(); // ✅ Get user data
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Check if mobile view

  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false); // Close sidebar if returning to desktop view
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const sidebarContent = (
    <Box
      sx={{
        width: { xs: "100vw", md: 272 }, // Full width on mobile, fixed width on desktop
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
      {/* ✅ Header: Logo & Close Button (for mobile only) */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, width: "100%", mb: 3 }}>
          <Box component="img" src="/BP_Logo.png" alt="BullPost Logo" sx={{ width: 56, height: 52 }} />
          <Typography variant="h6" sx={{ color: "#ff9c00", fontWeight: 600, fontSize: "16px" }}>
            BullPost
          </Typography>
        </Box>
        <IconButton sx={{ display: { md: "none" } }} onClick={handleDrawerToggle}>
          <CloseIcon sx={{ color: "#fff" }} />
        </IconButton>
      </Box>

      {/* ✅ New Post Button */}
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
            mb: 3,
            "&:hover": { backgroundColor: "#FFA500" },
          }}
          onClick={handleOpen}
        >
          New post
        </Button>
      )}

      {/* ✅ Tabs Section */}
      {isLoggedIn && (
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)} // ✅ Updates state
          variant="fullWidth"
          sx={{
            width: "100%",
            mb: 2,
            "& .MuiTabs-indicator": { backgroundColor: "#FFB300" },
            "& .MuiTab-root": {
              minWidth: 80, // Adjust as needed
              color: "#aaa",
              fontWeight: 500,
              textTransform: "none",
              fontSize: "12px",
              "&.Mui-selected": { color: "#FFB300", fontWeight: 600 },
            },
          }}
        >
          <Tab label="Drafts" />
          <Tab label="Scheduled" />
          <Tab label="Posted" />
        </Tabs>
      )}

      {/* ✅ Draft Posts Section */}
      {isLoggedIn && (
        <Box sx={{ width: "100%" }}>
          {[
            { title: "This is text from this draft over a few lines to show an example of how this would look", date: "Tuesday 8 October" },
            { title: "Another example with shorter text", date: "Monday 7 October" },
            { title: "Another example with some text over two lines", date: "Tuesday 8 October" },
          ].map((item, index) => (
            <Box key={index} sx={{ borderBottom: "1px solid #222", pb: 2, mb: 2 }}>
              <Typography sx={{ fontSize: "14px", color: "#fff", mb: 0.5 }}>{item.title}</Typography>
              <Typography sx={{ fontSize: "12px", color: "#aaa" }}>Last edited {item.date}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* ✅ Login Button (if not logged in) */}
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

      {/* 
        ✅ User Info Block at the bottom (shown only if logged in).
        "mt: 'auto'" pushes it to the bottom since we're using 
        "display: flex; flex-direction: column; height: 100vh;" 
      */}
      {isLoggedIn && (
        <Box
          sx={{
            mt: "auto",
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderTop: "1px solid #222",
            width: "100%",
          }}
        >
          <Avatar src={`http://localhost:5000/${user?.user_image}`} sx={{ width: 40, height: 40 }} />
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 600 }}>{user && user.userName}</Typography>
            <Typography sx={{ color: "#aaa", fontSize: "12px" }}>Pro subscription</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* ✅ Mobile Top Bar (Hidden When Sidebar is Open) */}
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
          {/* ✅ Left Block (Logo) */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box component="img" src="/BP_Logo.png" alt="BullPost Logo" sx={{ width: 40, height: 40 }} />
          </Box>

          {/* ✅ Right Block (Buttons) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* New Post Button */}
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

            {/* User Avatar (if logged in) */}
            {isLoggedIn && <Avatar src="/profile.jpg" sx={{ width: 32, height: 32 }} />}

            {/* Hamburger Menu */}
            <IconButton onClick={handleDrawerToggle}>
              <MenuIcon sx={{ color: "#fff" }} />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* ✅ Desktop Sidebar (Always Visible) */}
      {!isMobile && <Box sx={{ width: 272 }}>{sidebarContent}</Box>}

      {/* ✅ Mobile Sidebar (Drawer) */}
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
