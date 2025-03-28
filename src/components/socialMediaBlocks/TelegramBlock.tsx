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
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    ArrowDropDownCircleOutlined,
    AutoAwesome,
    Done,
    Edit,
    InsertPhoto,
    Mood,
    Replay,
} from "@mui/icons-material";
import TelegramIcon from "@mui/icons-material/Telegram";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import {
    FormatBold as FormatBoldIcon,
    FormatItalic as FormatItalicIcon,
    FormatUnderlined as FormatUnderlinedIcon,
    StrikethroughS as StrikethroughSIcon,
    Code as CodeIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { keyframes } from "@mui/system";
import { DateCalendar, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useAuth } from "@/hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
    fetchPostsByStatus,
    regeneratePost,
    regeneratePostOpenAi,
    setSelectedAnnouncement,
    updatePost,
} from "@/store/slices/postsSlice";
import ConnectModal from "./ConnectModal";
import EmojiPicker from "emoji-picker-react";
import { loadPreferences } from "@/store/slices/accountsSlice";

// Spinning animation
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

interface TelegramBlockProps {
    submittedText: string;
    onSubmit: () => void;
    _id: string;
    ai: boolean;
}
interface TelegramAccount {
    _id: string;
    chatId: string;
    groupName: string;
}
interface UserPreference {
    OpenIA?: boolean;
    Gemini?: boolean;
    DISCORD_WEBHOOK_URL?: string;
    TELEGRAM_CHAT_ID?: string;
    TELEGRAM_GroupName?: string;
    twitterConnect?: string;
    discord?: string;
    telegram?: boolean;

}
interface PreferencesData {
    OpenIA?: boolean;
    Gemini?: boolean;
    DISCORD_WEBHOOK_URL?: string;
    TELEGRAM_CHAT_ID?: string;
    refresh_token?: string;
    twitter?: boolean;
    discord?: boolean;
    telegram?: boolean;
    Discord_Server_Name?: string;
    twitter_Name?: string;
    TELEGRAM_GroupName?: string;
}
const TelegramBlock: React.FC<TelegramBlockProps> = ({ submittedText, _id, ai }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useAuth();

    // Local state definitions
    const [modalOpen, setModalOpen] = useState(false);
    const [displayText, setDisplayText] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editableText, setEditableText] = useState("");
    const [isPosting, setIsPosting] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
    const [timeZone, setTimeZone] = useState<string>("");
    const [buttonText, setButtonText] = useState<string>("Post Now");
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);
    // const [preference, setPreference] = useState<UserPreference>({});
    const [telegramEnabled, setTelegramEnabled] = useState(false);
    const [TELEGRAM_GroupName, setTELEGRAM_GroupName] = useState("");

    const preference = useSelector((state: RootState) => state.accounts.preferences); // Get preferences from Redux store

    useEffect(() => {
        if (user) {
            dispatch(loadPreferences());
        }
    }, [dispatch, user]);
    // Effect to update the local state (discordEnabled) when preferences change.
    useEffect(() => {
        if (preference?.telegram) {
            setTelegramEnabled(preference.telegram);
        }
    }, [preference]);
    // Refs for typewriter effect and text formatting
    const textFieldRef = useRef<HTMLTextAreaElement | null>(null);
    const indexRef = useRef(0);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);

    // Retrieve announcement from Redux (announcement takes precedence)
    const selectedAnnouncement = useSelector((state: RootState) => state.posts.selectedAnnouncement);
    const announcement = selectedAnnouncement && selectedAnnouncement.length > 0 ? selectedAnnouncement[0] : null;
    const postId = announcement?._id || _id;

    // Set user's time zone on mount
    useEffect(() => {
        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);
    // useEffect(() => {
    //     const token = localStorage.getItem("token");
    //     if (!token) return;
    //     fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/getPreferences`, {
    //         method: "GET",
    //         headers: {
    //             "Content-Type": "application/json",
    //             Authorization: `Bearer ${token}`,
    //         },
    //     })
    //         .then((res) => res.json())
    //         .then((data: PreferencesData) => {
    //             if (data) {
    //                 setPreference({
    //                     OpenIA: data.OpenIA,
    //                     Gemini: data.Gemini,
    //                     DISCORD_WEBHOOK_URL: data.DISCORD_WEBHOOK_URL,
    //                     TELEGRAM_CHAT_ID: data.TELEGRAM_CHAT_ID,
    //                     TELEGRAM_GroupName: data.TELEGRAM_GroupName,
    //                     telegram: data.telegram,
    //                 });
    //                 if (data.telegram) {
    //                     setTelegramEnabled(data.telegram);
    //                 }
    //                 if (data.TELEGRAM_GroupName) {
    //                     setTELEGRAM_GroupName(data.TELEGRAM_GroupName);
    //                 }
    //             }
    //         })
    //         .catch((err) => console.error("Error fetching preferences:", err));
    // }, [user]);
    // Fetch user preferences from API (using the same API GET as in your TwitterBlock)
    // useEffect(() => {
    //     if (!user) return;
    //     const token = localStorage.getItem("token");
    //     if (!token) return;
    //     fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/getPreferences`, {
    //         method: "GET",
    //         headers: {
    //             "Content-Type": "application/json",
    //             "Authorization": `Bearer ${token}`,
    //         },
    //     })
    //         .then((res) => res.json())
    //         .then((data: UserPreference) => {
    //             if (data) {
    //                 console.log(data, "data");

    //                 setPreference(data);
    //                 setTelegramEnabled(Boolean(data.TELEGRAM_CHAT_ID && data.TELEGRAM_CHAT_ID.trim().length > 0));
    //                 setTELEGRAM_GroupName(data.TELEGRAM_GroupName || "");
    //                 // Enable Telegram switch if TELEGRAM_CHAT_ID exists and is non-empty
    //                 setTelegramEnabled(Boolean(data.telegram));
    //             }
    //         })
    //         .catch((err) => console.error("Error fetching preferences:", err));
    // }, [user]);

    // Typewriter effect for submitted text when AI mode is active
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

    // Handle file change for image upload
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            console.log("Selected file:", file.name);
            const currentText = announcement ? announcement.telegram : displayText;
            setEditableText(currentText);
            setSelectedImage(file);
        }
    };

    // Update Telegram post (text and image)
    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            const textToSend = editableText.trim() || displayText;
            const formData = new FormData();
            formData.append("telegram", textToSend);
            if (selectedImage) {
                formData.append("image_telegram", selectedImage);
            } else {
                console.warn("No image found in selectedImage state.");
            }
            for (let pair of formData.entries()) {
                console.log(pair[0] + ": " + pair[1]);
            }
            const updatedPost = await dispatch(updatePost({ id: postId, body: formData })).unwrap();
            dispatch(setSelectedAnnouncement([updatedPost]));
            setDisplayText(updatedPost?.telegram || textToSend);
            setSelectedImage(null);
        } catch (error) {
            console.error("Error updating post:", error);
        } finally {
            setIsLoading(false);
            setIsEditing(false);
        }
    };

    // Post immediately handler
    const handlePostNow = async () => {
        const textToPost = submittedText.trim() || (announcement ? announcement.telegram : "");
        if (!textToPost) {
            toast.warn("⚠️ Message cannot be empty!", { position: "top-right" });
            return;
        }
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            setIsPosting(true);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}postTelegram/postNow/${postId}`,
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
            console.error("Error sending message to Telegram:", error);
            toast.error("❌ Failed to send message!", { position: "top-right" });
        } finally {
            setIsPosting(false);
        }
    };

    // Update scheduling button text based on date/time selections or published time
    const updateButtonText = (date: Dayjs | null, time: Dayjs | null) => {
        if (announcement?.publishedAtTelegram) {
            const publishedDate = dayjs(announcement.publishedAtTelegram);
            setButtonText(
                `Published at: ${publishedDate.format("MMM DD, YYYY")} - ${publishedDate.format("HH:mm")}`
            );
        } else if (date && time) {
            setButtonText(`${date.format("MMM DD, YYYY")} - ${time.format("HH:mm")}`);
        } else {
            setButtonText("Post Now");
        }
    };

    // Scheduling handlers
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

    // Schedule post handler
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
        const requestBody = { dateTime: combinedDateTime.toISOString(), timeZone };
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}postTelegram/schedulePostTelegram/${postId}`,
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
    const [isRegeneratingAutoAwesome, setIsRegeneratingAutoAwesome] = useState(false);
    const [isRegeneratingReplay, setIsRegeneratingReplay] = useState(false);
    // Regenerate post handler using Gemini or OpenAI
    const handleRegenerate = async (icon: boolean, isAutoAwesome: boolean) => {
        if (isAutoAwesome) {
            setIsRegeneratingAutoAwesome(true);
        } else {
            setIsRegeneratingReplay(true);
        }

        try {
            if (preference?.Gemini) {
                await dispatch(regeneratePost({ platform: "telegram", postId })).unwrap();
            } else {
                await dispatch(regeneratePostOpenAi({ platform: "telegram", postId })).unwrap();
            }
            toast.success("Regenerate successful! 🎉");
        } catch (error) {
            toast.error("Regenerate failed. Please try again.");
        } finally {
            if (isAutoAwesome) {
                setIsRegeneratingAutoAwesome(false);
            } else {
                setIsRegeneratingReplay(false);
            }
        }
    };
    // Guard icon actions when editing is active
    const handleIconAction = (action: () => void) => {
        if (isEditing) {
            toast.info("Please save your editing block first", { position: "top-right" });
            return;
        }
        action();
    };

    // Switch preference & save handler for Telegram connection (if needed)
    const handleSavePreference = async (telegramValue: boolean) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const requestBody = { telegram: telegramValue };
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
        setTelegramEnabled(newValue);
        await handleSavePreference(newValue);
    };

    // Modal controls for Connect
    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

    // Change status (unpublishing) handler
    const handleChangeStatus = async () => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("status", "drafts");
            formData.append("publishedAtTelegram", "");
            const updatedPost = await dispatch(updatePost({ id: postId, body: formData })).unwrap();
            dispatch(setSelectedAnnouncement([updatedPost]));
            dispatch(fetchPostsByStatus({ status: "drafts", page: 1, limit: 10 }));
            setSelectedImage(null);
        } catch (error) {
            console.error("Error updating post status:", error);
        } finally {
            setIsLoading(false);
            setIsEditing(false);
        }
    };

    // Auto-update when a new image is selected
    useEffect(() => {
        if (selectedImage) {
            handleUpdate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedImage]);

    // Telegram account assignment (fetch and assign Telegram accounts)
    const [accounts, setAccounts] = useState<TelegramAccount[]>([]);
    const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const handleArrowClick = (event: any) => {
        setAnchorEl2(event.currentTarget);
    };
    const handleClose2 = () => {
        setAnchorEl2(null);
    };

    useEffect(() => {
        const loadTelegramAccounts = async () => {
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
                        body: JSON.stringify({ types: ["telegram"] }),
                    }
                );
                if (!response.ok) {
                    console.error("Failed to fetch telegram accounts:", response.statusText);
                    return;
                }
                const data = await response.json();
                const accountsArray =
                    data && data.data && Array.isArray(data.data.telegram)
                        ? data.data.telegram
                        : [];
                setAccounts(accountsArray);
            } catch (error) {
                console.error("Error fetching telegram accounts:", error);
            }
        };

        loadTelegramAccounts();
    }, []);

    // Assign Telegram account handler using the API GET preferences result
    const handleAssignTelegramWebhook = async (account: TelegramAccount) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            return;
        }
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/assignTelegramChatId`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        chatId: account.chatId,
                    }),
                }
            );
            const data = await response.json();
            if (response.ok) {
                toast.success("Telegram webhook assigned successfully!");
                if (!user) return;
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
                            // setPreference(data);
                            setTelegramEnabled(Boolean(data.TELEGRAM_CHAT_ID && data.TELEGRAM_CHAT_ID.trim().length > 0));
                            setTELEGRAM_GroupName(data.TELEGRAM_GroupName || "");
                            // Enable Telegram switch if TELEGRAM_CHAT_ID exists and is non-empty
                            setTelegramEnabled(Boolean(data.TELEGRAM_CHAT_ID && data.TELEGRAM_CHAT_ID.trim().length > 0));
                        }
                    })
                    .catch((err) => console.error("Error fetching preferences:", err));
                // Update current Telegram chat id or group name in state as needed
                // For example, you might update a state variable that holds the current group name
            } else {
                toast.error(`Failed to assign telegram webhook: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error assigning telegram webhook:", error);
            toast.error("Error assigning telegram webhook");
        } finally {
            handleClose2();
        }
    };
    const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);
    const handleEmojiButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isEditing) {
            toast.info("Please enable editing first", { position: "top-right" });
            return;
        }
        setEmojiAnchorEl(e.currentTarget);
    };

    const handleCloseEmojiPicker = () => {
        setEmojiAnchorEl(null);
    };
    const handleEmojiClick = (emojiData: any, event: MouseEvent) => {
        if (!textFieldRef.current) return;
        const start = textFieldRef.current.selectionStart;
        const end = textFieldRef.current.selectionEnd;
        const before = editableText.substring(0, start);
        const after = editableText.substring(end);
        const emoji = emojiData.emoji || emojiData; // adjust based on your EmojiPicker response
        const newText = before + emoji + after;
        setEditableText(newText);
        // Set caret position after inserted emoji
        setTimeout(() => {
            if (textFieldRef.current) {
                textFieldRef.current.focus();
                textFieldRef.current.selectionStart = textFieldRef.current.selectionEnd = start + emoji.length;
            }
        }, 0);
        handleCloseEmojiPicker();
    };

    return (
        <Box
            sx={{
                flex: 1,
                backgroundColor: "#111112",
                p: 2,
                backgroundImage: "url('/TelegramColor.png')",
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
            {/* Top Bar: Telegram Icon and User Profile */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <img src="/telegram.png" alt="telegram" style={{ width: 30, height: 30, marginRight: "10px" }} />
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
                                @{preference.TELEGRAM_GroupName
                                    ? preference.TELEGRAM_GroupName
                                    : "BullPost User"}
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
                                        onClick={() => handleAssignTelegramWebhook(account)}
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
                                            No telegram accounts found.
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
                        {preference.TELEGRAM_CHAT_ID && preference.TELEGRAM_CHAT_ID.trim().length > 0 ? (
                            <Switch
                                color="warning"
                                checked={telegramEnabled}
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
                        <ConnectModal open={modalOpen} onClose={handleCloseModal} platform="telegram" />
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
                ) : user && !telegramEnabled ? (
                    <Box sx={{ fontSize: "14px", color: "#8F8F8F", whiteSpace: "pre-line" }}>
                        Change your parameter if you want to see result.
                    </Box>
                ) : (
                    <>
                        {announcement && announcement.image_telegram && (
                            <img
                                src={announcement.image_telegram}
                                alt="Preview"
                                style={{ maxWidth: "100%", marginBottom: "10px" }}
                            />
                        )}
                        <Box sx={{ fontSize: "14px", color: "#8F8F8F", whiteSpace: "pre-line" }}>
                            <ReactMarkdown>
                                {announcement ? announcement.telegram : displayText || "No announcement yet..."}
                            </ReactMarkdown>
                        </Box>
                    </>
                )}
            </Box>

            {/* Toolbar & Scheduling Section */}
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
                                            const currentText = announcement ? announcement.telegram : displayText;
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
                                <IconButton sx={{ color: "#8F8F8F" }} onClick={handleEmojiButtonClick}>
                                    <Mood fontSize="small" />
                                </IconButton>
                                <Popover
                                    open={Boolean(emojiAnchorEl)}
                                    anchorEl={emojiAnchorEl}
                                    onClose={handleCloseEmojiPicker}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                >
                                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                                </Popover>
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
                                <IconButton
                                    sx={{
                                        color: "#8F8F8F",
                                        animation: isRegeneratingAutoAwesome ? `${spin} 1s linear infinite` : "none", // Apply animation for AutoAwesome button
                                    }}
                                    onClick={() => handleRegenerate(false, true)} // true for AutoAwesome button
                                >
                                    <AutoAwesome fontSize="small" />
                                </IconButton>

                                <Box sx={{ width: "1px", height: "20px", backgroundColor: "#555", mx: 1 }} />

                                <IconButton
                                    sx={{
                                        color: "red",
                                        animation: isRegeneratingReplay ? "spin 1s linear infinite" : "none", // Apply animation for Replay button
                                        "@keyframes spin": {
                                            "0%": { transform: "rotate(360deg)" },
                                            "100%": { transform: "rotate(0deg)" },
                                        },
                                    }}
                                    onClick={() => handleRegenerate(true, false)} // false for Replay button
                                    disabled={isRegeneratingReplay} // Disable button while regenerating
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
                                    onClick={announcement?.publishedAtTelegram ? undefined : handleSchedulePost}
                                    disabled={!announcement?.publishedAtTelegram && isPosting}
                                    sx={{
                                        backgroundColor: "#191919",
                                        color: "#666",
                                        borderRadius: "12px",
                                        height: 50,
                                        flex: 1,
                                        textTransform: "none",
                                        width: "150px",
                                        "&:hover": { backgroundColor: "#FFA500", color: "black" },
                                    }}
                                >
                                    {isPosting ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : announcement?.publishedAtTelegram ? (
                                        <>
                                            {dayjs(announcement.publishedAtTelegram).format("MMM DD, YYYY")} -{" "}
                                            {dayjs(announcement.publishedAtTelegram).format("HH:mm")}{" "}
                                            <span
                                                onClick={handleChangeStatus}
                                                style={{ marginLeft: 8, fontWeight: "bold", color: "red", cursor: "pointer" }}
                                            >
                                                X
                                            </span>
                                        </>
                                    ) : announcement?.scheduledAtTelegram ? (
                                        <>
                                            {`Scheduled at: ${dayjs(announcement.scheduledAtTelegram).format("MMM DD, YYYY")} - ${dayjs(
                                                announcement.scheduledAtTelegram
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
    );
};

export default TelegramBlock;
