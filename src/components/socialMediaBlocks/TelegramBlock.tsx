// import React from "react";
// import { Box, Typography, Switch, useTheme, useMediaQuery } from "@mui/material";
// import TelegramIcon from "@mui/icons-material/Telegram";
// import Toolbar from "@/pages/bullpost/components/Toolbar";
// interface TwitterBlockProps {
//     submittedText: string; // ✅ Accept submitted text as a prop
//     onSubmit: () => void; // ✅ Accept API submit function
// }

// const TelegramBlock: React.FC<TwitterBlockProps> = ({ submittedText, onSubmit }) => {
//     const theme = useTheme();
//     const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect mobile view
//     return (
//         <>

//             <Box
//                 sx={{
//                     flex: 1,
//                     backgroundColor: "#111112",
//                     p: 2,
//                     border: "1px solid #3C3C3C",
//                     textAlign: "center",
//                 }}
//             >
//                 <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                     <TelegramIcon fontSize="large" sx={{ color: "#0088CC" }} />
//                     <Switch color="warning" />
//                 </Box>
//                 <Box sx={{ textAlign: "center", width: "100%", padding: 4, mt: 2 }}>
//                     <Typography sx={{ fontSize: "14px", color: "#8F8F8F" }}>
//                         This would have UI elements specific to Telegram.
//                     </Typography>
//                     <Typography sx={{ fontSize: "14px", color: "#8F8F8F", mt: 1 }}>
//                         We have now moved from our private Beta phase into public, onboarding new users.
//                     </Typography>
//                     <Typography sx={{ fontSize: "14px", color: "#8F8F8F", mt: 1 }}>
//                         Please continue to share bugs with the team!
//                     </Typography>
//                 </Box>
//             </Box>
//             {isMobile && <Toolbar submittedText={submittedText} onSubmit={onSubmit} />}
//         </>
//     );
// };

// export default TelegramBlock;
import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Switch, Avatar, Button, IconButton } from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports"; // Discord icon
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Toolbar from "@/pages/bullpost/components/Toolbar";
import { ArrowDropDownCircleOutlined, AutoAwesome, Edit, InsertPhoto, Mood, Replay } from "@mui/icons-material";
import TelegramIcon from "@mui/icons-material/Telegram";
import { useAuth } from "@/hooks/useAuth";

interface TelegramBlockProps {
    submittedText: string; // ✅ Accept submitted text as a prop
    onSubmit: () => void; // ✅ Accept API submit function
}

const TelegramBlock: React.FC<TelegramBlockProps> = ({ submittedText, onSubmit }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect mobile view
    const [displayText, setDisplayText] = useState(""); // ✅ Store dynamically revealed text
    const indexRef = useRef(0); // ✅ Track character index
    const typingTimeout = useRef<NodeJS.Timeout | null>(null); // ✅ Keep track of timeout
    const { user } = useAuth(); // ✅ Get user data

    useEffect(() => {
        if (!submittedText) {
            setDisplayText(""); // Reset when there's no text
            indexRef.current = 0;
            return;
        }

        setDisplayText(submittedText[0] || ""); // ✅ Ensure first character is displayed immediately
        indexRef.current = 1; // ✅ Start from second character

        // ✅ Typing effect function
        const typeNextCharacter = () => {
            if (indexRef.current < submittedText.length) {
                const nextChar = submittedText[indexRef.current]; // ✅ Get next character

                if (nextChar !== undefined) { // ✅ Check if not undefined
                    setDisplayText((prev) => prev + nextChar); // ✅ Append character
                    indexRef.current += 1;
                    typingTimeout.current = setTimeout(typeNextCharacter, 30); // ✅ Faster typing speed (30ms per character)
                }
            }
        };

        typingTimeout.current = setTimeout(typeNextCharacter, 30); // ✅ Start typing after delay (30ms)

        return () => {
            if (typingTimeout.current) clearTimeout(typingTimeout.current); // ✅ Cleanup timeout
        };
    }, [submittedText]); // ✅ Trigger effect when new text is submitted

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
                    {/* ✅ Box for Discord Icon + Profile */}
                    <TelegramIcon fontSize="large" sx={{ color: "#0088CC" }} />
                    {user && (

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                padding: "4px 10px",
                                border: "1px solid #3C3C3C", // ✅ Border only around Discord + Profile
                                borderRadius: "20px", // ✅ Rounded corners for smooth UI
                                backgroundColor: "#0F0F0F", // ✅ Dark background to match screenshot

                            }}
                        >
                            {/* ✅ Discord Icon Inside the Box */}

                            {/* ✅ Profile Picture */}
                            <Avatar
                                src="/mnt/data/image.png" // Replace with actual user image
                                alt="Julio"
                                sx={{
                                    width: 26,
                                    height: 26,
                                }}
                            />

                            {/* ✅ Username */}
                            <Typography
                                sx={{
                                    color: "#8F8F8F",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                }}
                            >
                                @{user.userName} {/* ✅ Display username  */}
                            </Typography>

                            {/* ✅ Dropdown Arrow */}
                            <ArrowDropDownCircleOutlined sx={{ color: "#8F8F8F", fontSize: 18 }} />
                        </Box>
                    )}
                    {/* ✅ Space between Profile and Switch */}
                    <Box sx={{ flexGrow: 1 }} />

                    {/* ✅ Switch Button */}
                    <Switch color="warning" sx={{ transform: "scale(0.9)" }} />
                </Box>

                {/* ✅ Scrolling Box with Gold Thin Scrollbar */}
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

            {/* ✅ Pass Props to Toolbar in Mobile View */}
            {isMobile && <Toolbar submittedText={submittedText} onSubmit={onSubmit} />}
        </>
    );
};

export default TelegramBlock;
