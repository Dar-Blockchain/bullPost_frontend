import React from "react";
import { Box, TextField, useTheme, useMediaQuery } from "@mui/material";

interface AnnouncementProps {
  text: string;
  setText: (value: string) => void;
}

const Announcement: React.FC<AnnouncementProps> = ({ text, setText }) => {
  const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  return (
    <TextField
      fullWidth
      multiline
      rows={isMobile ? 6 : 4} // ✅ Increased rows for mobile
      variant="outlined"
      placeholder="Write your announcement..."
      value={text}
      onChange={(e) => setText(e.target.value)}
      sx={{
        mt: isMobile ? "10px" : "0",
        width: isMobile ? "100%" : "50%", // ✅ Ensures it takes full width

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
