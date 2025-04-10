import React from "react";
import { Box } from "@mui/material";

const BackgroundImage: React.FC = () => {
    return (
        <Box
            sx={{
                position: "absolute",
                top: -100,
                left: 0,
                width: "100%",
                height: "30vh",
                backgroundImage: "url('/Ellipse 4.png')",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top center",
                zIndex: 0,
            }}
        />
    );
};

export default BackgroundImage;
