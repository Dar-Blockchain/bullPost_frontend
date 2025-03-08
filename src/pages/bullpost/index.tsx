import React, { useEffect, useRef, useState } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Announcement from "./components/Announcement";
import Toolbar from "./components/Toolbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginModal from "@/components/loginModal/LoginModal";
import BottomActionBar from "./components/BottomActionBar";
import DiscordBlock from "@/components/socialMediaBlocks/DiscordBlock";
import TwitterBlock from "@/components/socialMediaBlocks/TwitterBlock";
import TelegramBlock from "@/components/socialMediaBlocks/TelegramBlock";
import BackgroundImage from "./components/BackgroundImage";
import { fetchPostsByStatus, setSelectedAnnouncement } from "@/store/slices/postsSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

export default function BullPostPage() {
    const [open, setOpen] = useState(false);
    const [submittedText, setSubmittedText] = useState("");
    const [discordText, setDiscordText] = useState("");
    const [twitterText, setTwitterText] = useState("");
    const [telegramText, setTelegramText] = useState("");
    const [_id, setId] = useState("");
    const [ai, setAi] = useState(false);

    const dispatch = useDispatch<AppDispatch>();

    const handleClose = () => setOpen(false);
    const [text, setText] = useState(
        "We have now moved from our private Beta phase into public, onboarding new users and taking wider feedback.\n\nPlease continue to share bugs you find with the team!"
    );
    const handleSubmit = async () => {
        if (!text.trim()) {
            toast.warn("⚠️ Please enter text before submitting!", { position: "top-right" });
            return;
        }
        setAi(true)
        // Retrieve token from localStorage
        const token = localStorage.getItem("token");
        console.log(token, "here my token");

        // Retrieve user preferences from localStorage (stored as a JSON string)
        const userStr = localStorage.getItem("userPreference");
        const userSettings = userStr ? JSON.parse(userStr) : {};

        let apiUrl = "";

        // Check the user's preference and select the appropriate endpoint.
        // For example, if OpenIA is true, then use the OpenAI endpoint.
        if (userSettings?.OpenIA === true) {
            apiUrl = token
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}generationOpenIA/generate`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}generationGemini/generateForVisitor`;
        } else if (userSettings?.Gemini === true) {
            apiUrl = token
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}generationGemini/generatePlatformPost`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}generationGemini/generateForVisitor`;
        } else {
            // Fallback: default to Gemini endpoints if no preference is set
            apiUrl = token
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}generationGemini/generatePlatformPost`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}generationGemini/generateForVisitor`;
        }

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Include Authorization header only if token exists
                    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ prompt: text, platforms: ["twitter", "discord", "telegram"] }),
            });

            const data = await response.json();

            if (response.status === 400) {
                toast.error(`❌ Bad Request: ${data.error || "Invalid request data!"}`, { position: "top-right" });
                return;
            }

            if (!response.ok) {
                toast.error(`❌ Error: ${data.error || "Something went wrong!"}`, { position: "top-right" });
                return;
            }

            if (data && data.newPost) {
                setSubmittedText(data.newPost);
                setDiscordText(data.newPost.discord);
                setTwitterText(data.newPost.twitter);
                setTelegramText(data.newPost.telegram);
                setId(data.newPost._id);

                dispatch(fetchPostsByStatus("draft"));
                dispatch(setSelectedAnnouncement([]));
                toast.success("✅ Post generated successfully!", { position: "top-right" });
            }
        } catch (error) {
            console.error("API Error:", error);
            toast.error("❌ Failed to submit text!", { position: "top-right" });
        }
    };


    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null); // Ref for the announcement input

    const [activeSection, setActiveSection] = useState<"calendar" | "drafts" | "discord" | "twitter" | "telegram" | "post">("drafts");
    const handleEmojiSelect = (emoji: string) => {
        if (inputRef.current) {
            const start = inputRef.current.selectionStart || 0;
            const end = inputRef.current.selectionEnd || 0;
            const before = text.substring(0, start);
            const after = text.substring(end);
            const newText = before + emoji + after;
            setText(newText);

            // Use a short delay to ensure the DOM updates before re-focusing
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    const newCursorPosition = start + emoji.length;
                    inputRef.current.selectionStart = newCursorPosition;
                    inputRef.current.selectionEnd = newCursorPosition;
                }
            }, 0);
        } else {
            setText((prev) => prev + emoji);
        }
    };
    const storedPreference = typeof window !== "undefined" ? localStorage.getItem("userPreference") : null;

    const initialProvider = storedPreference
        ? JSON.parse(storedPreference).OpenIA
            ? "OpenAI"
            : "Gemini"
        : "Gemini";

    const [preferredProvider, setPreferredProvider] = useState(initialProvider);

    // States for additional keys (with default values)
    const [openIaKey, setOpenIaKey] = useState("");
    const [geminiKey, setGeminiKey] = useState("");
    const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
    const [telegramChatId, setTelegramChatId] = useState("");
    useEffect(() => {
        const preference = {
            OpenIA: preferredProvider === "OpenAI",
            Gemini: preferredProvider === "Gemini"
        };
        localStorage.setItem("userPreference", JSON.stringify(preference));
    }, [preferredProvider]);

    // On component mount, fetch the saved preferences from the backend API
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/getPreferences`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                    // Update provider based on the returned data
                    setPreferredProvider(data.OpenIA ? "OpenAI" : "Gemini");
                    setOpenIaKey(data.OpenIaKey || "");
                    setGeminiKey(data.GeminiKey || "");
                    setDiscordWebhookUrl(data.DISCORD_WEBHOOK_URL || "");
                    setTelegramChatId(data.TELEGRAM_CHAT_ID || "");
                }
            })
            .catch((err) => console.error("Error fetching preferences:", err));
    }, []);
    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#111112", color: "#fff", overflow: "hidden", width: "100%", flexGrow: 1 }}>
            {/* Background Image */}

            {/* Content */}
            <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: isMobile ? "column" : "row", height: "100%" }}>
                {/* Main Content */}
                <BackgroundImage />

                <Box sx={{ mt: 5, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>

                    {/* ✅ Desktop: Show All Components */}
                    {!isMobile ? (
                        <>
                            <Announcement
                                text={text}
                                setText={setText}
                                inputRef={inputRef}
                                _id={_id}
                            />
                            <Toolbar onSubmit={handleSubmit} onEmojiSelect={handleEmojiSelect} submittedText={submittedText}
                                setSubmittedText={setSubmittedText}
                                discordText={discordText}
                                setDiscordText={setDiscordText}
                                twitterText={twitterText}
                                setTwitterText={setTwitterText}
                                telegramText={telegramText}
                                setTelegramText={setTelegramText}
                                _id={_id}
                                setId={setId}
                                text={text}
                                setText={setText} setAi={setAi} />

                            <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", width: "100%", mt: 4 }}>

                                <TwitterBlock ai={ai} submittedText={twitterText ? twitterText : text} _id={_id} onSubmit={handleSubmit} />
                                <TelegramBlock ai={ai} submittedText={telegramText ? telegramText : text} _id={_id} onSubmit={handleSubmit} />
                                <DiscordBlock ai={ai} submittedText={discordText ? discordText : text} _id={_id} onSubmit={handleSubmit} />

                            </Box>
                        </>
                    ) : (
                        <>
                            {activeSection === "drafts" && (
                                <>
                                    <Announcement
                                        text={text}
                                        setText={setText}
                                        inputRef={inputRef}
                                        _id={_id}

                                    />
                                    <Toolbar submittedText={submittedText} onSubmit={handleSubmit} onEmojiSelect={handleEmojiSelect} setSubmittedText={setSubmittedText}
                                        discordText={discordText}
                                        setDiscordText={setDiscordText}
                                        twitterText={twitterText}
                                        setTwitterText={setTwitterText}
                                        telegramText={telegramText}
                                        setTelegramText={setTelegramText}
                                        _id={_id}
                                        setId={setId}
                                        text={text}
                                        setText={setText} setAi={setAi} />
                                </>
                            )}
                            {activeSection === "discord" && <DiscordBlock ai={ai} submittedText={discordText} _id={_id} onSubmit={handleSubmit} />}
                            {activeSection === "twitter" && <TwitterBlock ai={ai} submittedText={twitterText} _id={_id} onSubmit={handleSubmit} />}
                            {activeSection === "telegram" && <TelegramBlock ai={ai} submittedText={telegramText} _id={_id} onSubmit={handleSubmit} />}
                        </>
                    )}
                </Box>
            </Box>

            {/* ✅ Pass `activeSection` to BottomActionBar */}
            {isMobile && <BottomActionBar activeSection={activeSection} setActiveSection={setActiveSection} _id={_id} />}

            {/* Login Modal */}
            <LoginModal open={open} handleClose={handleClose} />
        </Box>
    );
}
