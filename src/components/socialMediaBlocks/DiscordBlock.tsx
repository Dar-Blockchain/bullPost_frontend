import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Switch, Avatar, IconButton, Button, Popover } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ArrowDropDownCircleOutlined, AutoAwesome, Edit, InsertPhoto, Mood, Replay } from "@mui/icons-material";
import Toolbar from "@/pages/bullpost/components/Toolbar";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs, { Dayjs } from "dayjs";
import { DateCalendar, DateTimePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

interface DiscordBlockProps {
    submittedText: string;
    onSubmit: () => void;
}

const DiscordBlock: React.FC<DiscordBlockProps> = ({ submittedText, onSubmit }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [displayText, setDisplayText] = useState("");
    const indexRef = useRef(0);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);
    const { user } = useAuth(); // ✅ Get user data
    const handlePostNow = async () => {
        if (!submittedText.trim()) {
            toast.warn("⚠️ Message cannot be empty!", { position: "top-right" });
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/postDiscord/postNow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: submittedText }), // ✅ Send message
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Message sent successfully!", { position: "top-right" });
            } else {
                toast.error(`❌ Error: ${data.error || "Failed to send message."}`, { position: "top-right" });
            }
        } catch (error) {
            console.error("Error sending message to Discord:", error);
            toast.error("❌ Failed to send message!", { position: "top-right" });
        }
    };
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
    //////////////// here 
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
    const [message, setMessage] = useState<string>("");
    const [timeZone, setTimeZone] = useState<string>("");
    const [buttonText, setButtonText] = useState<string>("Post Now"); // Default button text

    useEffect(() => {
        // Automatically detect user's time zone
        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDateChange = (newDate: Dayjs | null) => {
        setSelectedDate(newDate);
        updateButtonText(newDate, selectedTime);
    };

    const handleTimeChange = (newTime: Dayjs | null) => {
        setSelectedTime(newTime);
        updateButtonText(selectedDate, newTime);
    };

    const updateButtonText = (date: Dayjs | null, time: Dayjs | null) => {
        if (date && time) {
            setButtonText(`${date.format("MMM DD, YYYY")} - ${time.format("HH:mm")}`);
        } else {
            setButtonText("Post Now");
        }
    };

    const handleSchedulePost = async () => {
        if (!selectedDate || !selectedTime) {
            return handlePostNow(); // Fallback to immediate posting
        }

        // Ensure selectedDate and selectedTime are not null before calling .hour()
        const combinedDateTime = selectedDate
            .set("hour", selectedTime.hour())
            .set("minute", selectedTime.minute())
            .set("second", 0);

        const requestBody = {
            message: submittedText,
            dateTime: combinedDateTime.toISOString(),
            timeZone, // Auto-detected time zone
        };

        try {
            const response = await fetch("http://localhost:5000/postDiscord/schedulePost", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                alert("Post scheduled successfully!");
            } else {
                alert("Failed to schedule post.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error scheduling post.");
        }
    };
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
                    <img
                        src="/discord.svg"
                        alt="Discord"
                        style={{ width: 30, height: 30, marginRight: "10px" }}
                    />
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
                {/* <p> discord content post from Gemini Platform here
                </p> */}
                {/* ✅ Scrolling Box with Fixed Width & Preventing Expansion */}
                <Box
                    sx={{
                        textAlign: "justify",
                        width: "100%",
                        padding: 2,
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
                                onClick={handleClick}
                            >
                                <img src="/calendar_month.png" alt="Calendar" />
                            </Button>

                            {/* Calendar & Time Picker Popover */}
                            <Popover
                                open={Boolean(anchorEl)}
                                anchorEl={anchorEl}
                                onClose={handleClose}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "left",
                                }}
                            >
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <Box sx={{ p: 2 }}>
                                        <DateCalendar value={selectedDate} onChange={handleDateChange} />
                                        <TimePicker label="Select Time" value={selectedTime} onChange={handleTimeChange} />
                                    </Box>
                                </LocalizationProvider>
                            </Popover>

                            {/* Display Selected Date & Time on Button */}
                            <Button
                                onClick={handleSchedulePost}
                                sx={{
                                    backgroundColor: "#191919",
                                    color: "#FFF",
                                    borderRadius: "12px",
                                    height: 50,
                                    flex: 1,
                                    width: "200px",
                                    textTransform: "none",
                                    "&:hover": {
                                        backgroundColor: "#222",
                                    },
                                }}
                            >
                                {buttonText}
                            </Button>
                        </Box>
                    </>
                )}
            </Box>

            {isMobile && <Toolbar submittedText={submittedText} onSubmit={onSubmit} />}
        </>
    );
};

export default DiscordBlock;
