import React from "react";
import { Box, IconButton } from "@mui/material";
import MoodOutlinedIcon from "@mui/icons-material/MoodOutlined";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

const Toolbar: React.FC = () => {
    return (
        <Box sx={{ display: "flex", mt: 10, gap: 2, backgroundColor: "#181818", p: 1, borderRadius: "30px", border: "1px solid #555" }}>
            <IconButton sx={{ color: "#aaa" }}>
                <MoodOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton sx={{ color: "#aaa" }}>
                <InsertPhotoOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton sx={{ color: "#aaa" }}>
                <AutoAwesomeOutlinedIcon fontSize="small" />
            </IconButton>
        </Box>
    );
};

export default Toolbar;
