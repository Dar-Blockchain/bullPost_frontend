import React from "react";
import { Box, Typography } from "@mui/material";

const Announcement: React.FC = () => {
    return (
        <Box sx={{ textAlign: "center", width: { xs: "90%", sm: "80%", md: "50%" }, p: 2, borderRadius: "10px" }}>
            <Typography sx={{ fontSize: "14px", mb: 2 }}>
                We have now moved from our private Beta phase into public, onboarding new users and taking wider feedback.
            </Typography>
            <Typography sx={{ fontSize: "14px" }}>
                Please continue to share bugs you find with the team!
            </Typography>
        </Box>
    );
};

export default Announcement;
