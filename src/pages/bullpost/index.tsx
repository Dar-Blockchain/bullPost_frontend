import React, { useState } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Announcement from "./components/Announcement";
import Toolbar from "./components/Toolbar";

import LoginModal from "@/components/loginModal/LoginModal";
import BottomActionBar from "./components/BottomActionBar";
import DiscordBlock from "@/components/socialMediaBlocks/DiscordBlock";
import TwitterBlock from "@/components/socialMediaBlocks/TwitterBlock";
import TelegramBlock from "@/components/socialMediaBlocks/TelegramBlock";

export default function BullPostPage() {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const [submittedText, setSubmittedText] = useState("");
    const [discordText, setDiscordText] = useState("");
    const [twitterText, setTwitterText] = useState("");
    const [telegramText, setTelegramText] = useState("");
    const [_id, setId] = useState("");

    const handleClose = () => setOpen(false);
    const [text, setText] = useState(
        "We have now moved from our private Beta phase into public, onboarding new users and taking wider feedback.\n\nPlease continue to share bugs you find with the team!"
    );

    const handleSubmit = async () => {
        if (!text.trim()) {
            alert("Please enter text before submitting!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/generationGemini/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: text }),
            });

            const data = await response.json();
            console.log("API Response:", data);
            setSubmittedText(data.newPost);
            setDiscordText(data.newPost.discord);
            setTwitterText(data.newPost.twitter);
            setTelegramText(data.newPost.telegram);
            setId(data.newPost._id);
        } catch (error) {
            console.error("API Error:", error);
            alert("Failed to submit text!");
        }
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [activeSection, setActiveSection] = useState<"calendar" | "drafts" | "discord" | "twitter" | "telegram" | "post">("drafts");

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#111", color: "#fff", overflow: "hidden", width: "100%", flexGrow: 1 }}>
            {/* Background Image */}
            {/* <BackgroundImage />

            {/* Content */}
            <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: isMobile ? "column" : "row", height: "100%" }}>
                {/* Main Content */}
                <Box sx={{ mt: 5, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>

                    {/* ✅ Desktop: Show All Components */}
                    {!isMobile ? (
                        <>
                            <Announcement text={text} setText={setText} />
                            <Toolbar submittedText={submittedText} onSubmit={handleSubmit} />

                            <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", width: "100%", mt: 4 }}>

                                <TwitterBlock submittedText={twitterText} _id={_id}  onSubmit={handleSubmit} />
                                <TelegramBlock submittedText={telegramText} _id={_id}  onSubmit={handleSubmit} />
                                <DiscordBlock submittedText={discordText} _id={_id}  onSubmit={handleSubmit} />

                            </Box>
                        </>
                    ) : (
                        <>
                            {activeSection === "drafts" && (
                                <>
                                    <Announcement text={text} setText={setText} />
                                    <Toolbar submittedText={submittedText} onSubmit={handleSubmit} />
                                </>
                            )}
                            {activeSection === "discord" && <DiscordBlock submittedText={discordText} _id={_id} onSubmit={handleSubmit} />}
                            {activeSection === "twitter" && <TwitterBlock submittedText={twitterText} _id={_id} onSubmit={handleSubmit} />}
                            {activeSection === "telegram" && <TelegramBlock submittedText={telegramText} _id={_id} onSubmit={handleSubmit} />}
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
