import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import {
    Box,
    Typography,
    Switch,
    Avatar,
    Button,
    IconButton,
    TextField,
    Popover,
    CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
    ArrowDropDownCircleOutlined,
    AutoAwesome,
    Edit,
    InsertPhoto,
    Mood,
    Replay,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Done from "@mui/icons-material/Done";
import { useAuth } from "@/hooks/useAuth";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchPostsByStatus, regeneratePost, regeneratePostOpenAi, setSelectedAnnouncement, updatePost } from "@/store/slices/postsSlice";
import {
    FormatBold as FormatBoldIcon,
    FormatItalic as FormatItalicIcon,
    FormatUnderlined as FormatUnderlinedIcon,
    StrikethroughS as StrikethroughSIcon,
    Code as CodeIcon
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import dayjs, { Dayjs } from "dayjs";
import { DateCalendar, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { signIn } from "next-auth/react";

interface TwitterBlockProps {
    submittedText: string; // Accept submitted text as a prop
    _id: string;
    onSubmit: () => void; // ✅ Accept API submit function
    ai: boolean;
}
interface UserPreference {
    OpenIA?: boolean;
    Gemini?: boolean;
    DISCORD_WEBHOOK_URL?: string;
    TELEGRAM_CHAT_ID?: string;
    twitterConnect?: string
}
const TwitterBlock: React.FC<TwitterBlockProps> = ({ submittedText, onSubmit, _id, ai }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const [displayText, setDisplayText] = useState("");
    const indexRef = useRef(0);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);
    const { user } = useAuth();
    const selectedAnnouncement = useSelector((state: RootState) => state.posts.selectedAnnouncement);
    const announcement = selectedAnnouncement && selectedAnnouncement.length > 0 ? selectedAnnouncement[0] : null;
    const postId = announcement?._id || _id;
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const dispatch = useDispatch<AppDispatch>();
    // const postId = selectedAnnouncement && selectedAnnouncement.length > 0
    //     ? selectedAnnouncement[0]._id
    //     : _id;
    // State for editing mode and editable text
    const [isEditing, setIsEditing] = useState(false);
    const [editableText, setEditableText] = useState("");
    const [preference, setPreference] = useState<UserPreference>({});

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedPreference = localStorage.getItem("userPreference");
            const parsedPreference = storedPreference ? JSON.parse(storedPreference) : {};
            setPreference(parsedPreference);
        }
    }, [preference]);
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
            setIsLoading(true);
            const textToSend = editableText.trim() || displayText;
            console.log("Updating post...");
            console.log("Text:", textToSend);
            console.log("Image:", selectedImage ? selectedImage.name : "No image selected");
            const formData = new FormData();
            formData.append("twitter", textToSend);
            if (selectedImage) {
                formData.append("image_twitter", selectedImage);
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
    useEffect(() => {
        if (selectedImage) {
            handleUpdate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedImage]);

    const textFieldRef = useRef<HTMLTextAreaElement | null>(null);
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);

    // Mouse event handler: set popover position if text is selected
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

    // Keyboard event handler: set fallback popover position if text is selected
    const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!textFieldRef.current) return;
        const start = textFieldRef.current.selectionStart;
        const end = textFieldRef.current.selectionEnd;
        if (start !== end) {
            // For keyboard events, we use a fixed fallback position
            setAnchorPosition({ top: 100, left: 100 });
        } else {
            setAnchorPosition(null);
        }
    };

    // Handle formatting by transforming the selected text with the chosen style
    const handleFormat = (formatType: string) => {
        if (!textFieldRef.current) return;
        const field = textFieldRef.current;
        const start = field.selectionStart;
        const end = field.selectionEnd;
        if (start == null || end == null || start === end) return;

        const selected = editableText.substring(start, end);
        let transformed = selected;

        switch (formatType) {
            case "bold":
                // Insert Markdown syntax for bold
                transformed = `**${selected}**`;
                break;
            case "italic":
                // Insert Markdown syntax for italic
                transformed = `*${selected}*`;
                break;
            case "underline":
                // Markdown doesn't natively support underline.
                // You can use HTML if your renderer allows it.
                transformed = `<u>${selected}</u>`;
                break;
            case "strike":
                // Markdown syntax for strikethrough
                transformed = `~~${selected}~~`;
                break;
            case "inlineCode":
                transformed = `\`${selected}\``;
                break;
            case "codeBlock":
                transformed = "```\n" + selected + "\n```";
                break;
            case "spoiler":
                // If your markdown renderer supports spoiler syntax
                transformed = `||${selected}||`;
                break;
            default:
                break;
        }

        const newText = editableText.slice(0, start) + transformed + editableText.slice(end);
        setEditableText(newText);

        // Hide the formatting popover and re-focus the input field
        setAnchorPosition(null);
        setTimeout(() => field.focus(), 0);
    };
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            console.log("Selected file:", file.name);
            const currentText = announcement?.twitter || displayText;
            console.log("Setting editableText:", currentText);
            setEditableText(currentText);
            setSelectedImage(file);
        }
    };
    const storedPreference = typeof window !== "undefined" ? localStorage.getItem("userPreference") : null;
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isPosting, setIsPosting] = useState<boolean>(false);

    const handleRegenerate = async (icon: boolean) => {
        if (icon) {
            setIsRegenerating(true);
        }
        try {
            if (preference?.Gemini === true) {
                await dispatch(regeneratePost({ platform: "twitter", postId })).unwrap();
            } else {
                await dispatch(regeneratePostOpenAi({ platform: "twitter", postId })).unwrap();
            }
            toast.success("Regenerate successful! 🎉");
        } catch (error) {
            console.error("Regenerate failed:", error);
            toast.error("Regenerate failed. Please try again.");
        } finally {
            if (icon) {
                setIsRegenerating(false);
            }
        }
    };
    const handlePostNow = async () => {
        const textToPost = submittedText.trim() || (announcement ? announcement.twitter : "");
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
                dispatch(fetchPostsByStatus("drafts"));
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
    // const handlePostNow = async () => {
    //     if (!submittedText.trim() && (!selectedAnnouncement || selectedAnnouncement.length === 0)) {
    //         toast.warn("⚠️ Message cannot be empty!", { position: "top-right" });
    //         return;
    //     }
    //     const token = localStorage.getItem("token");
    //     if (!token) {
    //         toast.error("❌ Unauthorized: Token not found!", { position: "top-right" });
    //         return
    //     }
    //     try {
    //         const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}postTwitter/postNow/` + postId, {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json", "Authorization": `Bearer ${token}`
    //             },
    //         });

    //         const data = await response.json();

    //         if (response.ok) {
    //             dispatch(fetchPostsByStatus("draft"));

    //             toast.success("Post sent successfully!", { position: "top-right" });
    //         } else {
    //             toast.error(`${data.error || "Failed to send message."}`, { position: "top-right" });
    //         }
    //     } catch (error) {
    //         console.error("Error sending message to Discord:", error);
    //         toast.error("❌ Failed to send message!", { position: "top-right" });
    //     }
    // };

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
    const [timeZone, setTimeZone] = useState<string>("");


    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDateChange = (newDate: Dayjs | null) => {
        setSelectedDate(newDate);
        // updateButtonText(newDate, selectedTime);
    };
    const handleTimeChange = (newTime: Dayjs | null) => {
        setSelectedTime(newTime);
        // updateButtonText(selectedDate, newTime);
    };

    const handleSchedulePost = async () => {
        if (!selectedDate || !selectedTime) {
            return handlePostNow();
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
    const handleRedirect = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/oauth-url`); // Replace with your actual API endpoint
            if (!response.ok) throw new Error('Failed to fetch the redirect URL');

            const data = await response.json(); // Assuming API returns { url: "https://example.com" }
            const redirectUrl = data;

            if (redirectUrl) {
                window.location.href = redirectUrl; // Redirect to the returned URL
            } else {
                console.error('Invalid URL received');
            }
        } catch (error) {
            console.error('Error during redirection:', error);
            // Handle error feedback (e.g., display error message)
        }
    };
    return (
        <>
            <Box
                sx={{
                    flex: 1,
                    backgroundImage: "url('/XColor.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "top",
                    backgroundColor: "#111112",
                    p: 2,
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
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    {/* <TwitterIcon fontSize="large" sx={{ color: "#1DA1F2" }} /> */}
                    <img
                        src="/X.png"
                        alt="X"
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
                                sx={{ width: 26, height: 26 }}
                            />
                            <Typography sx={{ color: "#8F8F8F", fontSize: "14px", fontWeight: 500 }}>
                                @{user.userName}
                            </Typography>
                            <ArrowDropDownCircleOutlined sx={{ color: "#8F8F8F", fontSize: 18 }} />
                        </Box>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    {/* <Switch color="warning" sx={{ transform: "scale(0.9)" }} /> */}
                    {user && <>

                        {preference.twitterConnect
                            && preference.twitterConnect
                                .trim().length > 0 ? (

                            // {preference.TELEGRAM_CHAT_ID !== "" ? (
                            <Switch color="warning" sx={{ transform: "scale(0.9)" }} />
                        ) : (
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleRedirect} // Open modal on button click

                                sx={{
                                    width: 83,
                                    height: 34,
                                    borderWidth: 2,
                                    borderRadius: "10px",
                                    borderColor: "#FFB300",
                                    padding: "10px",
                                    backgroundColor: "transparent",
                                    color: "#FFB300",
                                    fontWeight: "bold",
                                    fontSize: "12px",
                                    textTransform: "none",
                                    "&:hover": { backgroundColor: "#FFB300", color: "#111" }, // Change color on hover
                                }}
                            // onClick={() => setStep(3)} // Move to next step
                            // disabled={!selectedOption} // Disable if nothing is selected
                            >
                                Connect
                            </Button>
                        )}
                    </>}
                </Box>

                <Box
                    sx={{
                        textAlign: "justify",
                        width: "100%",
                        padding: 2,
                        mt: 2,
                        flexGrow: 1,
                        maxHeight: isMobile ? "400px" : "400px",
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

                            <>
                                {announcement?.image_twitter && (
                                    <img
                                        src={announcement.image_twitter}
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
                            {/* {selectedAnnouncement && selectedAnnouncement.length > 0 && selectedAnnouncement[0]?.image_twitter && (
                                <img
                                    src={selectedAnnouncement[0].image_twitter}
                                    alt="Preview"
                                    style={{ maxWidth: "100%", marginBottom: "10px" }}
                                />
                            )}
                            <Box sx={{ fontSize: "14px", color: "#8F8F8F", whiteSpace: "pre-line" }}>
                                <ReactMarkdown>
                                    {(selectedAnnouncement && selectedAnnouncement.length > 0)
                                        ? selectedAnnouncement[0].twitter
                                        : (displayText || "No announcement yet...")}
                                </ReactMarkdown>
                            </Box> */}
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
                                                    ? selectedAnnouncement[0].twitter
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
                                    {!isEditing && isLoading ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        <InsertPhoto fontSize="small" />
                                    )}
                                    <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                                </IconButton>
                                <IconButton sx={{ color: "#8F8F8F" }} onClick={() => handleRegenerate(false)}>
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
                                    onClick={() => handleRegenerate(true)} disabled={isRegenerating}
                                >
                                    <Replay fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Bottom Button Section */}
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
                                    onClick={handleSchedulePost}
                                    disabled={isPosting}
                                    sx={{
                                        backgroundColor: "#191919",
                                        color: "#666",
                                        borderRadius: "12px",
                                        height: 50,
                                        flex: 1,
                                        width: "150px",
                                        "&:hover": { backgroundColor: "#FFA500", color: "black" },
                                    }}
                                >
                                    {isPosting ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : announcement?.publishedAtTwitter ? (
                                        `Published at: ${dayjs(announcement.publishedAtTwitter).format("MMM DD, YYYY")} - ${dayjs(
                                            announcement.publishedAtTwitter
                                        ).format("HH:mm")}`
                                    ) : announcement?.publishedAtTwitter ? (
                                        `Scheduled at: ${dayjs(announcement.scheduledAtTwitter).format("MMM DD, YYYY")} - ${dayjs(
                                            announcement.scheduledAtTwitter
                                        ).format("HH:mm")}`
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
            </Box >
        </>
    );
};

export default TwitterBlock;
