import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Switch, Avatar, Button, IconButton, TextField, Popover } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowDropDownCircleOutlined, AutoAwesome, Done, Edit, InsertPhoto, Mood, Replay } from "@mui/icons-material";
import TelegramIcon from "@mui/icons-material/Telegram";
import { useAuth } from "@/hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchPostsByStatus, regeneratePost, regeneratePostOpenAi, setSelectedAnnouncement, updatePost } from "@/store/slices/postsSlice";
import { Dayjs } from "dayjs";
import { DateCalendar, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
    FormatBold as FormatBoldIcon,
    FormatItalic as FormatItalicIcon,
    FormatUnderlined as FormatUnderlinedIcon,
    StrikethroughS as StrikethroughSIcon,
    Code as CodeIcon
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";

interface TelegramBlockProps {
    submittedText: string; // ✅ Accept submitted text as a prop
    onSubmit: () => void; // ✅ Accept API submit function
    _id: string;
    ai: boolean

}
// Fixed tokens (Telegram-style)
const tokens = {
    bold: "*",         // Telegram: *text*
    italic: "_",       // Telegram: _text_
    underline: "",     // No native underline token in Telegram Markdown
    strike: "~",       // Using ~ for strikethrough
    inlineCode: "`",   // For inline code
    codeBlock: "```",  // For code blocks
    spoiler: "||"      // For spoilers (Telegram MarkdownV2 supports this)
};

const TelegramBlock: React.FC<TelegramBlockProps> = ({ submittedText, onSubmit, _id, ai }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const [displayText, setDisplayText] = useState(""); // ✅ Store dynamically revealed text
    const indexRef = useRef(0); // ✅ Track character index
    const typingTimeout = useRef<NodeJS.Timeout | null>(null); // ✅ Keep track of timeout
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
    useEffect(() => {
        if (!submittedText) {
            setDisplayText("");
            indexRef.current = 0;
            return;
        }
        // If AI is disabled, show the full text immediately
        if (!ai) {
            setDisplayText(submittedText);
            return;
        }

        // Otherwise, run the typewriter effect
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
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append("telegram", editableText);
            if (selectedImage) {
                formData.append("image_telegram", selectedImage); // "image" is the key expected by your API
            }
            const updatedPost = await dispatch(
                updatePost({
                    id: postId,
                    body: formData,
                })
            ).unwrap();
            // Use the updated post's twitter field if available, otherwise fall back to editableText
            dispatch(setSelectedAnnouncement([updatedPost]));
            // Optionally, update your local display state if needed
            setDisplayText(updatedPost?.telegram || editableText);
        } catch (error) {
            console.error("Error updating post:", error);
        } finally {
            setIsEditing(false);
        }
    };
    const handlePostNow = async () => {
        if (!submittedText.trim() && (!selectedAnnouncement || selectedAnnouncement.length === 0)) {
            toast.warn("⚠️ Message cannot be empty!", { position: "top-right" });
            return;
        }
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
                dispatch(fetchPostsByStatus("draft"));

                toast.success("Post sent successfully!", { position: "top-right" });
            } else {
                toast.error(`${data.error || "Failed to send message."}`, { position: "top-right" });
            }
        } catch (error) {
            console.error("Error sending message to Discord:", error);
            toast.error("❌ Failed to send message!", { position: "top-right" });
        }
    };
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
    const textFieldRef = useRef<HTMLTextAreaElement | null>(null);
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);

    const handleMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>) => {
        if (!textFieldRef.current) return;
        const start = textFieldRef.current.selectionStart;
        const end = textFieldRef.current.selectionEnd;
        if (start !== end) {
            setAnchorPosition({ top: e.clientY, left: e.clientX });
        } else {
            setAnchorPosition(null);
        }
    };

    // Keyboard event handler: use a fallback position
    const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!textFieldRef.current) return;
        const start = textFieldRef.current.selectionStart;
        const end = textFieldRef.current.selectionEnd;
        if (start !== end) {
            setAnchorPosition({ top: 100, left: 100 });
        } else {
            setAnchorPosition(null);
        }
    };

    // Handle formatting: wrap selected text with tokens
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

    const handleRegenerate = () => {
        if (preference?.Gemini === true) {
            dispatch(regeneratePost({ platform: "telegram", postId }));
        } else {
            dispatch(regeneratePostOpenAi({ platform: "telegram", postId }));
        }
    };
    return (
        <>
            <Box
                sx={{
                    flex: 1,
                    backgroundImage: "url('/TelegramColor.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "top", backgroundColor: "#111112",
                    p: 2,
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

                            <Popover
                                open={Boolean(anchorPosition)}
                                anchorReference="anchorPosition"
                                anchorPosition={anchorPosition ? { top: anchorPosition.top, left: anchorPosition.left } : undefined}
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
                            {/* {selectedAnnouncement && selectedAnnouncement.length > 0 && selectedAnnouncement[0]?.image_telegram &&

                                <img
                                    src={selectedAnnouncement && selectedAnnouncement.length > 0 ? selectedAnnouncement[0]?.image_telegram : "/mnt/data/image.png"}
                                    alt="Preview"
                                    style={{ maxWidth: "100%", display: "block", margin: "0 auto", marginBottom: "10px" }}
                                />
                            }
                            <Typography sx={{ fontSize: "14px", color: "#8F8F8F", whiteSpace: "pre-line" }}>
                                {selectedAnnouncement && selectedAnnouncement.length > 0
                                    ? selectedAnnouncement[0].telegram
                                    : (displayText || "No announcement yet...")}
                            </Typography> */}
                            {selectedAnnouncement && selectedAnnouncement.length > 0 && selectedAnnouncement[0]?.image_telegram && (
                                <img
                                    src={selectedAnnouncement[0].image_telegram}
                                    alt="Preview"
                                    style={{ maxWidth: "100%", marginBottom: "10px" }}
                                />
                            )}
                            <Box sx={{ fontSize: "14px", color: "#8F8F8F", whiteSpace: "pre-line" }}>
                                <ReactMarkdown>
                                    {(selectedAnnouncement && selectedAnnouncement.length > 0)
                                        ? selectedAnnouncement[0].telegram
                                        : (displayText || "No announcement yet...")}
                                </ReactMarkdown>
                            </Box>
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
                                                    ? selectedAnnouncement[0].telegram
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
                                <IconButton sx={{ color: "red" }}>
                                    <Replay
                                        onClick={handleRegenerate}

                                        fontSize="small" />
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
                                            color: "black"
                                        },
                                    }}
                                >
                                    {buttonText}
                                </Button>
                            </Box>
                        }
                    </>
                )}
            </Box>


        </>
    );
};

export default TelegramBlock;
