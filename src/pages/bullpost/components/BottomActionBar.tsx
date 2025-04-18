
import React, { useEffect, useState } from "react";
import { Box, IconButton, Popover, Button } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description"; // Drafts
import TwitterIcon from "@mui/icons-material/Twitter"; // Twitter (X)
import TelegramIcon from "@mui/icons-material/Telegram"; // Telegram
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"; // Calendar
import SendIcon from "@mui/icons-material/Send"; // Post
import { DateCalendar, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchPostsByStatus } from "@/store/slices/postsSlice";

interface Props {
    activeSection: "calendar" | "drafts" | "discord" | "twitter" | "telegram" | "post";
    setActiveSection: (section: "calendar" | "drafts" | "discord" | "twitter" | "telegram" | "post") => void;
    _id: string;
}

const BottomActionBar: React.FC<Props> = ({ activeSection, setActiveSection, _id }) => {
    const showExtraIcons = ["discord", "twitter", "telegram"].includes(activeSection);
    useEffect(() => {
        console.log(`Active section changed to: ${activeSection}`);
        setActiveSection(activeSection);
    }, [activeSection, setActiveSection]);
    const dispatch = useDispatch<AppDispatch>();

    // Calendar scheduling state
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
    const [timeZone, setTimeZone] = useState<string>("");
    useEffect(() => {
        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);

    const handleCalendarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCalendarClose = () => {
        setAnchorEl(null);
    };

    const handleDateChange = (newDate: Dayjs | null) => {
        setSelectedDate(newDate);
    };

    const handleTimeChange = (newTime: Dayjs | null) => {
        setSelectedTime(newTime);
    };

    // Determine if a schedule is chosen (both date and time selected)
    const isDateChosen = selectedDate !== null && selectedTime !== null;

    const getPostButtonText = () => {
        if (selectedDate && selectedTime) {
            return `${selectedDate.format("MMM DD, YYYY")} - ${selectedTime.format("HH:mm")}`;
        }
        return "Post Now";
    };

    // For demonstration, assume a postId. Replace with your actual post ID.
    const selectedAnnouncement = useSelector(
        (state: RootState) => state.posts.selectedAnnouncement
    );
    const postId = selectedAnnouncement && selectedAnnouncement.length > 0
        ? selectedAnnouncement[0]._id
        : _id;
    const announcement = selectedAnnouncement && selectedAnnouncement.length > 0 ? selectedAnnouncement[0] : null;
    const handlePost = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        if (selectedDate && selectedTime) {
            // Schedule post
            const combinedDateTime = selectedDate
                .set("hour", selectedTime.hour())
                .set("minute", selectedTime.minute())
                .set("second", 0);
            const requestBody = {
                dateTime: combinedDateTime.toISOString(),
                timeZone: timeZone,
            };
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}postDiscord/schedulePost/` + postId,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify(requestBody),
                    }
                );
                if (response.ok) {
                    toast.success("Post scheduled successfully!", { position: "top-right" });
                } else {
                    toast.error("Failed to schedule post.", { position: "top-right" });
                }
            } catch (error) {
                console.error("Error scheduling post:", error);
                toast.error("Error scheduling post.", { position: "top-right" });
            }
        } else {
            // Immediate post
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}postDiscord/postNow/` + postId,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                    }
                );
                const data = await response.json();
                if (response.ok) {
                    toast.success("Post sent successfully!", { position: "top-right" });
                } else {
                    toast.error(`${data.error || "Failed to send message."}`, { position: "top-right" });
                }
            } catch (error) {
                console.error("Error sending post:", error);
                toast.error("Error sending post.", { position: "top-right" });
            }
        }
    };
    const handlePostNow = async () => {

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("❌ Unauthorized: Token not found!", { position: "top-right" });
            return
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}postTelegram/postNow/` + postId, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", "Authorization": `Bearer ${token}`
                },
            });

            const data = await response.json();

            if (response.ok) {
                dispatch(fetchPostsByStatus({ status: "drafts", page: 1, limit: 10 }));

                toast.success("Post sent successfully!", { position: "top-right" });
            } else {
                toast.error(`${data.error || "Failed to send message."}`, { position: "top-right" });
            }
        } catch (error) {
            console.error("Error sending message to Discord:", error);
            toast.error("❌ Failed to send message!", { position: "top-right" });
        }
    };
    const handleSchedulePost = async () => {
        if (!selectedDate || !selectedTime) {
            return handlePostNow(); // Fallback to immediate posting
        }

        const combinedDateTime = selectedDate
            .set("hour", selectedTime.hour())
            .set("minute", selectedTime.minute())
            .set("second", 0);
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("❌ Unauthorized: Token not found!", { position: "top-right" });
            return
        }
        const requestBody = {
            // message: selectedAnnouncement && selectedAnnouncement.length > 0 && selectedAnnouncement[0].discord ? selectedAnnouncement[0].discord : submittedText,
            dateTime: combinedDateTime.toISOString(),
            timeZone, // Auto-detected time zone
        };
        // http://localhost:5000/postTelegram/schedulePostTelegram/67c078ef42a08a64165bfa6c
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}postTelegram/schedulePostTelegram/` + postId, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", "Authorization": `Bearer ${token}`
                }, body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                dispatch(fetchPostsByStatus({ status: "drafts", page: 1, limit: 10 }));

                toast.success("Post scheduled successfully!");
            } else {
                toast.error("Failed to schedule post.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error scheduling post.");
        }
    };
    const [isPosting, setIsPosting] = useState<boolean>(false);

    const handlePostNowTwitter = async () => {
        const textToPost = (announcement ? announcement.twitter : "");
        if (!textToPost) {
            toast.warn("⚠️ Message cannot be empty!", { position: "top-right" });
            return;
        }
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            setIsPosting(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}postTwitter/postNow/` + postId,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            if (response.ok) {
                dispatch(fetchPostsByStatus({ status: "drafts", page: 1, limit: 10 }));
                toast.success("Post sent successfully!", { position: "top-right" });
            } else {
                toast.error(`${data.error || "Failed to send message."}`, { position: "top-right" });
            }
        } catch (error) {
            console.error("Error sending message to Discord:", error);
            toast.error("❌ Failed to send message!", { position: "top-right" });
        } finally {
            setIsPosting(false);
        }
    };
    const handleSchedulePostTwitter = async () => {
        if (!selectedDate || !selectedTime) {
            return handlePostNowTwitter();
        }
        const combinedDateTime = selectedDate
            .set("hour", selectedTime.hour())
            .set("minute", selectedTime.minute())
            .set("second", 0);
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("❌ Unauthorized: Token not found!", { position: "top-right" });
            return;
        }
        const requestBody = {
            dateTime: combinedDateTime.toISOString(),
            timeZone,
        };

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}postTwitter/schedulePostTweet/${postId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestBody),
                }
            );
            if (response.ok) {
                dispatch(fetchPostsByStatus({ status: "drafts", page: 1, limit: 10 }));
                toast.success("Post scheduled successfully!");
            } else {
                toast.error("Failed to schedule post.");
            }
        } catch (error) {
            console.error("Error scheduling post:", error);
            alert("Error scheduling post.");
        }
    };
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
                justifyContent: showExtraIcons ? "space-between" : "center",
                alignItems: "center",
                px: 2,
                zIndex: 1000,
            }}
        >
            {/* Left Section (Calendar Icon with Popover) */}
            {showExtraIcons && (
                <>
                    <IconButton
                        sx={{
                            color: isDateChosen ? "#FFB300" : activeSection === "calendar" ? "#fff" : "#aaa",
                            backgroundColor: activeSection === "calendar" ? "#555" : "transparent",
                            borderRadius: "10px",
                        }}
                        onClick={handleCalendarClick}
                    >
                        <CalendarMonthIcon fontSize="medium" />
                    </IconButton>
                    <Popover
                        open={Boolean(anchorEl)}
                        anchorEl={anchorEl}
                        onClose={handleCalendarClose}
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
                </>
            )}

            {/* Center Section (Social Icons) */}
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
                        // backgroundColor: activeSection === "drafts" ? "#555" : "transparent",
                        borderRadius: "10px",
                    }}
                    onClick={() => setActiveSection("drafts")}
                >
                    <img src="/DraftBottom.png" alt="Discord" />
                </IconButton>

                {/* Discord Icon */}
                <IconButton
                    sx={{
                        color: "#fff",
                        // backgroundColor: activeSection === "discord" ? "#5865F2" : "transparent",
                        borderRadius: "10px",
                    }}
                    onClick={() => setActiveSection("discord")}
                >
                    <img src="/discordBottom.png" alt="Discord" />
                </IconButton>

                {/* Twitter Icon */}
                <IconButton
                    sx={{
                        color: activeSection === "twitter" ? "#fff" : "#aaa",
                        // backgroundColor: activeSection === "twitter" ? "#1DA1F2" : "transparent",
                        borderRadius: "10px",
                    }}
                    onClick={() => setActiveSection("twitter")}
                >
                    <img src="/Xbottom.png" alt="X" />
                </IconButton>

                {/* Telegram Icon */}
                <IconButton
                    sx={{
                        color: activeSection === "telegram" ? "#fff" : "#aaa",
                        // backgroundColor: activeSection === "telegram" ? "#0088CC" : "transparent",
                        borderRadius: "10px",
                    }}
                    onClick={() => setActiveSection("telegram")}
                >
                    <img src="/TelegramBottom.png" alt="Discord" />
                </IconButton>
            </Box>

            {/* Right Section (Post Icon and Post Button Text) */}
            {showExtraIcons && (
                <IconButton
                    sx={{
                        color: activeSection === "post" ? "#fff" : "#aaa",
                        backgroundColor: activeSection === "post" ? "#555" : "transparent",
                        borderRadius: "10px",
                    }}
                    onClick={() => {
                        if (activeSection === "discord") {
                            handlePost();
                        } else if (activeSection === "telegram") {
                            handleSchedulePost()
                        } else if (activeSection === "twitter") {
                            handleSchedulePostTwitter()
                        }
                    }}
                >
                    <SendIcon fontSize="medium" />
                </IconButton>
            )}
        </Box>
    );
};

export default BottomActionBar;
