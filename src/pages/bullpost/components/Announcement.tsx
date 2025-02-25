import React, { useEffect } from "react";
import { TextField, useTheme, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface AnnouncementProps {
  text: string;
  setText: (value: string) => void;
}

const Announcement: React.FC<AnnouncementProps> = ({ text, setText }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  // Get the selected announcement from the Redux slice
  const selectedAnnouncement = useSelector(
    (state: RootState) => state.posts.selectedAnnouncement
  );

  // If a selected announcement exists, update the text automatically.
  useEffect(() => {
    console.log("Selected Announcement:", selectedAnnouncement);
    if (selectedAnnouncement && selectedAnnouncement.length > 0) {
      // For example, take the first selected announcement's prompt
      setText(selectedAnnouncement[0].prompt);
    }
  }, [selectedAnnouncement, setText]);

  return (
    <TextField
      fullWidth
      multiline
      rows={isMobile ? 6 : 4} // Increased rows for mobile
      variant="outlined"
      placeholder="Write your announcement..."
      value={text}
      onChange={(e) => setText(e.target.value)}
      sx={{
        mt: isMobile ? "10px" : "0",
        width: isMobile ? "100%" : "50%", // Ensures it takes full width on mobile
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
