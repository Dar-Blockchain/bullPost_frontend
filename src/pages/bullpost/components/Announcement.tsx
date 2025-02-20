import React, { useState } from "react";
import { Box, TextField } from "@mui/material";

const Announcement: React.FC = () => {
  const [announcement, setAnnouncement] = useState(
    "We have now moved from our private Beta phase into public, onboarding new users and taking wider feedback.\n\nPlease continue to share bugs you find with the team!"
  );

  return (
    <Box
      sx={{
        textAlign: "start",
        width: { xs: "90%", sm: "80%", md: "50%" },
        borderRadius: "10px",
      }}
    >
      <TextField
        fullWidth
        multiline
        rows={4} // ✅ Keep height similar to original text
        variant="outlined"
        value={announcement}
        onChange={(e) => setAnnouncement(e.target.value)}
        sx={{
          textarea: { color: "#fff", textAlign: "center", fontSize: "14px" },
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            "& fieldset": { borderColor: "#333" },
            "&:hover fieldset": { borderColor: "#444" },
          },
        }}
      />
    </Box>
  );
};

export default Announcement;
