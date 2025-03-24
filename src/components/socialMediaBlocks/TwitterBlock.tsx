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
import Done from "@mui/icons-material/Done";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactMarkdown from "react-markdown";
import dayjs, { Dayjs } from "dayjs";
import { DateCalendar, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useAuth } from "@/hooks/useAuth";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
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

interface TwitterAccount {
    _id: string;
    twitter_Name: string;
    refresh_token: string;
}

interface TwitterBlockProps {
    submittedText: string;
    _id: string;
    onSubmit: () => void;
    ai: boolean;
}

interface UserPreference {
    OpenIA?: boolean;
    Gemini?: boolean;
    DISCORD_WEBHOOK_URL?: string;
    TELEGRAM_CHAT_ID?: string;
    twitterConnect?: string;
    twitter?: string;
    discord?: string;
    telegram?: string;
    Discord_Server_Name?: string;
    twitter_Name?: string;
    refresh_token?: string;
    TELEGRAM_GroupName?: string;
}

const TwitterBlock: React.FC<TwitterBlockProps> = ({ submittedText, onSubmit, _id, ai }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useAuth();

    // Local States for display and editing
    const [displayText, setDisplayText] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editableText, setEditableText] = useState("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);
    const [twitterEnabled, setTwitterEnabled] = useState(false);
    const [isPosting, setIsPosting] = useState<boolean>(false);

    // Scheduling states
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
    const [timeZone, setTimeZone] = useState<string>("");
    const [buttonText, setButtonText] = useState<string>("Post Now");

    // Typewriter effect refs
    const indexRef = useRef(0);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);

    // Ref for formatting popover
    const textFieldRef = useRef<HTMLTextAreaElement | null>(null);

    // Redux: Get announcement and determine postId
    const selectedAnnouncement = useSelector((state: RootState) => state.posts.selectedAnnouncement);
    const announcement = selectedAnnouncement && selectedAnnouncement.length > 0 ? selectedAnnouncement[0] : null;
    const postId = announcement?._id || _id;

    // Load user's time zone on mount
    useEffect(() => {
        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);

    // Preference states (instead of one combined "preference" object)
    const [preferredProvider, setPreferredProvider] = useState<string>("");
    const [openIaKey, setOpenIaKey] = useState<string>("");
    const [geminiKey, setGeminiKey] = useState<string>("");
    const [discordWebhookUrl, setDiscordWebhookUrl] = useState<string>("");
    const [telegramChatId, setTelegramChatId] = useState<string>("");
    const [twitterConnect, setTwitterConnect] = useState<string>("");
    const [twitter, setTwitter] = useState<string>("");
    const [discord, setDiscord] = useState<string>("");
    const [telegram, setTelegram] = useState<string>("");
    const [discordServerName, setDiscordServerName] = useState<string>("");
    const [twitterName, setTwitterName] = useState<string>("");
    const [telegramGroupName, setTelegramGroupName] = useState<string>("");

    // Fetch user preferences from API using the provided snippet.
    // This effect will run whenever the user changes (e.g., when logged in)
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/getPreferences`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data: UserPreference) => {
                if (data) {
                    console.log(data, "data");
                    setPreferredProvider(data.OpenIA ? "OpenAI" : "Gemini");
                    setOpenIaKey((data as any).OpenIaKey || "");
                    setGeminiKey((data as any).GeminiKey || "");
                    setDiscordWebhookUrl(data.DISCORD_WEBHOOK_URL || "");
                    setTelegramChatId(data.TELEGRAM_CHAT_ID || "");
                    setTwitterConnect(data.refresh_token || "");
                    setTwitter(data.twitter || "");
                    setDiscord(data.discord || "");
                    setTelegram(data.telegram || "");
                    setDiscordServerName(data.Discord_Server_Name || "");
                    setTwitterName(data.twitter_Name || "");
                    setTelegramGroupName(data.TELEGRAM_GroupName || "");

                    // Enable Twitter switch if twitter string exists and is non-empty
                    setTwitterEnabled(Boolean(data.twitter));
                }
            })
            .catch((err) => console.error("Error fetching preferences:", err));
    }, [user]);

    // Typewriter effect for submitted text if AI mode is enabled
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

    // Handle image file selection (for Twitter image upload)
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            console.log("Selected file:", file.name);
            const currentText = announcement?.twitter || displayText;
            setEditableText(currentText);
            setSelectedImage(file);
        }
    };

    // Update Twitter post (text and optionally image)
    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            const textToSend = editableText.trim() || displayText;
            console.log("Updating post...", textToSend);
            const formData = new FormData();
            formData.append("twitter", textToSend);
            if (selectedImage) {
                formData.append("image_twitter", selectedImage);
            } else {
                console.warn("No image found in selectedImage state.");
            }
            for (let pair of formData.entries()) {
                console.log(pair[0] + ": " + pair[1]);
            }
            const updatedPost = await dispatch(updatePost({ id: postId, body: formData })).unwrap();
            dispatch(setSelectedAnnouncement([updatedPost]));
            setDisplayText(updatedPost?.twitter || textToSend);
            setSelectedImage(null);
        } catch (error) {
            console.error("Error updating post:", error);
        } finally {
            setIsLoading(false);
            setIsEditing(false);
        }
    };

    // Auto-update post when a new image is selected
    useEffect(() => {
        if (selectedImage) {
            handleUpdate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedImage]);

    // Formatting popover handlers
    const handleMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>) => {
        if (!textFieldRef.current) return;
        const { selectionStart, selectionEnd } = textFieldRef.current;
        setAnchorPosition(selectionStart !== selectionEnd ? { top: e.clientY, left: e.clientX } : null);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!textFieldRef.current) return;
        const { selectionStart, selectionEnd } = textFieldRef.current;
        setAnchorPosition(selectionStart !== selectionEnd ? { top: 100, left: 100 } : null);
    };

    // Format selected text based on chosen style
    const handleFormat = (formatType: string) => {
        if (!textFieldRef.current) return;
        const start = textFieldRef.current.selectionStart;
        const end = textFieldRef.current.selectionEnd;
        if (start === end) return;
        const selected = editableText.substring(start, end);
        let transformed = selected;
        switch (formatType) {
            case "bold":
                transformed = `**${selected}**`;
                break;
            case "italic":
                transformed = `*${selected}*`;
                break;
            case "underline":
                transformed = `<u>${selected}</u>`;
                break;
            case "strike":
                transformed = `~~${selected}~~`;
                break;
            case "inlineCode":
                transformed = `\`${selected}\``;
                break;
            case "codeBlock":
                transformed = "```\n" + selected + "\n```";
                break;
            case "spoiler":
                transformed = `||${selected}||`;
                break;
            default:
                break;
        }
        const newText = editableText.slice(0, start) + transformed + editableText.slice(end);
        setEditableText(newText);
        setAnchorPosition(null);
        setTimeout(() => textFieldRef.current?.focus(), 0);
    };

    // Regenerate post using Gemini or OpenAI
    const [isRegenerating, setIsRegenerating] = useState(false);
    const handleRegenerate = async (icon: boolean) => {
        if (icon) setIsRegenerating(true);
        try {
            if (geminiKey && preferredProvider === "Gemini") {
                await dispatch(regeneratePost({ platform: "twitter", postId })).unwrap();
            } else {
                await dispatch(regeneratePostOpenAi({ platform: "twitter", postId })).unwrap();
            }
            toast.success("Regenerate successful! 🎉");
        } catch (error) {
            console.error("Regenerate failed:", error);
            toast.error("Regenerate failed. Please try again.");
        } finally {
            if (icon) setIsRegenerating(false);
        }
    };

    // Post immediately handler
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
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}postTwitter/postNow/${postId}`,
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
                dispatch(fetchPostsByStatus({ status: "draft" }));
                toast.success("Post sent successfully!", { position: "top-right" });
            } else {
                toast.error(`${data.error || "Failed to send message."}`, { position: "top-right" });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("❌ Failed to send message!", { position: "top-right" });
        } finally {
            setIsPosting(false);
        }
    };

    // Scheduling handlers
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleDateChange = (newDate: Dayjs | null) => {
        setSelectedDate(newDate);
    };
    const handleTimeChange = (newTime: Dayjs | null) => {
        setSelectedTime(newTime);
    };

    const handleSchedulePost = async () => {
        if (!selectedDate || !selectedTime) return handlePostNow();
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
                dispatch(fetchPostsByStatus({ status: "draft" }));
                toast.success("Post scheduled successfully!");
            } else {
                toast.error("Failed to schedule post.");
            }
        } catch (error) {
            console.error("Error scheduling post:", error);
            alert("Error scheduling post.");
        }
    };

    // Redirect handler for connecting Twitter if not connected
    const handleRedirect = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                return;
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/oauth-url`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch the redirect URL");
            const data = await response.json();
            if (data) {
                window.location.href = data;
            } else {
                console.error("Invalid URL received");
            }
        } catch (error) {
            console.error("Error during redirection:", error);
        }
    };

    // Save preference and update switch state for Twitter using API
    const handleSavePreference = async (twitterValue: boolean) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const requestBody = { twitter: twitterValue };
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/updatePreferences`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestBody),
                }
            );
            if (!response.ok) {
                console.error("Failed to save preferences to backend");
                toast.error("❌ Failed to save preferences!", { position: "top-right" });
                return;
            }
            const data = await response.json();
            toast.success("Preferences saved successfully!", { position: "top-right" });
        } catch (error) {
            console.error("Error saving preferences:", error);
            toast.error("❌ Error saving preferences!", { position: "top-right" });
        }
    };

    const handleSwitchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        setTwitterEnabled(newValue);
        await handleSavePreference(newValue);
    };

    // Change status (unpublish) handler
    const ChangeStatus = async () => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("status", "drafts");
            formData.append("publishedAtTwitter", "");
            const updatedPost = await dispatch(updatePost({ id: postId, body: formData })).unwrap();
            dispatch(setSelectedAnnouncement([updatedPost]));
            dispatch(fetchPostsByStatus({ status: "drafts" }));
            setSelectedImage(null);
        } catch (error) {
            console.error("Error updating post:", error);
        } finally {
            setIsLoading(false);
            setIsEditing(false);
        }
    };

    // Guard icon actions while editing
    const handleIconAction = (action: () => void) => {
        if (isEditing) {
            toast.info("Please save your editing block first", { position: "top-right" });
            return;
        }
        action();
    };

    const [accounts, setAccounts] = useState<TwitterAccount[]>([]);
    const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);

    const handleArrowClick = (event: any) => {
        setAnchorEl2(event.currentTarget);
    };

    const handleClose2 = () => {
        setAnchorEl2(null);
    };

    // Fetch Twitter accounts from API
    useEffect(() => {
        const loadTwitterAccounts = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                return;
            }
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/getAcountData`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ types: ["twitter"] }),
                    }
                );
                if (!response.ok) {
                    console.error("Failed to fetch twitter accounts:", response.statusText);
                    return;
                }
                const data = await response.json();
                const accountsArray =
                    data && data.data && Array.isArray(data.data.twitter)
                        ? data.data.twitter
                        : [];
                setAccounts(accountsArray);
            } catch (error) {
                console.error("Error fetching twitter accounts:", error);
            }
        };

        loadTwitterAccounts();
    }, []);

    // Update twitterName from preferences if available
    useEffect(() => {
        if (twitterName) {
            setTwitterName(twitterName);
        }
    }, [twitterName]);

    // Assign Twitter account handler
    const handleAssignTwitter = async (account: TwitterAccount) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            return;
        }
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/assignTwitterAccount`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        refresh_token: account.refresh_token,
                    }),
                }
            );
            const data = await response.json();
            if (response.ok) {
                toast.success("Twitter assigned successfully!");
                setTwitterName(account.twitter_Name);
            } else {
                toast.error(`Failed to assign account: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error assigning account:", error);
            toast.error("Error assigning account");
        } finally {
            handleClose2();
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
                    minHeight: "100vh",
                    width: "100%",
                    mt: isMobile ? "10px" : "0",
                    position: "relative",
                }}
            >
                {/* Top Bar: Twitter Icon and User Profile */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <img src="/X.png" alt="X" style={{ width: 30, height: 30, marginRight: "10px" }} />
                    {user && (
                        <>
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
                                <Avatar src="/mnt/data/image.png" alt="User" sx={{ width: 26, height: 26 }} />
                                <Typography sx={{ color: "#8F8F8F", fontSize: "14px", fontWeight: 500 }}>
                                    @{twitterName}
                                </Typography>
                                <IconButton onClick={handleArrowClick} sx={{ p: 0 }}>
                                    <ArrowDropDownCircleOutlined sx={{ color: "#8F8F8F", fontSize: 18 }} />
                                </IconButton>
                            </Box>
                            <Popover
                                open={Boolean(anchorEl2)}
                                anchorEl={anchorEl2}
                                onClose={handleClose2}
                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                transformOrigin={{ vertical: "top", horizontal: "right" }}
                                PaperProps={{
                                    sx: {
                                        backgroundColor: "black",
                                        border: "1px solid #3C3C3C",
                                        borderRadius: "12px",
                                        boxShadow: 3,
                                        padding: 1,
                                    },
                                }}
                            >
                                <Box sx={{ minWidth: "200px" }}>
                                    {accounts.map((account) => (
                                        <Box
                                            key={account._id}
                                            onClick={() => handleAssignTwitter(account)}
                                            sx={{
                                                padding: "8px 16px",
                                                cursor: "pointer",
                                                "&:hover": { backgroundColor: "#2F2F2F" },
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ color: "grey" }}>
                                                @{account.twitter_Name}
                                            </Typography>
                                        </Box>
                                    ))}
                                    {accounts.length === 0 && (
                                        <Box sx={{ padding: "8px 16px" }}>
                                            <Typography variant="body2" color="textSecondary">
                                                No Twitter accounts found.
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Popover>
                        </>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    {user && (
                        <>
                            {twitterConnect && twitterConnect.trim().length > 0 ? (
                                <Switch
                                    color="warning"
                                    checked={twitterEnabled}
                                    onChange={handleSwitchChange}
                                    sx={{ transform: "scale(0.9)" }}
                                />
                            ) : (
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={handleRedirect}
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
                                        "&:hover": { backgroundColor: "#FFB300", color: "#111" },
                                    }}
                                >
                                    Connect
                                </Button>
                            )}
                        </>
                    )}
                </Box>

                {/* Main Content Area */}
                <Box
                    sx={{
                        textAlign: "justify",
                        width: "100%",
                        padding: 2,
                        mt: 2,
                        flexGrow: 1,
                        maxHeight: isMobile ? "500px" : "100%",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { width: "4px" },
                        "&::-webkit-scrollbar-thumb": { backgroundColor: "#FFB300", borderRadius: "3px" },
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
                                inputProps={{ onMouseUp: handleMouseUp, onKeyUp: handleKeyUp }}
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
                    ) : user && !twitterEnabled ? (
                        <Box sx={{ fontSize: "14px", color: "#8F8F8F", whiteSpace: "pre-line" }}>
                            Change your parameter if you want to see result.
                        </Box>
                    ) : (
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
                                    {announcement ? announcement.twitter : displayText || "No announcement yet..."}
                                </ReactMarkdown>
                            </Box>
                        </>
                    )}
                </Box>

                {/* Toolbar & Scheduling Section */}
                <Box sx={{ position: "sticky", bottom: 0, zIndex: 1 }}>
                    {user && (
                        <>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 2, mb: 2, gap: 1 }}>
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
                                    {/* Edit/Save Button */}
                                    <IconButton
                                        sx={{ color: "#8F8F8F" }}
                                        onClick={() => {
                                            if (!isEditing) {
                                                const currentText =
                                                    selectedAnnouncement && selectedAnnouncement.length > 0
                                                        ? selectedAnnouncement[0].twitter
                                                        : displayText;
                                                setEditableText(currentText);
                                                setIsEditing(true);
                                            } else {
                                                handleUpdate();
                                            }
                                        }}
                                    >
                                        {isEditing ? <Done fontSize="small" /> : <Edit fontSize="small" />}
                                    </IconButton>
                                    <IconButton
                                        sx={{ color: "#8F8F8F" }}
                                        onClick={() => handleIconAction(() => { /* Mood action placeholder */ })}
                                    >
                                        <Mood fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        component="label"
                                        sx={{ color: "#8F8F8F" }}
                                        onClick={(e) => {
                                            if (isEditing) {
                                                e.preventDefault();
                                                toast.info("Please save your editing block first", { position: "top-right" });
                                            }
                                        }}
                                    >
                                        {!isEditing && isLoading ? (
                                            <CircularProgress size={24} />
                                        ) : (
                                            <InsertPhoto fontSize="small" />
                                        )}
                                        <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                                    </IconButton>
                                    <IconButton sx={{ color: "#8F8F8F" }} onClick={() => handleIconAction(() => handleRegenerate(false))}>
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
                                        onClick={() => handleIconAction(() => handleRegenerate(true))}
                                        disabled={isRegenerating}
                                    >
                                        <Replay fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                            {!isMobile && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, mb: 2 }}>
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
                                        onClick={announcement?.publishedAtTwitter ? undefined : handleSchedulePost}
                                        disabled={!announcement?.publishedAtTwitter && isPosting}
                                        sx={{
                                            backgroundColor: "#191919",
                                            color: "#666",
                                            borderRadius: "12px",
                                            height: 50,
                                            flex: 1,
                                            width: "150px",
                                            textTransform: "none",
                                            "&:hover": { backgroundColor: "#FFA500", color: "black" },
                                        }}
                                    >
                                        {isPosting ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : announcement?.publishedAtTwitter ? (
                                            <>
                                                {dayjs(announcement.publishedAtTwitter).format("MMM DD, YYYY")} -{" "}
                                                {dayjs(announcement.publishedAtTwitter).format("HH:mm")}{" "}
                                                <span
                                                    onClick={ChangeStatus}
                                                    style={{ marginLeft: 8, fontWeight: "bold", color: "red", cursor: "pointer" }}
                                                >
                                                    X
                                                </span>
                                            </>
                                        ) : announcement?.scheduledAtTwitter ? (
                                            <>
                                                {`Scheduled at: ${dayjs(announcement.scheduledAtTwitter).format("MMM DD, YYYY")} - ${dayjs(
                                                    announcement.scheduledAtTwitter
                                                ).format("HH:mm")}`}
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
            </Box>
        </>
    );
};

export default TwitterBlock;
