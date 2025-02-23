import React, { useState } from "react";
import { Box, IconButton, Popover } from "@mui/material";
import MoodOutlinedIcon from "@mui/icons-material/MoodOutlined";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import EmojiPicker from "emoji-picker-react"; // ✅ Import Emoji Picker
interface ToolbarProps {
    submittedText: string; // ✅ Accept submitted text
    onSubmit: () => void; // ✅ Function to handle API call
}
const Toolbar: React.FC<ToolbarProps> = ({ submittedText, onSubmit }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // ✅ Open Emoji Picker when clicking the Mood icon
    const handleOpenEmojiPicker = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    // ✅ Close the Emoji Picker
    const handleCloseEmojiPicker = () => {
        setAnchorEl(null);
    };

    // ✅ Handle Emoji Selection
    const handleEmojiClick = (emojiData: { emoji: string }) => {
        console.log("Selected Emoji:", emojiData.emoji); // Replace this with your logic
        handleCloseEmojiPicker(); // Close picker after selecting an emoji
    };

    return (
        <Box sx={{ display: "flex", mt: 10, gap: 2, backgroundColor: "#181818", p: 1, borderRadius: "30px", border: "1px solid #555" }}>
            {/* ✅ Mood (Emoji Picker) Button */}
            <IconButton sx={{ color: "#aaa" }} onClick={handleOpenEmojiPicker}>
                <MoodOutlinedIcon fontSize="small" />
            </IconButton>

            {/* ✅ Emoji Picker Popup */}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleCloseEmojiPicker}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <EmojiPicker onEmojiClick={handleEmojiClick} />
            </Popover>

            {/* Other Toolbar Buttons */}
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
