import React, { useState } from "react";
import { Box, IconButton, Popover } from "@mui/material";
import MoodOutlinedIcon from "@mui/icons-material/MoodOutlined";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import EmojiPicker from "emoji-picker-react";

interface ToolbarProps {
  submittedText: string;
  onSubmit: () => void;
  onEmojiSelect: (emoji: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ submittedText, onSubmit, onEmojiSelect }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenEmojiPicker = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseEmojiPicker = () => {
    setAnchorEl(null);
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    onEmojiSelect(emojiData.emoji);
    handleCloseEmojiPicker();
  };

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
    </Box>
  );
};

export default Toolbar;
