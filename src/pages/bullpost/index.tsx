import React, { useState } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import BackgroundImage from "./components/BackgroundImage";
import Announcement from "./components/Announcement";
import Toolbar from "./components/Toolbar";

import LoginModal from "@/components/loginModal/LoginModal";
import BottomActionBar from "./components/BottomActionBar";
import DiscordBlock from "@/components/socialMediaBlocks/DiscordBlock";
import TwitterBlock from "@/components/socialMediaBlocks/TwitterBlock";
import TelegramBlock from "@/components/socialMediaBlocks/TelegramBlock";
import SocialMediaBlocks from "./components/SocialMediaBlocks";

export default function BullPostPage() {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // ✅ State to track active section
    const [activeSection, setActiveSection] = useState<"calendar" | "drafts" | "discord" | "twitter" | "telegram" | "post">("drafts");

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#111", color: "#fff", overflow: "hidden" }}>
            {/* Background Image */}
            <BackgroundImage />

            {/* Content */}
            <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: isMobile ? "column" : "row", height: "100%" }}>
                {/* Main Content */}
                <Box sx={{ mt: 10, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", p: 2, width: "100%" }}>

                    {/* ✅ Desktop: Show All Components */}
                    {!isMobile ? (
                        <>
                            <Announcement />
                            <Toolbar />

                            <SocialMediaBlocks />
                        </>
                    ) : (
                        <>
                            {activeSection === "drafts" && <Announcement />}
                            {activeSection === "discord" && <DiscordBlock />}
                            {activeSection === "twitter" && <TwitterBlock />}
                            {activeSection === "telegram" && <TelegramBlock />}
                        </>
                    )}

                </Box>
            </Box>

            {/* ✅ Pass `activeSection` to BottomActionBar */}
            {isMobile && <BottomActionBar activeSection={activeSection} setActiveSection={setActiveSection} />}

            {/* Login Modal */}
            <LoginModal open={open} handleClose={handleClose} />
        </Box>
    );
}
