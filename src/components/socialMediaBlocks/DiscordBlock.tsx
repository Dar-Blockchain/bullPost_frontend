import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import {
    Box,
    Typography,
    Switch,
    Avatar,
    IconButton,
    Button,
    Popover,
    TextField,
    CircularProgress,
} from "@mui/material";
import { keyframes, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
    ArrowDropDownCircleOutlined,
    AutoAwesome,
    Done,
    Edit,
    InsertPhoto,
    Mood,
    Replay,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dayjs } from "dayjs";
import { DateCalendar, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
    fetchPostsByStatus,
    regeneratePost,
    regeneratePostOpenAi,
    setSelectedAnnouncement,
    updatePost,
} from "@/store/slices/postsSlice";
import {
    FormatBold as FormatBoldIcon,
    FormatItalic as FormatItalicIcon,
    FormatUnderlined as FormatUnderlinedIcon,
    StrikethroughS as StrikethroughSIcon,
    Code as CodeIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";
import AutorenewIcon from "@mui/icons-material/Autorenew";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

interface DiscordBlockProps {
    submittedText: string;
    onSubmit: () => void;
    _id: string;
    ai: boolean;
}

const DiscordBlock: React.FC<DiscordBlockProps> = ({ submittedText, onSubmit, _id, ai }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useAuth();

    // Redux state
    const selectedAnnouncement = useSelector((state: RootState) => state.posts.selectedAnnouncement);
    const announcement = selectedAnnouncement?.[0];

    // States for text and typewriter effect
    const [displayText, setDisplayText] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editableText, setEditableText] = useState("");
    const [isPosting, setIsPosting] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // States for scheduling
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
    const [timeZone, setTimeZone] = useState<string>("");
    const [buttonText, setButtonText] = useState<string>("Post Now");

    // State for image
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    // Other states
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Refs for typewriter effect and text field
    const textFieldRef = useRef<HTMLTextAreaElement | null>(null);
    const indexRef = useRef(0);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);

    // Determine postId (announcement takes precedence)
    const postId = announcement?._id || _id;

    // Detect user's time zone on mount
    useEffect(() => {
        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);

    // Typewriter effect for submitted text
    useEffect(() => {
        if (!submittedText) {
            setDisplayText("");
            indexRef.current = 0;
            return;
        }
        if (!ai) {
            setDisplayText(submittedText);
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
    }, [submittedText, isEditing, ai]);

    // Update button text based on scheduling or published status
    const updateButtonText = (date: Dayjs | null, time: Dayjs | null) => {
        if (announcement?.publishedAtDiscord) {
            const publishedDate = dayjs(announcement.publishedAtDiscord);
            setButtonText(
                `Published at: ${publishedDate.format("MMM DD, YYYY")} - ${publishedDate.format("HH:mm")}`
            );
        } else if (date && time) {
            setButtonText(`${date.format("MMM DD, YYYY")} - ${time.format("HH:mm")}`);
        } else {
            setButtonText("Post Now");
        }
    };

    // Handlers for scheduling popover
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

    // Handle immediate posting
    const handlePostNow = async () => {
        const textToPost = submittedText.trim() || announcement?.discord || "";
        if (!textToPost) {
            toast.warn("⚠️ Message cannot be empty!", { position: "top-right" });
            return;
        }
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            setIsPosting(true);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}postDiscord/postNow/${postId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json(); console.log(data, "jzjzjzjzjzj")
            if (response.ok) {
                dispatch(fetchPostsByStatus("draft"));

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

    // Handle scheduling a post (or fallback to immediate posting)
    const handleSchedulePost = async () => {
        if (!selectedDate || !selectedTime) {
            return handlePostNow();
        }
        const combinedDateTime = selectedDate
            .set("hour", selectedTime.hour())
            .set("minute", selectedTime.minute())
            .set("second", 0);
        const token = localStorage.getItem("token");
        const requestBody = {
            dateTime: combinedDateTime.toISOString(),
            timeZone,
        };

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}postDiscord/schedulePost/${postId}`,
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
                dispatch(fetchPostsByStatus("draft"));
                toast.success("Post scheduled successfully!");
            } else {
                toast.error("Failed to schedule post.");
            }
        } catch (error) {
            console.error("Error scheduling post:", error);
            alert("Error scheduling post.");
        }
    };

    // Handle file change for image upload
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            console.log("Selected file:", file.name);
            const currentText = announcement?.discord || displayText;
            console.log("Setting editableText:", currentText);
            setEditableText(currentText);
            setSelectedImage(file);
        }
    };

    // Update post with new text or image
    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            const textToSend = editableText.trim() || displayText;
            console.log("Updating post...");
            console.log("Text:", textToSend);
            console.log("Image:", selectedImage ? selectedImage.name : "No image selected");
            const formData = new FormData();
            formData.append("discord", textToSend);
            if (selectedImage) {
                formData.append("image_discord", selectedImage);
            } else {
                console.warn("No image found in selectedImage state.");
            }
            // Debug: Log form data entries
            for (let pair of formData.entries()) {
                console.log(pair[0] + ": " + pair[1]);
            }
            const updatedPost = await dispatch(updatePost({ id: postId, body: formData })).unwrap();
            dispatch(setSelectedAnnouncement([updatedPost]));
            setDisplayText(updatedPost?.discord || textToSend);
            setSelectedImage(null);
        } catch (error) {
            console.error("Error updating post:", error);
        } finally {
            setIsLoading(false);
            setIsEditing(false);
        }
    };

    // Automatically update the post when an image is selected
    useEffect(() => {
        if (selectedImage) {
            handleUpdate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedImage]);

    // Handlers for text formatting popover
    const handleMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>) => {
        if (!textFieldRef.current) return;
        const { selectionStart, selectionEnd } = textFieldRef.current;
        if (selectionStart !== selectionEnd) {
            setAnchorPosition({ top: e.clientY, left: e.clientX });
        } else {
            setAnchorPosition(null);
        }
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!textFieldRef.current) return;
        const { selectionStart, selectionEnd } = textFieldRef.current;
        if (selectionStart !== selectionEnd) {
            setAnchorPosition({ top: 100, left: 100 });
        } else {
            setAnchorPosition(null);
        }
    };

    const handleFormat = (formatType: string) => {
        if (!textFieldRef.current) return;
        const field = textFieldRef.current;
        const start = field.selectionStart;
        const end = field.selectionEnd;
        if (start == null || end == null || start === end) return;

        const selected = editableText.substring(start, end);
        let newText = editableText;
        switch (formatType) {
            case "bold":
                newText = editableText.slice(0, start) + `**${selected}**` + editableText.slice(end);
                break;
            case "italic":
                newText = editableText.slice(0, start) + `*${selected}*` + editableText.slice(end);
                break;
            case "underline":
                newText = editableText.slice(0, start) + `__${selected}__` + editableText.slice(end);
                break;
            case "strike":
                newText = editableText.slice(0, start) + `~~${selected}~~` + editableText.slice(end);
                break;
            case "inlineCode":
                newText = editableText.slice(0, start) + `\`${selected}\`` + editableText.slice(end);
                break;
            case "codeBlock":
                newText = editableText.slice(0, start) + "```\n" + selected + "\n```" + editableText.slice(end);
                break;
            case "spoiler":
                newText = editableText.slice(0, start) + `||${selected}||` + editableText.slice(end);
                break;
            default:
                break;
        }
        setEditableText(newText);
        setAnchorPosition(null);
        setTimeout(() => field.focus(), 0);
    };

    const storedPreference = typeof window !== "undefined" ? localStorage.getItem("userPreference") : null;
    const preference = storedPreference ? JSON.parse(storedPreference) : {};

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        try {
            if (preference?.Gemini) {
                await dispatch(regeneratePost({ platform: "discord", postId })).unwrap();
            } else {
                await dispatch(regeneratePostOpenAi({ platform: "discord", postId })).unwrap();
            }
            toast.success("Regenerate successful! 🎉");
        } catch (error) {
            console.error("Regenerate failed:", error);
            toast.error("Regenerate failed. Please try again.");
        } finally {
            setIsRegenerating(false);
        }
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
                    minHeight: isMobile ? "500px" : "400px",
                    maxHeight: isMobile ? "500px" : "400px",
                    flexShrink: 0,
                    width: "100%",
                    mt: isMobile ? "10px" : "0",
                }}
            >
                {/* Top Bar: Discord Icon and User Profile */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <img src="/discord.svg" alt="Discord" style={{ width: 30, height: 30, marginRight: "10px" }} />
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
                            <Avatar src="/mnt/data/image.png" alt="Julio" sx={{ width: 26, height: 26 }} />
                            <Typography sx={{ color: "#8F8F8F", fontSize: "14px", fontWeight: 500 }}>
                                @{user.userName}
                            </Typography>
                            <ArrowDropDownCircleOutlined sx={{ color: "#8F8F8F", fontSize: 18 }} />
                        </Box>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Switch color="warning" sx={{ transform: "scale(0.9)" }} />
                </Box>

                {/* Main Content Area */}
                <Box
                    sx={{
                        textAlign: "justify",
                        width: "100%",
                        padding: 2,
                        mt: 2,
                        flexGrow: 1,
                        maxHeight: isMobile ? "400px" : "400px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: "4px" },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#FFB300",
                            borderRadius: "3px",
                        },
                    }}
                >
                    {isEditing ? (
                        <Box>
                            <TextField
                                fullWidth
                                multiline
                                variant="outlined"
                                value={editableText}
                                onChange={(e) => setEditableText(e.target.value)}
                                inputRef={textFieldRef}
                                inputProps={{
                                    onMouseUp: handleMouseUp,
                                    onKeyUp: handleKeyUp,
                                }}
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
                                        alt="Image preview"
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
                            <Popover
                                open={Boolean(anchorPosition)}
                                anchorReference="anchorPosition"
                                anchorPosition={
                                    anchorPosition ? { top: anchorPosition.top, left: anchorPosition.left } : undefined
                                }
                                onClose={() => setAnchorPosition(null)}
                                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                            >
                                <Box sx={{ display: "flex", gap: 1, p: 1 }}>
                                    <IconButton onClick={() => handleFormat("bold")} sx={{ color: "#8F8F8F" }}>
                                        <FormatBoldIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleFormat("italic")} sx={{ color: "#8F8F8F" }}>
                                        <FormatItalicIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleFormat("underline")} sx={{ color: "#8F8F8F" }}>
                                        <FormatUnderlinedIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleFormat("strike")} sx={{ color: "#8F8F8F" }}>
                                        <StrikethroughSIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleFormat("inlineCode")} sx={{ color: "#8F8F8F" }}>
                                        <CodeIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleFormat("codeBlock")} sx={{ color: "#8F8F8F" }}>
                                        <CodeIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleFormat("spoiler")} sx={{ color: "#8F8F8F" }}>
                                        <Typography variant="caption" sx={{ fontSize: 12 }}>
                                            ||
                                        </Typography>
                                    </IconButton>
                                </Box>
                            </Popover>
                        </Box>
                    ) : (
                        <>
                            {announcement?.image_discord && (
                                <img
                                    src={announcement.image_discord}
                                    alt="Preview"
                                    style={{ maxWidth: "100%", marginBottom: "10px" }}
                                />
                            )}
                            <Box sx={{ fontSize: "14px", color: "#8F8F8F", whiteSpace: "pre-line" }}>
                                <ReactMarkdown>
                                    {announcement?.discord || displayText || "No announcement yet..."}
                                </ReactMarkdown>
                            </Box>
                        </>
                    )}
                </Box>

                {/* Toolbar and Scheduling Section */}
                {user && (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column", mt: 2, gap: 1 }}>
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
                                            const currentText = announcement?.discord || displayText;
                                            setEditableText(currentText);
                                            setIsEditing(true);
                                        } else {
                                            handleUpdate();
                                        }
                                    }}
                                >
                                    {isEditing ? (
                                        isLoading ? (
                                            <AutorenewIcon fontSize="small" sx={{ animation: `${spin} 1s linear infinite` }} />
                                        ) : (
                                            <Done fontSize="small" />
                                        )
                                    ) : (
                                        <Edit fontSize="small" />
                                    )}
                                </IconButton>
                                <IconButton sx={{ color: "#8F8F8F" }}>
                                    <Mood fontSize="small" />
                                </IconButton>
                                <IconButton component="label" sx={{ color: "#8F8F8F" }}>
                                    {!isEditing && isLoading ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        <InsertPhoto fontSize="small" />
                                    )}
                                    <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                                </IconButton>
                                <IconButton sx={{ color: "#8F8F8F" }}>
                                    <AutoAwesome fontSize="small" />
                                </IconButton>
                                <Box sx={{ width: "1px", height: "20px", backgroundColor: "#555", mx: 1 }} />
                                <IconButton
                                    sx={{
                                        color: "red",
                                        animation: isRegenerating ? "spin 1s linear infinite" : "none",
                                        "@keyframes spin": {
                                            "0%": { transform: "rotate(360deg)" },
                                            "100%": { transform: "rotate(0deg)" },
                                        },
                                    }}
                                    onClick={handleRegenerate}
                                    disabled={isRegenerating}
                                >
                                    <Replay fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                        {!isMobile && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
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
                                        "&:hover": { backgroundColor: "#FFA500" },
                                    }}
                                    onClick={handleClick}
                                >
                                    <img src="/calendar_month.png" alt="Calendar" />
                                </Button>
                                <Popover
                                    open={Boolean(anchorEl)}
                                    anchorEl={anchorEl}
                                    onClose={handleClose}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                >
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <Box sx={{ p: 2 }}>
                                            <DateCalendar value={selectedDate} onChange={handleDateChange} />
                                            <TimePicker label="Select Time" value={selectedTime} onChange={handleTimeChange} />
                                        </Box>
                                    </LocalizationProvider>
                                </Popover>
                                <Button
                                    onClick={
                                        // announcement?.publishedAtDiscord || announcement?.scheduledAtDiscord
                                        //     ? handleDelete
                                        //     : 
                                        handleSchedulePost
                                    }
                                    disabled={isPosting}
                                    sx={{
                                        backgroundColor: "#191919",
                                        color: "#666",
                                        borderRadius: "12px",
                                        height: 50,
                                        flex: 1,
                                        width: "150px",
                                        "&:hover": {
                                            backgroundColor:
                                                announcement?.publishedAtDiscord || announcement?.scheduledAtDiscord
                                                    ? "#191919"
                                                    : "#FFA500",
                                            color:
                                                announcement?.publishedAtDiscord || announcement?.scheduledAtDiscord
                                                    ? "#666"
                                                    : "black",
                                        },
                                    }}
                                >
                                    {isPosting ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : announcement?.publishedAtDiscord ? (
                                        <>
                                            {dayjs(announcement.publishedAtDiscord).format("MMM DD, YYYY")} -{" "}
                                            {dayjs(announcement.publishedAtDiscord).format("HH:mm")}{" "}
                                            <span style={{ marginLeft: 8, fontWeight: "bold", color: "red" }}>X</span>
                                        </>
                                    ) : announcement?.scheduledAtDiscord ? (
                                        <>
                                            {dayjs(announcement.scheduledAtDiscord).format("MMM DD, YYYY")} -{" "}
                                            {dayjs(announcement.scheduledAtDiscord).format("HH:mm")}{" "}
                                            <span style={{ marginLeft: 8, fontWeight: "bold", color: "red" }}>X</span>
                                        </>
                                    ) : selectedDate && selectedTime ? (
                                        `${selectedDate.format("MMM DD, YYYY")} - ${selectedTime.format("HH:mm")}`
                                    ) : (
                                        "Post Now"
                                    )}
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </>
    );
};

export default DiscordBlock;
