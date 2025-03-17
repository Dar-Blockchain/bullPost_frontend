import React, { useEffect } from "react";
import { TextField, useTheme, useMediaQuery, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

interface AnnouncementProps {
  text: string;
  setText: (value: string) => void;
  inputRef?: React.Ref<HTMLInputElement | HTMLTextAreaElement>;
  _id: string;
}

const Announcement: React.FC<AnnouncementProps> = ({ text, setText, inputRef, _id }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const selectedAnnouncement = useSelector((state: RootState) => state.posts.selectedAnnouncement);

  useEffect(() => {
    if (selectedAnnouncement && selectedAnnouncement.length > 0) {
      setText(selectedAnnouncement[0].prompt);
    }
  }, [selectedAnnouncement, setText]);

  const dispatch = useDispatch<AppDispatch>();

  const postId = selectedAnnouncement && selectedAnnouncement.length > 0
    ? selectedAnnouncement[0]._id
    : _id;

  return (
    <>
      <Typography
        variant="caption"
        sx={{
          mb: 1,
          mt: isMobile ? "20px" : "0",
          color: "grey",
          textAlign: "start",
          width: isMobile ? "100%" : "50%",
        }}
      >
        {postId ? "Your post is saved" : "Your post is not saved"}
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={isMobile ? 6 : 4}
        variant="outlined"
        placeholder="Write your announcement..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        inputRef={inputRef}
        sx={{
          mt: isMobile ? "10px" : "0",
          width: isMobile ? "100%" : "50%",
          // Style applied directly to the textarea element
          textarea: {
            color: "#fff",
            textAlign: "start",
            fontSize: "14px",
            resize: "vertical", // Enable vertical resizing by the user
          },
          "& .MuiOutlinedInput-input": {
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#FFB300",
              borderRadius: "3px",
            },
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            "& fieldset": { borderColor: "#333" },
            "&:hover fieldset": { borderColor: "#444" },
          },
        }}
      />
    </>
  );
};

export default Announcement;
