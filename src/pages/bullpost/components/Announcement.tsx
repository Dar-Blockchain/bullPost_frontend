import React, { useEffect } from "react";
import { TextField, useTheme, useMediaQuery } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { toast } from "react-toastify";
import { fetchPostsByStatus, setSelectedAnnouncement } from "@/store/slices/postsSlice";

interface AnnouncementProps {
  text: string;
  setText: (value: string) => void;
  inputRef?: React.Ref<HTMLInputElement | HTMLTextAreaElement>;
  submittedText: string;
  setSubmittedText: (value: string) => void;
  discordText: string;
  setDiscordText: (value: string) => void;
  twitterText: string;
  setTwitterText: (value: string) => void;
  telegramText: string;
  setTelegramText: (value: string) => void;
  _id: string;
  setId: (value: string) => void;
}

const Announcement: React.FC<AnnouncementProps> = ({ text, setText, inputRef, submittedText,
  setSubmittedText,
  discordText,
  setDiscordText,
  twitterText,
  setTwitterText,
  telegramText,
  setTelegramText,
  _id,
  setId, }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const dispatch = useDispatch<AppDispatch>();

  const selectedAnnouncement = useSelector((state: RootState) => state.posts.selectedAnnouncement);

  useEffect(() => {
    if (selectedAnnouncement && selectedAnnouncement.length > 0) {
      setText(selectedAnnouncement[0].prompt);
    }
  }, [selectedAnnouncement, setText]);

  const handleBlur = async () => {
    console.log("Input lost focus. Current announcement:", text);
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

  return (
    <TextField
      fullWidth
      multiline
      rows={isMobile ? 6 : 4}
      variant="outlined"
      placeholder="Write your announcement..."
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      inputRef={inputRef}
      sx={{
        mt: isMobile ? "10px" : "0",
        width: isMobile ? "100%" : "50%",
        textarea: {
          color: "#fff",
          textAlign: "center",
          fontSize: "14px",
        },
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px",
          "& fieldset": { borderColor: "#333" },
          "&:hover fieldset": { borderColor: "#444" },
        },
      }}
    />
  );
};

export default Announcement;
