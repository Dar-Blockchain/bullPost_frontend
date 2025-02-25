import React, { useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description"; // Drafts
import SportsEsportsIcon from "@mui/icons-material/SportsEsports"; // Discord
import TwitterIcon from "@mui/icons-material/Twitter"; // Twitter (X)
import TelegramIcon from "@mui/icons-material/Telegram"; // Telegram
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"; // Calendar
import SendIcon from "@mui/icons-material/Send"; // Post

interface Props {
    activeSection: "calendar" | "drafts" | "discord" | "twitter" | "telegram" | "post";
    setActiveSection: (section: "calendar" | "drafts" | "discord" | "twitter" | "telegram" | "post") => void;
}

const BottomActionBar: React.FC<Props> = ({ activeSection, setActiveSection }) => {
    // ✅ Check if Calendar & Post should be visible
    const showExtraIcons = ["discord", "twitter", "telegram"].includes(activeSection);
    useEffect(() => {
        console.log(`Active section changed to: ${activeSection}`);
        setActiveSection(activeSection)
        // You can perform other side effects here when activeSection updates
    }, [activeSection]);
    return (
        <Box
            sx={{
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "100%",
                backgroundColor: "#161616",
                borderTop: "1px solid #222",
                py: 1,
                display: "flex",
                justifyContent: showExtraIcons ? "space-between" : "center", // Center when Calendar is not visible
                alignItems: "center",
                px: 2,
                zIndex: 1000,
            }}
        >
            {/* ✅ Left Section (Calendar Icon) */}
            {showExtraIcons && (
                <IconButton
                    sx={{
                        color: activeSection === "calendar" ? "#fff" : "#aaa",
                        backgroundColor: activeSection === "calendar" ? "#555" : "transparent",
                        borderRadius: "10px",
                    }}
                    onClick={() => { }}
                >
                    <CalendarMonthIcon fontSize="medium" />
                </IconButton>
            )}

            {/* ✅ Center Section (Social Icons) */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    backgroundColor: "#171717",
                    padding: "10px 15px",
                    borderRadius: "10px",
                    border: "1px solid #262626",

                }}
            >
                {/* Drafts Icon */}
                <IconButton
                    sx={{
                        color: activeSection === "drafts" ? "#fff" : "#aaa",
                        backgroundColor: activeSection === "drafts" ? "#555" : "transparent",
                        borderRadius: "10px",
                    }}
                    onClick={() => setActiveSection("drafts")}
                >
                    <DescriptionIcon fontSize="medium" />
                </IconButton>

                {/* Discord Icon (always highlighted when selected) */}
                <IconButton
                    sx={{
                        color: "#fff", // Keep white when selected
                        backgroundColor: activeSection === "discord" ? "#5865F2" : "transparent",
                        borderRadius: "10px",
                    }}
                    onClick={() => setActiveSection("discord")}
                >
                    <img
                        src="/discordBottom.png"
                        alt="Discord"
                        style={{ marginRight: "10px" }}
                    />                </IconButton>

                {/* Twitter (X) Icon */}
                <IconButton
                    sx={{
                        color: activeSection === "twitter" ? "#fff" : "#aaa",
                        backgroundColor: activeSection === "twitter" ? "#1DA1F2" : "transparent",
                        borderRadius: "10px",
                    }}
                    onClick={() => setActiveSection("twitter")}
                >
                    <TwitterIcon fontSize="medium" />
                </IconButton>

                {/* Telegram Icon */}
                <IconButton
                    sx={{
                        color: activeSection === "telegram" ? "#fff" : "#aaa",
                        backgroundColor: activeSection === "telegram" ? "#0088CC" : "transparent",
                        borderRadius: "10px",
                    }}
                    onClick={() => setActiveSection("telegram")}
                >
                    <TelegramIcon fontSize="medium" />
                </IconButton>
            </Box>

            {/* ✅ Right Section (Post Icon) */}
            {showExtraIcons && (
                <IconButton
                    sx={{
                        color: activeSection === "post" ? "#fff" : "#aaa",
                        backgroundColor: activeSection === "post" ? "#555" : "transparent",
                        borderRadius: "10px",
                    }}
                    onClick={() => { }}
                >
                    <SendIcon fontSize="medium" />
                </IconButton>
            )}
        </Box>
    );
};

export default BottomActionBar;
