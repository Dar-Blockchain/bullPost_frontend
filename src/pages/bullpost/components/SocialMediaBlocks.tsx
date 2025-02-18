import React from "react";
import { Box } from "@mui/material";
import TwitterBlock from "@/components/socialMediaBlocks/TwitterBlock";
import TelegramBlock from "@/components/socialMediaBlocks/TelegramBlock";
import DiscordBlock from "@/components/socialMediaBlocks/DiscordBlock";


interface Props {
    isMobile: boolean;
}

const SocialMediaBlocks: React.FC<Props> = ({ isMobile }) => {
    return (
        <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", width: "100%", mt: 4 }}>
            <TwitterBlock />
            <TelegramBlock />
            <DiscordBlock />
        </Box>
    );
};

export default SocialMediaBlocks;
