import React, { useEffect, useState } from "react";
import { Box, IconButton, Popover } from "@mui/material";
import MoodOutlinedIcon from "@mui/icons-material/MoodOutlined";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import EmojiPicker from "emoji-picker-react";
import CampaignIcon from '@mui/icons-material/Campaign';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { toast } from "react-toastify";
import Tooltip from "@mui/material/Tooltip";

import { fetchPostsByStatus, setSelectedAnnouncement } from "@/store/slices/postsSlice";
interface ToolbarProps {
  text: string;
  setText: (value: string) => void;
  submittedText: string;
  onSubmit: () => void;
  onEmojiSelect: (emoji: string) => void;
  setSubmittedText: (value: string) => void;
  discordText: string;
  setDiscordText: (value: string) => void;
  twitterText: string;
  setTwitterText: (value: string) => void;
  telegramText: string;
  setTelegramText: (value: string) => void;
  _id: string;
  setId: (value: string) => void;
  setAi: (value: boolean) => void;

}


const Toolbar: React.FC<ToolbarProps> = ({ text,
  setText, submittedText, onSubmit, onEmojiSelect, setSubmittedText,
  setDiscordText,
  setTwitterText,
  setTelegramText,
  setId, setAi }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  const handleOpenEmojiPicker = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const selectedAnnouncement = useSelector((state: RootState) => state.posts.selectedAnnouncement);

  useEffect(() => {
    if (selectedAnnouncement && selectedAnnouncement.length > 0) {
      setText(selectedAnnouncement[0].prompt);
    }
  }, [selectedAnnouncement, setText]);
  const handleCloseEmojiPicker = () => {
    setAnchorEl(null);
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    onEmojiSelect(emojiData.emoji);
    handleCloseEmojiPicker();
  };
  const onManualGenerate = async () => {
    setAi(false)
    console.log("Input lost focus. Current announcement:", submittedText);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}posts/addPost`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`

          },
          body: JSON.stringify({

            prompt: text,
            twitter: text,
            telegram: text,
            discord: text,

          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSubmittedText(data.prompt);
        setDiscordText(data.discord);
        setTwitterText(data.twitter);
        setTelegramText(data.telegram);
        setId(data._id);
        dispatch(fetchPostsByStatus("draft"));
        dispatch(setSelectedAnnouncement([]));
        console.log("Post added successfully", data);
        toast.success("Post added successfully!", { position: "top-right" });
      } else {
        console.error("Failed to add post", data.error);
        toast.error(`Failed to add post: ${data.error || "Unknown error"}`, {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error adding post:", error);
      toast.error("Error adding post!", { position: "top-right" });
    }
  };
  const storedPreference = typeof window !== "undefined" ? localStorage.getItem("userPreference") : null;
  const preference = storedPreference ? JSON.parse(storedPreference) : {};
  // Determine provider name: if OpenIA is true, then use "OpenAI", otherwise "Gemini"
  const provider = preference?.OpenIA ? "OpenAI" : "Gemini";
  return (
    <Box sx={{ display: "flex", mt: 2, gap: 2, backgroundColor: "#181818", p: 1, borderRadius: "30px", border: "1px solid #555" }}>
      <IconButton sx={{ color: "#aaa" }} onClick={handleOpenEmojiPicker}>
        <MoodOutlinedIcon fontSize="small" />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCloseEmojiPicker}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </Popover>
      <IconButton sx={{ color: "#aaa" }}>
        <InsertPhotoOutlinedIcon fontSize="small" />
      </IconButton>

      <IconButton sx={{ color: "#aaa" }} onClick={onSubmit}>
        <AutoAwesomeOutlinedIcon fontSize="small" />
      </IconButton>
      <Box
        sx={{
          width: "1px",
          backgroundColor: "#555",
        }}
      />
      <Tooltip title="Generate post manually (without AI assistance)" arrow>
        <IconButton sx={{ color: "#aaa" }} onClick={onManualGenerate}>
          <CampaignIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Toolbar;
