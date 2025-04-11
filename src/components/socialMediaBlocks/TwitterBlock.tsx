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
import { keyframes, useTheme } from "@mui/material/styles";
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
    Close as CloseIcon,

} from "@mui/icons-material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import EmojiPicker from "emoji-picker-react";
import { loadPreferences } from "@/store/slices/accountsSlice";
import { useRouter } from "next/router";
// at the top of postsSlice.ts

export interface Post {
    _id: string;
    title: string;
    prompt: string;
    status: string;
    discord?: string;               // still optional
    telegram?: string;              // ← make this optional
    createdAt: string;
    updatedAt: string;
    scheduledAtDiscord?: string;
    publishedAtDiscord?: string;
    scheduledAtTelegram?: string;
    publishedAtTelegram?: string;
    publishedAtTwitter?: string;
    scheduledAtTwitter?: string;
    twitter?: string;
    image_discord?: string;
    image_twitter?: string;
    image_telegram?: string;
    // …etc…
}
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
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
interface PreferencesData {
    OpenIA?: boolean;
    Gemini?: boolean;
    DISCORD_WEBHOOK_URL?: string;
    TELEGRAM_CHAT_ID?: string;
    refresh_token?: string;
    twitter?: boolean;
    discord?: boolean;
    Discord_Server_Name?: string;
    twitter_Name?: string;
    TELEGRAM_GroupName?: string;
}

interface UserPreference {
    OpenIA?: boolean;
    Gemini?: boolean;
    DISCORD_WEBHOOK_URL?: string;
    TELEGRAM_CHAT_ID?: string;
    twitterConnect?: string;
    twitter?: boolean;
    discord?: boolean;
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

    const [twitterName, setTwitterName] = useState<string>("");

    const preference = useSelector((state: RootState) => state.accounts.preferences); // Get preferences from Redux store
    useEffect(() => {
        if (user) {
            dispatch(loadPreferences());
        }
    }, [dispatch, user]);
    // Effect to update the local state (discordEnabled) when preferences change.
    useEffect(() => {
        if (preference?.twitter) {
            setTwitterEnabled(preference.twitter);
        }
    }, [preference]);
    // Fetch user preferences from API using the provided snippet.
    // This effect will run whenever the user changes (e.g., when logged in)
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
    //                     twitter: data.twitter,
    //                     refresh_token: data.refresh_token
    //                 });
    //                 if (data.twitter) {
    //                     setTwitterEnabled(data.twitter);
    //                 }
    //                 if (data.twitter_Name) {
    //                     setTwitterName(data.twitter_Name);
    //                 }
    //             }
    //         })
    //         .catch((err) => console.error("Error fetching preferences:", err));
    // }, [user]);
    // useEffect(() => {
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
    //                 setPreferredProvider(data.OpenIA ? "OpenAI" : "Gemini");
    //                 setOpenIaKey((data as any).OpenIaKey || "");
    //                 setGeminiKey((data as any).GeminiKey || "");
    //                 setDiscordWebhookUrl(data.DISCORD_WEBHOOK_URL || "");
    //                 setTelegramChatId(data.TELEGRAM_CHAT_ID || "");
    //                 setTwitterConnect(data.refresh_token || "");
    //                 setTwitter(data.twitter || "");
    //                 setDiscord(data.discord || "");
    //                 setTelegram(data.telegram || "");
    //                 setDiscordServerName(data.Discord_Server_Name || "");
    //                 setTwitterName(data.twitter_Name || "");
    //                 setTelegramGroupName(data.TELEGRAM_GroupName || "");

    //                 // Enable Twitter switch if twitter string exists and is non-empty
    //                 setTwitterEnabled(Boolean(data.twitter));
    //             }
    //         })
    //         .catch((err) => console.error("Error fetching preferences:", err));
    // }, [user]);

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
    const [showTextToolbar, setShowTextToolbar] = useState(false);

    const [selectionStart, setSelectionStart] = useState(0);
    const [selectionEnd, setSelectionEnd] = useState(0);
    const handleMouseUp = () => {
        const textarea = textFieldRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        setSelectionStart(start);
        setSelectionEnd(end);
        setShowTextToolbar(start !== end);
    };

    const handleKeyUp = () => handleMouseUp(); // reuse same logic

