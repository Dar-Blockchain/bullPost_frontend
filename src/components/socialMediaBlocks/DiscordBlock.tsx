import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Switch, Avatar, IconButton, Button, Popover, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ArrowDropDownCircleOutlined, AutoAwesome, Done, Edit, InsertPhoto, Mood, Replay } from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dayjs } from "dayjs";
import { DateCalendar, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchPostsByStatus, regeneratePost, setSelectedAnnouncement, updatePost } from "@/store/slices/postsSlice";
import {
    // ... other icons
    FormatBold as FormatBoldIcon,
    FormatUnderlined as FormatUnderlinedIcon,
    StrikethroughS as StrikethroughSIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
interface DiscordBlockProps {
    submittedText: string;
    onSubmit: () => void;
    _id: string;
}

const DiscordBlock: React.FC<DiscordBlockProps> = ({ submittedText, onSubmit, _id }) => {
    const theme = useTheme();
    const textFieldRef = useRef<HTMLTextAreaElement | null>(null);

    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const [displayText, setDisplayText] = useState("");
    const indexRef = useRef(0);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);
    const { user } = useAuth(); // ✅ Get user data
    const selectedAnnouncement = useSelector(
        (state: RootState) => state.posts.selectedAnnouncement
    );
    const dispatch = useDispatch<AppDispatch>();
    const postId = selectedAnnouncement && selectedAnnouncement.length > 0
        ? selectedAnnouncement[0]._id
        : _id;
    // State for editing mode and editable text
    const [isEditing, setIsEditing] = useState(false);
    const [editableText, setEditableText] = useState("");
    const handlePostNow = async () => {
        if (!submittedText.trim() && (!selectedAnnouncement || selectedAnnouncement.length === 0)) {
            toast.warn("⚠️ Message cannot be empty!", { position: "top-right" });
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}postDiscord/postNow/` + postId, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();

            if (response.ok) {
                dispatch(fetchPostsByStatus("draft"));

                toast.success("Post sent successfully!", { position: "top-right" });
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
    }, [submittedText, isEditing]);
    //////////////// here 
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
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
        // If a post is selected and has a publishedAtDiscord property, show it
        if (
            selectedAnnouncement &&
            selectedAnnouncement.length > 0 &&
            selectedAnnouncement[0].publishedAtDiscord
        ) {
            const publishedDate = dayjs(selectedAnnouncement[0].publishedAtDiscord);
            setButtonText(
                `Published at: ${publishedDate.format("MMM DD, YYYY")} - ${publishedDate.format("HH:mm")}`
            );
        } else if (date && time) {
            // Otherwise, if a schedule date/time is selected, show that
            setButtonText(`${date.format("MMM DD, YYYY")} - ${time.format("HH:mm")}`);
        } else {
            // Fallback button text
            setButtonText("Post Now");
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

        const requestBody = {
            // message: selectedAnnouncement && selectedAnnouncement.length > 0 && selectedAnnouncement[0].discord ? selectedAnnouncement[0].discord : submittedText,
            dateTime: combinedDateTime.toISOString(),
            timeZone, // Auto-detected time zone
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}postDiscord/schedulePost/` + postId, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                dispatch(fetchPostsByStatus("draft"));

                toast.success("Post scheduled successfully!");
            } else {
                toast.error("Failed to schedule post.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error scheduling post.");
        }
    };
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append("discord", editableText);
            if (selectedImage) {
                formData.append("image_discord", selectedImage); // "image_discord" is the key expected by your API
            }
            // Dispatch the updatePost thunk and wait for the updated post
            const updatedPost = await dispatch(
                updatePost({
                    id: postId,
                    body: formData,
                })
            ).unwrap();
            // Update the Redux state so that your component refreshes with the updated post data
            dispatch(setSelectedAnnouncement([updatedPost]));
            // Optionally, update your local display state if needed
            setDisplayText(updatedPost?.discord || editableText);
        } catch (error) {
            console.error("Error updating post:", error);
        } finally {
            setIsEditing(false);
        }
    };

    const handleFormat = (formatType: string) => {
        if (!textFieldRef.current) return;

        // current text inside the TextField
        const field = textFieldRef.current;
        const start = field.selectionStart;
        const end = field.selectionEnd;

        // If nothing is selected or indices are null, do nothing
        if (start == null || end == null || start === end) return;

        const selected = editableText.substring(start, end);
        let newText = editableText;

        switch (formatType) {
            case "bold":
                // **selected**
                newText =
                    editableText.slice(0, start) +
                    `**${selected}**` +
                    editableText.slice(end);
                break;

            case "underline":
                // __selected__
                newText =
                    editableText.slice(0, start) +
                    `__${selected}__` +
                    editableText.slice(end);
                break;

            case "strike":
                // ~~selected~~
                newText =
                    editableText.slice(0, start) +
                    `~~${selected}~~` +
                    editableText.slice(end);
                break;

            default:
                break;
        }

        // Update the state
        setEditableText(newText);

        // (Optional) Restore focus & selection
        // so the user can see the newly inserted Markdown
        setTimeout(() => {
            field.focus();
            // Move cursor to after the inserted symbols
            const symbolLength = 4; // e.g. "**" + "**" = 4 chars
            field.setSelectionRange(start, end + symbolLength);
        }, 0);
    };

    return (
        <>
            <Box
                sx={{
                    flex: 1,
                    backgroundColor: "#111112",
                    p: 2,
                    backgroundImage: "url('/DiscordColor.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "top",
                    border: "1px solid #3C3C3C",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: isMobile ? "500px" : "400px", // ✅ Increased height in mobile
                    maxHeight: isMobile ? "500px" : "400px", // ✅ Prevent excessive resizing
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

                {/* ✅ Scrolling Box with Fixed Width & Preventing Expansion */}
                <Box
                    sx={{
                        textAlign: "justify",
                        width: "100%",
                        padding: 2,
                        mt: 2,
                        flexGrow: 1,
                        maxHeight: isMobile ? "400px" : "200px",
                        overflowY: "auto",
                        // scrollbarWidth: "thin",
                        // scrollbarColor: "#FFB300 #333",
                        "&::-webkit-scrollbar": {
                            width: "4px", // smaller scrollbar width
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#FFB300", // gold scrollbar thumb
                            borderRadius: "3px",
                        },


                    }}
                >
                    {isEditing ? (
                        <Box>
                            {/* Formatting Toolbar */}
                            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                                <IconButton onClick={() => handleFormat("bold")} sx={{ color: "#8F8F8F" }}>
                                    <FormatBoldIcon fontSize="small" />
                                </IconButton>

                                <IconButton
                                    onClick={() => handleFormat("underline")}
                                    sx={{ color: "#8F8F8F" }}
                                >
                                    <FormatUnderlinedIcon fontSize="small" />
                                </IconButton>

                                <IconButton onClick={() => handleFormat("strike")} sx={{ color: "#8F8F8F" }}>
                                    <StrikethroughSIcon fontSize="small" />
                                </IconButton>

                                {/* ... you can add more icons for italic, link, etc. */}
                            </Box>

                            {/* The TextField for editing Discord text */}
                            <TextField
                                fullWidth
                                multiline
                                variant="outlined"
                                value={editableText}
                                inputRef={textFieldRef}
                                onChange={(e) => setEditableText(e.target.value)}
                                sx={{
                                    "& .MuiOutlinedInput-input": { color: "#8F8F8F", fontSize: "14px" },
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "10px",
                                        "& fieldset": { borderColor: "#333" },
                                        "&:hover fieldset": { borderColor: "#444" },
                                    },
                                }}
                            />

                            {selectedImage && (
                                <Box mb={2} textAlign="center">
                                    <img
                                        src={URL.createObjectURL(selectedImage)}
                                        alt="Preview"
                                        style={{
                                            width: "100%",
                                            marginTop: "10px",
                                            maxHeight: "200px",
                                            objectFit: "contain",
                                            borderRadius: "4px",
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>
                    ) : (
                        // The non-editing view (existing code)
                        <>
                            {selectedAnnouncement && selectedAnnouncement.length > 0 &&
                                selectedAnnouncement[0]?.image_discord && (
                                    <img
                                        src={selectedAnnouncement[0].image_discord}
                                        alt="Preview"
                                        style={{ maxWidth: "100%", marginBottom: "10px" }}
                                    />
                                )}

                            <Typography sx={{ fontSize: "14px", color: "#8F8F8F", whiteSpace: "pre-line" }}>
                                {(selectedAnnouncement && selectedAnnouncement.length > 0)
                                    ? selectedAnnouncement[0].discord
                                    : (displayText || "No announcement yet...")}
                            </Typography>
                        </>
                    )}
                </Box>
                {user && (
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
                                <IconButton
                                    sx={{ color: "#8F8F8F" }}
                                    onClick={() => {
                                        if (!isEditing) {
                                            // Enter edit mode: load current twitter text
                                            const currentText =
                                                selectedAnnouncement && selectedAnnouncement.length > 0
                                                    ? selectedAnnouncement[0].discord
                                                    : displayText;
                                            setEditableText(currentText);
                                            setIsEditing(true);
                                        } else {
                                            // When done is clicked, dispatch updatePost from slice
                                            handleUpdate();
                                        }
                                    }}
                                >
                                    {isEditing ? <Done fontSize="small" /> : <Edit fontSize="small" />}
                                </IconButton>
                                <IconButton sx={{ color: "#8F8F8F" }}>
                                    <Mood fontSize="small" />
                                </IconButton>
                                <IconButton component="label" sx={{ color: "#8F8F8F" }}>
                                    <InsertPhoto fontSize="small" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setSelectedImage(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </IconButton>
                                <IconButton sx={{ color: "#8F8F8F" }}>
                                    <AutoAwesome fontSize="small" />
                                </IconButton>
                                <Box sx={{ width: "1px", height: "20px", backgroundColor: "#555", mx: 1 }} />
                                <IconButton
                                    sx={{ color: "red" }}
                                    onClick={() => dispatch(regeneratePost({ platform: "discord", postId: postId }))}
                                >
                                    <Replay fontSize="small" />
                                </IconButton>
                            </Box>



                        </Box>
                        {/* Bottom Button Section */}
                        {!isMobile &&
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
                                        color: "#666",
                                        borderRadius: "12px",
                                        height: 50,
                                        flex: 1,
                                        width: "150px",
                                        "&:hover": {
                                            backgroundColor: "#FFA500",
                                            color: "black",
                                        },
                                    }}
                                >
                                    {(selectedAnnouncement && selectedAnnouncement.length > 0)
                                        ? (
                                            selectedAnnouncement[0].publishedAtDiscord
                                                ? `Published at: ${dayjs(selectedAnnouncement[0].publishedAtDiscord).format("MMM DD, YYYY")} - ${dayjs(selectedAnnouncement[0].publishedAtDiscord).format("HH:mm")}`
                                                : selectedAnnouncement[0].scheduledAtDiscord
                                                    ? `Scheduled at: ${dayjs(selectedAnnouncement[0].scheduledAtDiscord).format("MMM DD, YYYY")} - ${dayjs(selectedAnnouncement[0].scheduledAtDiscord).format("HH:mm")}`
                                                    : (selectedDate && selectedTime
                                                        ? `${selectedDate.format("MMM DD, YYYY")} - ${selectedTime.format("HH:mm")}`
                                                        : "Post Now")
                                        )
                                        : (selectedDate && selectedTime
                                            ? `${selectedDate.format("MMM DD, YYYY")} - ${selectedTime.format("HH:mm")}`
                                            : "Post Now")}
                                </Button>

                            </Box>
                        }
                    </>
                )}
            </Box>

        </>
    );
};

export default DiscordBlock;
