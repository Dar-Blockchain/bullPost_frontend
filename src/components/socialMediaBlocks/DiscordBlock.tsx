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
    List,
    ListItem,
    ListItemText,
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
import ConnectModal from "./ConnectModal";
interface DiscordAccount {
    _id: string;
    webhookUrl: string;
    groupName: string;
}
// Keyframes for spinning animation
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

interface UserPreference {
    OpenIA?: boolean;
    Gemini?: boolean;
    DISCORD_WEBHOOK_URL?: string;
    TELEGRAM_CHAT_ID?: string;
    discord?: boolean;
}

const DiscordBlock: React.FC<DiscordBlockProps> = ({ submittedText, onSubmit, _id, ai }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useAuth();

    // Local States
    const [modalOpen, setModalOpen] = useState(false);
    const [displayText, setDisplayText] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editableText, setEditableText] = useState("");
    const [isPosting, setIsPosting] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
    const [timeZone, setTimeZone] = useState<string>("");
    const [buttonText, setButtonText] = useState<string>("Post Now");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [preference, setPreference] = useState<UserPreference>({});
    const [discrodEnabled, setDiscrodEnabled] = useState(false);

    // Refs for typewriter effect and text formatting
    const textFieldRef = useRef<HTMLTextAreaElement | null>(null);
    const indexRef = useRef(0);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);

    // Retrieve announcement from Redux (announcement takes precedence)
    const selectedAnnouncement = useSelector((state: RootState) => state.posts.selectedAnnouncement);
    const announcement = selectedAnnouncement && selectedAnnouncement.length > 0 ? selectedAnnouncement[0] : null;
    const postId = announcement?._id || _id;

    // Detect user's time zone on mount
    useEffect(() => {
        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);
    const [discordServerName, setDiscordServerName] = useState("");

    // Load user preferences from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedPreference = localStorage.getItem("userPreference");
            const parsedPreference = storedPreference ? JSON.parse(storedPreference) : {};
            setPreference(parsedPreference);
            if (parsedPreference.Discord) {
                setDiscrodEnabled(parsedPreference.Discord);
            }
            if (parsedPreference.discordServerName) {
                setDiscordServerName(parsedPreference.discordServerName);
            }
        }
    }, []);

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

    // Update scheduling button text based on selected date/time or published status
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

    // Scheduling popover handlers
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleDateChange = (newDate: Dayjs | null) => {
        setSelectedDate(newDate);
        updateButtonText(newDate, selectedTime);
    };
    const handleTimeChange = (newTime: Dayjs | null) => {
        setSelectedTime(newTime);
        updateButtonText(selectedDate, newTime);
    };

    // Post immediately or schedule based on date/time
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
            const data = await response.json();
            console.log(data, "Post Now Response");
            if (response.ok) {
                dispatch(fetchPostsByStatus({ status: "drafts" }));
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

    const handleSchedulePost = async () => {
        if (!selectedDate || !selectedTime) return handlePostNow();
        const combinedDateTime = selectedDate
            .set("hour", selectedTime.hour())
            .set("minute", selectedTime.minute())
            .set("second", 0);
        const token = localStorage.getItem("token");
        const requestBody = { dateTime: combinedDateTime.toISOString(), timeZone };

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
                dispatch(fetchPostsByStatus({ status: "drafts" }));
                toast.success("Post scheduled successfully!");
            } else {
                toast.error("Failed to schedule post.");
            }
        } catch (error) {
            console.error("Error scheduling post:", error);
            alert("Error scheduling post.");
        }
    };

    // Handle image file selection and update post accordingly
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            console.log("Selected file:", file.name);
            const currentText = announcement?.discord || displayText;
            setEditableText(currentText);
            setSelectedImage(file);
        }
    };

    // Update post content and image
    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            const textToSend = editableText.trim() || displayText;
            const formData = new FormData();
            formData.append("discord", textToSend);
            if (selectedImage) {
                formData.append("image_discord", selectedImage);
            } else {
                console.warn("No image found in selectedImage state.");
            }
            // Log form data for debugging
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

    // Change post status (used for unpublishing)
    const handleChangeStatus = async () => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("status", "drafts");
            formData.append("publishedAtDiscord", "");
            const updatedPost = await dispatch(updatePost({ id: postId, body: formData })).unwrap();
            dispatch(setSelectedAnnouncement([updatedPost]));
            dispatch(fetchPostsByStatus({ status: "drafts" }));
            setSelectedImage(null);
        } catch (error) {
            console.error("Error updating post status:", error);
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

    // Text formatting popover handlers
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

    const handleFormat = (formatType: string) => {
        if (!textFieldRef.current) return;
        const start = textFieldRef.current.selectionStart;
        const end = textFieldRef.current.selectionEnd;
        if (start === end) return;
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
        setTimeout(() => textFieldRef.current?.focus(), 0);
    };

    // Helper function to guard actions when editing is active
    const handleIconAction = (action: () => void) => {
        if (isEditing) {
            toast.info("Please save your editing block first", { position: "top-right" });
            return;
        }
        action();
    };

    // Preference saving handler for Discord switch
    const handleSave = async (discordValue: boolean) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const storedPref = localStorage.getItem("userPreference");
        const pref = storedPref ? JSON.parse(storedPref) : {};
        const updatedPref = { ...pref, Discord: discordValue };
        localStorage.setItem("userPreference", JSON.stringify(updatedPref));
        console.log("Local preferences saved:", updatedPref);
        const requestBody = { discord: discordValue };
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
            console.log("Preferences saved to backend:", data);
            toast.success("Preferences saved successfully!", { position: "top-right" });
        } catch (error) {
            console.error("Error saving preferences:", error);
            toast.error("❌ Error saving preferences!", { position: "top-right" });
        }
    };

    const handleSwitchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked;
        setDiscrodEnabled(newValue);
        await handleSave(newValue);
    };

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

    // Regenerate post using Gemini or OpenAI
    const handleRegenerate = async (icon: boolean) => {
        if (icon) setIsRegenerating(true);
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
            if (icon) setIsRegenerating(false);
        }
    };

    const isPublished = Boolean(announcement?.publishedAtDiscord);
    const [accounts, setAccounts] = useState<DiscordAccount[]>([]);
    const [anchorEl2, setAnchorEl2] = useState(null);
    const open = Boolean(anchorEl);

    const handleArrowClick = (event: any) => {
        setAnchorEl2(event.currentTarget);
    };

    const handleClose2 = () => {
        setAnchorEl2(null);
    };

    // Fetch Discord accounts from the API
    useEffect(() => {
        const loadDiscordAccounts = async () => {
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
                        body: JSON.stringify({ types: ["discord"] }),
                    }
                );
                if (!response.ok) {
                    console.error("Failed to fetch Discord accounts:", response.statusText);
                    return;
                }
                const data = await response.json();
                const accountsArray =
                    data && data.data && Array.isArray(data.data.discord)
                        ? data.data.discord
                        : [];
                setAccounts(accountsArray);
            } catch (error) {
                console.error("Error fetching Discord accounts:", error);
            }
        };

        loadDiscordAccounts();
    }, []);
    const handleAssignWebhook = async (account: DiscordAccount) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            return;
        }
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/assignDiscordWebhook`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        webhookUrl: account.webhookUrl,
                        groupName: account.groupName,
                    }),
                }
            );
            const data = await response.json();
            if (response.ok) {
                toast.success("Webhook assigned successfully!");
                // Update current Discord server name in state
                setDiscordServerName(account.groupName);
                // Update user preferences in localStorage
                const storedPreference = localStorage.getItem("userPreference");
                const pref = storedPreference ? JSON.parse(storedPreference) : {};
                pref.discordServerName = account.groupName;
                pref.DISCORD_WEBHOOK_URL = account.webhookUrl; // if you want to save the webhook URL too
                localStorage.setItem("userPreference", JSON.stringify(pref));
            } else {
                toast.error(`Failed to assign webhook: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error assigning webhook:", error);
            toast.error("Error assigning webhook");
        } finally {
            handleClose2(); // Close the popover after the API call
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
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    <img src="/discord.svg" alt="Discord" style={{ width: 30, height: 30, marginRight: "10px" }} />
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
                                <Avatar src="/mnt/data/image.png" alt="Julio" sx={{ width: 26, height: 26 }} />
                                <Typography sx={{ color: "#8F8F8F", fontSize: "14px", fontWeight: 500 }}>
                                    @{discordServerName ? discordServerName : "BullPost User"}
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
                                            onClick={() => handleAssignWebhook(account)}

                                            sx={{
                                                padding: "8px 16px",
                                                cursor: "pointer",
                                                "&:hover": { backgroundColor: "#2F2F2F" },
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ color: "grey" }}>
                                                @{account.groupName}
                                            </Typography>
                                        </Box>
                                    ))}
                                    {accounts.length === 0 && (
                                        <Box sx={{ padding: "8px 16px" }}>
                                            <Typography variant="body2" color="textSecondary">
                                                No Discord accounts found.
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
                            {preference.DISCORD_WEBHOOK_URL && preference.DISCORD_WEBHOOK_URL.trim().length > 0 ? (
                                <Switch
                                    color="warning"
                                    checked={discrodEnabled}
                                    onChange={handleSwitchChange}
                                    sx={{ transform: "scale(0.9)" }}
                                />
                            ) : (
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={handleOpenModal}
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
                            <ConnectModal open={modalOpen} onClose={handleCloseModal} platform="discord" />
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
                                anchorPosition={anchorPosition || { top: 0, left: 0 }}
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
                    ) : user && !discrodEnabled ? (
                        <Box sx={{ fontSize: "14px", color: "#8F8F8F", whiteSpace: "pre-line" }}>
                            Change your parameter if you want to see result.
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
                                    {announcement ? announcement.discord : displayText || "No announcement yet..."}
                                </ReactMarkdown>
                            </Box>
                        </>
                    )}
                </Box>

                {/* Toolbar and Scheduling Section */}
                <Box sx={{ position: "sticky", bottom: 0, zIndex: 1 }}>
                    {user && (
                        <>
                            <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column", mt: 2, mb: 2, gap: 1 }}>
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
                                    {/* Edit / Save Button */}
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

                                    {/* Mood Icon */}
                                    <IconButton
                                        sx={{ color: "#8F8F8F" }}
                                        onClick={() => handleIconAction(() => { /* Add Mood action here if needed */ })}
                                    >
                                        <Mood fontSize="small" />
                                    </IconButton>

                                    {/* Insert Photo Button */}
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

                                    {/* Regenerate (AutoAwesome) Button */}
                                    <IconButton
                                        sx={{ color: "#8F8F8F" }}
                                        onClick={() => handleIconAction(() => handleRegenerate(false))}
                                    >
                                        <AutoAwesome fontSize="small" />
                                    </IconButton>

                                    <Box sx={{ width: "1px", height: "20px", backgroundColor: "#555", mx: 1 }} />

                                    {/* Regenerate (Replay) Button */}
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
                                        onClick={isPublished ? undefined : handleSchedulePost}
                                        disabled={!isPublished && isPosting}
                                        sx={{
                                            backgroundColor: "#191919",
                                            color: "#666",
                                            borderRadius: "12px",
                                            height: 50,
                                            textTransform: "none",
                                            flex: 1,
                                            width: "150px",
                                            "&:hover": {
                                                backgroundColor: isPublished ? "#191919" : "#FFA500",
                                                color: isPublished ? "#666" : "black",
                                            },
                                        }}
                                    >
                                        {isPosting ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : announcement?.publishedAtDiscord ? (
                                            <>
                                                {dayjs(announcement.publishedAtDiscord).format("MMM DD, YYYY")} -{" "}
                                                {dayjs(announcement.publishedAtDiscord).format("HH:mm")}{" "}
                                                <span
                                                    onClick={handleChangeStatus}
                                                    style={{ marginLeft: 8, fontWeight: "bold", color: "red", cursor: "pointer" }}
                                                >
                                                    X
                                                </span>
                                            </>
                                        ) : announcement?.scheduledAtDiscord ? (
                                            <>
                                                {dayjs(announcement.scheduledAtDiscord).format("MMM DD, YYYY")} -{" "}
                                                {dayjs(announcement.scheduledAtDiscord).format("HH:mm")}
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

export default DiscordBlock;
