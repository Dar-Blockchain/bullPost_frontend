import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Switch, Avatar, Button, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ArrowDropDownCircleOutlined, AutoAwesome, Edit, InsertPhoto, Mood, Replay } from "@mui/icons-material";
import TwitterIcon from "@mui/icons-material/Twitter";
import Toolbar from "@/pages/bullpost/components/Toolbar";
import { useAuth } from "@/hooks/useAuth";

interface TwitterBlockProps {
    submittedText: string; // ✅ Accept submitted text as a prop
    onSubmit: () => void; // ✅ Accept API submit function
}

const TwitterBlock: React.FC<TwitterBlockProps> = ({ submittedText, onSubmit }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [displayText, setDisplayText] = useState("");
    const indexRef = useRef(0);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);
    const { user } = useAuth(); // ✅ Get user data

    useEffect(() => {
        if (!submittedText) {
            setDisplayText("");
            indexRef.current = 0;
            return;
        }

        setDisplayText(submittedText[0] || "");
        indexRef.current = 1;

        const typeNextCharacter = () => {
            if (indexRef.current < submittedText.length) {
                const nextChar = submittedText[indexRef.current];

                if (nextChar !== undefined) {
                    setDisplayText((prev) => prev + nextChar);
                    indexRef.current += 1;
                    typingTimeout.current = setTimeout(typeNextCharacter, 30);
                }
            }
        };

        typingTimeout.current = setTimeout(typeNextCharacter, 30);

        return () => {
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
        };
    }, [submittedText]);

    return (
        <>
            <Box
                sx={{
                    flex: 1,
                    backgroundColor: "#111112",
                    p: 2,
                    border: "1px solid #3C3C3C",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: isMobile ? "500px" : "330px", // ✅ Increased height in mobile
                    maxHeight: isMobile ? "500px" : "330px", // ✅ Prevent excessive resizing
                    flexShrink: 0,
                    width: "100%", // ✅ Ensure full width within its container
                    mt: isMobile ? "10px" : "0",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <TwitterIcon fontSize="large" sx={{ color: "#1DA1F2" }} />
                    {user && (

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                padding: "4px 10px",
                                border: "1px solid #3C3C3C",
                                borderRadius: "20px",
                                backgroundColor: "#0F0F0F",
                            }}
                        >
                            <Avatar
                                src="/mnt/data/image.png"
                                alt="Julio"
                                sx={{
                                    width: 26,
                                    height: 26,
                                }}
                            />

                            <Typography
                                sx={{
                                    color: "#8F8F8F",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                }}
                            >
                                @{user.userName}
                            </Typography>

                            <ArrowDropDownCircleOutlined sx={{ color: "#8F8F8F", fontSize: 18 }} />
                        </Box>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Switch color="warning" sx={{ transform: "scale(0.9)" }} />
                </Box>

                <Box
                    sx={{
                        textAlign: "justify",
                        width: "100%",
                        padding: 2,
                        mt: 2,
                        flexGrow: 1,
                        maxHeight: isMobile ? "400px" : "200px",
                        overflowY: "auto",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#FFB300 #333",

                        "&::-webkit-scrollbar": {
                            width: "6px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#FFB300",
                            borderRadius: "10px",
                        },
                        "&::-webkit-scrollbar-track": {
                            backgroundColor: "#333",
                        },
                    }}
                >
                    <Typography sx={{ fontSize: "14px", color: "#8F8F8F", whiteSpace: "pre-line" }}>
                        {displayText || "No announcement yet..."}
                    </Typography>
                </Box>
                {!isMobile && user && (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column", mt: 2, gap: 1 }}>
                            {/* Toolbar Section */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    backgroundColor: "#191919",
                                    borderRadius: "30px",
                                    padding: "8px 15px",
                                    border: "1px solid #3C3C3C",
                                    width: "fit-content",
                                }}
                            >
                                <IconButton sx={{ color: "#8F8F8F" }}>
                                    <Edit fontSize="small" />
                                </IconButton>
                                <IconButton sx={{ color: "#8F8F8F" }}>
                                    <Mood fontSize="small" />
                                </IconButton>
                                <IconButton sx={{ color: "#8F8F8F" }}>
                                    <InsertPhoto fontSize="small" />
                                </IconButton>
                                <IconButton sx={{ color: "#8F8F8F" }}>
                                    <AutoAwesome fontSize="small" />
                                </IconButton>
                                <Box sx={{ width: "1px", height: "20px", backgroundColor: "#555", mx: 1 }} />
                                <IconButton sx={{ color: "red" }}>
                                    <Replay fontSize="small" />
                                </IconButton>
                            </Box>



                        </Box>
                        {/* Bottom Button Section */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                            {/* Yellow Calendar Button */}
                            <Button
                                sx={{
                                    backgroundColor: "#FFB300",
                                    width: 40,
                                    height: 40,
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minWidth: "auto",
                                    "&:hover": {
                                        backgroundColor: "#FFA500",
                                    },
                                }}
                            >
                                <img src="/calendar_month.png" alt="Calendar" />
                            </Button>

                            {/* Post Now Button */}
                            <Button
                                sx={{
                                    backgroundColor: "#191919",
                                    color: "#666",
                                    borderRadius: "12px",
                                    height: 50,
                                    flex: 1,
                                    width: "150px",
                                    "&:hover": {
                                        backgroundColor: "#222",
                                    },
                                }}
                            >
                                Post Now
                            </Button>
                        </Box>
                    </>
                )}
            </Box>

            {isMobile && <Toolbar submittedText={submittedText} onSubmit={onSubmit} />}

            {/* ✅ DESKTOP VERSION: Adding the Block from Image */}

        </>
    );
};

export default TwitterBlock;
