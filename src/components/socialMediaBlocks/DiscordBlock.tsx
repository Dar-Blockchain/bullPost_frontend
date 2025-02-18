import React from "react";
import { Box, Typography, Switch } from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports"; // Discord icon
import Toolbar from "@/pages/bullpost/components/Toolbar";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const DiscordBlock: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect mobile view

    return (
        <>
            <Box
                sx={{
                    flex: 1,
                    backgroundColor: "#111112",
                    p: 2,
                    border: "1px solid #3C3C3C",
                    textAlign: "center",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <SportsEsportsIcon fontSize="large" sx={{ color: "#5865F2" }} />
                    <Switch color="warning" />
                </Box>
                <Box sx={{ textAlign: "center", width: "100%", padding: 4, mt: 2 }}>
                    <Typography sx={{ fontSize: "14px", color: "#8F8F8F" }}>
                        This would have UI elements specific to Discord.
                    </Typography>
                    <Typography sx={{ fontSize: "14px", color: "#8F8F8F", mt: 1 }}>
                        We have now moved from our private Beta phase into public, onboarding new users.
                    </Typography>
                    <Typography sx={{ fontSize: "14px", color: "#8F8F8F", mt: 1 }}>
                        Please continue to share bugs with the team!
                    </Typography>
                </Box>
            </Box>

            {/* ✅ Only Show Toolbar in Mobile */}
            {isMobile && <Toolbar />}
        </>
    );
};

export default DiscordBlock;
