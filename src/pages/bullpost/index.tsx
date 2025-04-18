import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
  Alert,
} from "@mui/material";
import Announcement from "./components/Announcement";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginModal from "@/components/loginModal/LoginModal";
import BottomActionBar from "./components/BottomActionBar";
import DiscordBlock from "@/components/socialMediaBlocks/DiscordBlock";
import TwitterBlock from "@/components/socialMediaBlocks/TwitterBlock";
import TelegramBlock from "@/components/socialMediaBlocks/TelegramBlock";
import BackgroundImage from "./components/BackgroundImage";
import { fetchPostsByStatus, setSelectedAnnouncement } from "@/store/slices/postsSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import Toolbar from "./components/Toolbar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { loadPreferences } from "@/store/slices/accountsSlice";
interface UserPreference {
  OpenIA?: boolean;
  Gemini?: boolean;
  DISCORD_WEBHOOK_URL?: string;
  TELEGRAM_CHAT_ID?: string;
  twitterConnect?: string;
  Discord?: boolean;
  Twitter?: boolean;
  Telegram?: boolean
}
export default function BullPostPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submittedText, setSubmittedText] = useState("");
  const [discordText, setDiscordText] = useState("");
  const [twitterText, setTwitterText] = useState("");
  const [telegramText, setTelegramText] = useState("");
  const [_id, setId] = useState("");
  const [ai, setAi] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleClose = () => setOpen(false);
  const [text, setText] = useState(
    "No announcement yet...");
  // Load preferences via Redux on mount
  const preferences = useSelector((state: RootState) => state.accounts.preferences);

  useEffect(() => {
    dispatch(loadPreferences());
  }, [dispatch]);
  // Preference settings and keys state (declared once)
  const initialProviderPref = preferences
    ? (preferences.OpenIA ? "OpenAI" : "Gemini")
    : "Gemini";
  const [preferredProvider, setPreferredProvider] = useState(initialProviderPref);
  const [openIaKey, setOpenIaKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
  const [discordServerName, setDiscordServerName] = useState("");
  const [telegramGroupName, setTelegramGroupName] = useState("");
  const [TwitterName, setTwitterName] = useState("");
  const [TwitterRefreshName, setTwitterRefreshName] = useState("");

  const [telegramChatId, setTelegramChatId] = useState("");
  const [twitterConnect, setTwitterConnect] = useState("");

  const [initialized, setInitialized] = useState(false);
  const selectedAnnouncement = useSelector((state: RootState) => state.posts.selectedAnnouncement);
  const postId = selectedAnnouncement.length > 0 ? selectedAnnouncement[0]._id : "";
  useEffect(() => {
    if (preferences && !initialized) {
      setPreferredProvider(preferences.OpenIA ? "OpenAI" : "Gemini");
      setOpenIaKey(preferences.OpenIaKey || "");
      setGeminiKey(preferences.GeminiKey || "");
      setDiscordWebhookUrl(preferences.DISCORD_WEBHOOK_URL || "");
      setTelegramChatId(preferences.TELEGRAM_CHAT_ID || "");
      setTwitterConnect(preferences.refresh_token || "");

      setDiscordServerName(preferences.Discord_Server_Name || "");
      setTwitterName(preferences.twitter_Name || "");
      setTelegramGroupName(preferences.TELEGRAM_GroupName || "");
      setInitialized(true);
    }
  }, [preferences, initialized]);
  // Compute whether the user's profile is incomplete
  const profileIncomplete = useMemo(() => {
    const incomplete = !(
      ((preferences.OpenIaKey && preferences.OpenIaKey.trim() !== "") || (preferences.GeminiKey && preferences.GeminiKey.trim() !== "")) &&
      (preferences.DISCORD_WEBHOOK_URL && preferences.DISCORD_WEBHOOK_URL.trim() !== "") &&
      (preferences.TELEGRAM_CHAT_ID && preferences.TELEGRAM_CHAT_ID.trim() !== "")
    );
    console.log("Profile incomplete:", incomplete, {
      preferences
    });
    return incomplete;
  }, [preferences]);
  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.warn("⚠️ Please enter text before submitting!", { position: "top-right" });
      return;
    }
    setAi(true);
    setIsLoading(true);
    const token = localStorage.getItem("token");


    let apiUrl = "";
    if (preferences?.OpenIA === true) {
      apiUrl = token
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}generationOpenIA/generate`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}generationGemini/generateForVisitor`;
    } else if (preferences?.Gemini === true) {
      apiUrl = token
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}generationGemini/generatePlatformPost`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}generationGemini/generateForVisitor`;
    } else {
      apiUrl = token
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}generationGemini/generatePlatformPost`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}generationGemini/generateForVisitor`;
    }

    try {
      const bodyPayload = {
        prompt: text,
        platforms: ["twitter", "discord", "telegram"],
        // if we're using OpenIA *and* have an existing id, include it
        ...(postId ? { postId: postId } : {}),
      };
      console.log(_id, bodyPayload, "here a data")
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        // body: JSON.stringify({ prompt: text, platforms: ["twitter", "discord", "telegram"] }),
        body: JSON.stringify(bodyPayload),
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
        dispatch(fetchPostsByStatus({ status: "drafts", page: 1, limit: 10 }));
        dispatch(setSelectedAnnouncement([data.newPost]));
        toast.success("✅ Post generated successfully!", { position: "top-right" });
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("❌ Failed to submit text!", { position: "top-right" });
    } finally {
      setIsLoading(false);
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const [activeSection, setActiveSection] = useState<
    "calendar" | "drafts" | "discord" | "twitter" | "telegram" | "post"
  >("drafts");

  const handleEmojiSelect = (emoji: string) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart || 0;
      const end = inputRef.current.selectionEnd || 0;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + emoji + after;
      setText(newText);
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
  const router = useRouter();
  const [preference, setPreference] = useState<UserPreference>({});


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const username = params.get("username");
    // Check the localStorage flag
    const addAccountFlag = localStorage.getItem("addAccount");

    // If we don’t have a refresh_token, stop everything.
    if (!refresh_token) {
      console.warn("No refresh token found in URL. Exiting...");
      return;
    }

    // Optionally store the access_token if it exists
    if (access_token) {
      localStorage.setItem("twitterAccessToken", access_token);
    }
    localStorage.setItem("twitterRefreshToken", refresh_token);

    // Retrieve the user's main token
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No main token found. Exiting...");
      return;
    }

    // Decide which endpoint to call
    if (addAccountFlag) {
      // "Add new account" endpoint
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/addTwitterAccount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          refresh_token: refresh_token,
          username: username,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          toast.success("New account added successfully");
          localStorage.removeItem("addAccount");
          console.log("New Twitter account data:", data);
          router.push("/bullpost").then(() => window.location.reload());
        })
        .catch((error) => {
          console.error("Error adding new Twitter account:", error);
        });
    } else {
      // "Link existing account" endpoint
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/LinkTwitter`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          refresh_token, twitter_Name
            : username,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(username, 'here my new username')
          toast.success("Twitter linked successfully");
          console.log("Linked Twitter data:", data);
          router.push("/bullpost").then(() => window.location.reload());
        })
        .catch((error) => {
          console.error("Error linking Twitter:", error);
        });
    }
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        backgroundColor: "#111112",
        color: "#fff",
        overflowY: "auto",
        flexGrow: 1,
        "&::-webkit-scrollbar": {
          width: "1px",
          height: "1px",  // horizontal scrollbar height

        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#FFB300",
          borderRadius: "1px",
        },
      }}
    >
      {/* Background Image */}
      <BackgroundImage />

      {/* Sticky Alert */}
      {user && profileIncomplete && (
        <Box sx={{ position: "sticky", top: isMobile ? "60px" : 0, zIndex: 1100 }}>
          <Alert severity="error">
            Please complete your profile by adding your{" "}
            {preferredProvider === "OpenAI" ? "OpenAI" : "Gemini"} API key, Discord
            webhook URL, and Telegram Chat ID to generate and post your project.
          </Alert>
        </Box>
      )}

      {/* Main Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          height: "90%",
        }}
      >
        <Box
          sx={{
            mt: 5,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: isMobile ? 2 : 0,
          }}
        >
          {!isMobile ? (
            <>
              <Announcement text={text} setText={setText} inputRef={inputRef} _id={_id} />
              <Toolbar
                onSubmit={handleSubmit}
                onEmojiSelect={handleEmojiSelect}
                submittedText={submittedText}
                setSubmittedText={setSubmittedText}
                setDiscordText={setDiscordText}
                setTwitterText={setTwitterText}
                setTelegramText={setTelegramText}
                _id={_id}
                setId={setId}
                text={text}
                setText={setText}
                setAi={setAi}
                isLoading={isLoading}
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  width: "100%",
                  mt: 4,
                }}
              >
                <TwitterBlock
                  ai={ai}
                  submittedText={twitterText ? twitterText : text}
                  _id={_id}
                  onSubmit={handleSubmit}
                />
                <TelegramBlock
                  ai={ai}
                  submittedText={telegramText ? telegramText : text}
                  _id={_id}
                  onSubmit={handleSubmit}
                />
                <DiscordBlock
                  ai={ai}
                  submittedText={discordText ? discordText : text}
                  _id={_id}
                  onSubmit={handleSubmit}
                />
              </Box>
            </>
          ) : (
            <>
              {activeSection === "drafts" && (
                <>
                  <Announcement text={text} setText={setText} inputRef={inputRef} _id={_id} />
                  <Toolbar
                    submittedText={submittedText}
                    onSubmit={handleSubmit}
                    onEmojiSelect={handleEmojiSelect}
                    setSubmittedText={setSubmittedText}
                    setDiscordText={setDiscordText}
                    setTwitterText={setTwitterText}
                    setTelegramText={setTelegramText}
                    _id={_id}
                    setId={setId}
                    text={text}
                    setText={setText}
                    setAi={setAi}
                    isLoading={isLoading}
                  />
                </>
              )}
              {activeSection === "discord" && (
                <DiscordBlock ai={ai} submittedText={discordText} _id={_id} onSubmit={handleSubmit} />
              )}
              {activeSection === "twitter" && (
                <TwitterBlock ai={ai} submittedText={twitterText} _id={_id} onSubmit={handleSubmit} />
              )}
              {activeSection === "telegram" && (
                <TelegramBlock ai={ai} submittedText={telegramText} _id={_id} onSubmit={handleSubmit} />
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Bottom Action Bar for Mobile */}
      {isMobile && <BottomActionBar activeSection={activeSection} setActiveSection={setActiveSection} _id={_id} />}

      {/* Login Modal */}
      <LoginModal open={open} handleClose={handleClose} />
    </Box>
  );
}