    const handleFormat = (formatType: string) => {
        if (
            selectionStart === null ||
            selectionEnd === null ||
            selectionStart === selectionEnd
        ) return;

        const selected = editableText.substring(selectionStart, selectionEnd);

        let wrappedText = selected;
        switch (formatType) {
            case "bold":
                wrappedText = `**${selected}**`;
                break;
            case "italic":
                wrappedText = `*${selected}*`;
                break;
            case "underline":
                wrappedText = `<u>${selected}</u>`;
                break;
            case "strike":
                wrappedText = `~~${selected}~~`;
                break;
            case "inlineCode":
                wrappedText = `\`${selected}\``;
                break;
            case "codeBlock":
                wrappedText = "```\n" + selected + "\n```";
                break;
            case "spoiler":
                wrappedText = `||${selected}||`;
                break;
            default:
                break;
        }
        // switch (formatType) { 
        //     case "bold":
        //         wrappedText = `**${selected}**`; // for in-app markdown preview only
        //         break;
        //     case "italic":
        //         wrappedText = `*${selected}*`;
        //         break;
        //     case "underline":
        //         wrappedText = `__${selected}__`;
        //         break;
        //     case "strike":
        //         wrappedText = `~~${selected}~~`;
        //         break;
        //     case "inlineCode":
        //         wrappedText = `\`${selected}\``;
        //         break;
        //     case "codeBlock":
        //         wrappedText = `\`\`\`\n${selected}\n\`\`\``;
        //         break;
        //     case "spoiler":
        //         wrappedText = `||${selected}||`;
        //         break;
        //     case "hashtag":
        //         wrappedText = `#${selected.replace(/\s+/g, '')}`;
        //         break;
        //     case "caps":
        //         wrappedText = selected.toUpperCase();
        //         break;
        //     default:
        //         break;
        // }

        const before = editableText.slice(0, selectionStart);
        const after = editableText.slice(selectionEnd);
        const newText = before + wrappedText + after;

        setEditableText(newText);
        setShowTextToolbar(false);

        setTimeout(() => {
            const cursorPosition = before.length + wrappedText.length;
            if (textFieldRef.current) {
                textFieldRef.current.focus();
                textFieldRef.current.selectionStart = cursorPosition;
                textFieldRef.current.selectionEnd = cursorPosition;
            }
        }, 0);
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
                await dispatch(regeneratePost({ platform: "twitter", postId })).unwrap();
            } else {
                await dispatch(regeneratePostOpenAi({ platform: "twitter", postId })).unwrap();
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
                dispatch(fetchPostsByStatus({ status: "drafts", page: 1, limit: 10 }));
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
    useEffect(() => {
        if (announcement?.publishedAtTwitter) {
            // if already published, show that
            const dt = dayjs(announcement.publishedAtTwitter);
            setSelectedDate(dt);
            setSelectedTime(dt);
            // updateButtonText(dt, dt);
        } else if (announcement?.scheduledAtTwitter) {
            // if scheduled, seed the picker
            const dt = dayjs(announcement.scheduledAtTwitter);
            setSelectedDate(dt);
            setSelectedTime(dt);
            // updateButtonText(dt, dt);
        } else {
            // brand‑new / no schedule → clear everything
            setSelectedDate(null);
            setSelectedTime(null);
            // updateButtonText(null, null);
        }
    }, [announcement?._id, announcement?.publishedAtTwitter, announcement?.scheduledAtTwitter]);
    const router = useRouter();
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
            if (!response.ok) {
                toast.error("Failed to schedule post.");
                return;
            }
            const data = await response.json();

            const fullPost = {
                _id: data._id,
                title: data.title,
                prompt: data.prompt,
                status: data.status,
                discord: data.discord ?? "",
                telegram: data.telegram ?? "",   // ← never undefined
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                scheduledAtDiscord: data.scheduledAtDiscord ?? "",
                publishedAtDiscord: data.publishedAtDiscord ?? "",
                scheduledAtTelegram: data.scheduledAtTelegram ?? "",
                publishedAtTelegram: data.publishedAtTelegram ?? "",
                publishedAtTwitter: data.publishedAtTwitter ?? "",
                scheduledAtTwitter: data.scheduledAtTwitter ?? "",
                twitter: data.twitter ?? "",
                image_discord: data.image_discord ?? "",
                image_twitter: data.image_twitter ?? "",
                image_telegram: data.image_telegram ?? "",
                // …and so on for any other required fields…
            };

            dispatch(setSelectedAnnouncement([fullPost]));

            dispatch(fetchPostsByStatus({ status: "drafts", page: 1, limit: 10 }));

            toast.success("Post scheduled successfully!");
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
            dispatch(fetchPostsByStatus({ status: "drafts", page: 1, limit: 10 }));
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
    function shortenString(str: string, front = 6, back = 6) {
        // If the string is already short enough, return as-is
        if (str.length <= front + back) return str;
        // Otherwise, return front...back
        const firstPart = str.slice(0, front);
        const lastPart = str.slice(-back);
        return `${firstPart}...${lastPart}`;
    }
    const handleRemoveAnnouncementImage = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            setIsLoading(true);
            const formData = new FormData();
            // Setting image_discord to an empty string to remove it
            formData.append("image_twitter", "");
            const updatedPost = await dispatch(updatePost({ id: postId, body: formData })).unwrap();
            dispatch(setSelectedAnnouncement([updatedPost]));
            toast.success("Image removed successfully!", { position: "top-right" });
        } catch (error) {
            console.error("Error removing image:", error);
            toast.error("❌ Failed to remove image!", { position: "top-right" });
        } finally {
            setIsLoading(false);
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
                {/* Top Bar: Twitter Icon anpd User Profile */}
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
                                    @{(shortenString(preference?.twitter_Name || "BullPost User"))}


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
                            {preference.refresh_token && preference.refresh_token.trim().length > 0 ? (

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
                                open={isEditing && showTextToolbar}
                                anchorEl={textFieldRef.current}
                                onClose={() => setShowTextToolbar(false)}
                                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                                transformOrigin={{ vertical: "bottom", horizontal: "left" }}
                                disableRestoreFocus
                                PaperProps={{
                                    sx: {
                                        mt: "-8px", // adjust distance above the TextField
                                        ml: "4px",
                                    },
                                }}
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
                                <Box position="relative" display="inline-block" mb={2}>
                                    <img
                                        src={announcement.image_twitter}
                                        alt="Preview"
                                        style={{ display: "block", maxWidth: "100%" }}
                                    />
                                    <IconButton
                                        onClick={handleRemoveAnnouncementImage}
                                        size="small"
                                        sx={{
                                            position: "absolute",
                                            top: 4,
                                            right: 4,
                                            backgroundColor: "rgba(0,0,0,0.6)",
                                            padding: "2px",
                                            color: "#fff",
                                            "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                                            minWidth: "auto",
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
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
                    {user && twitterEnabled && (
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
                                        {isEditing ? (
                                            isLoading ? (
                                                <AutorenewIcon fontSize="small" sx={{ animation: `${spin} 1s linear infinite` }} />
                                            ) : (
                                                <Done fontSize="small" />
                                            )
                                        ) : (
                                            <Edit fontSize="small" />
                                        )}                                    </IconButton>
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
