// src/components/ConnectModal.tsx
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Box,
    Typography,
    Divider,
    Input,
    Button,
} from "@mui/material";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";

interface ConnectModalProps {
    open: boolean;
    onClose: () => void;
    platform: string;
}

const ConnectModal: React.FC<ConnectModalProps> = ({ open, onClose, platform }) => {
    // For Discord, we need both a server name and a webhook URL.
    const [discordServer, setDiscordServer] = useState("");
    const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
    // For Telegram:
    const [telegramChatId, setTelegramChatId] = useState("");
    const [telegramGroupName, setTelegramGroupName] = useState("");

    const handleSave = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Retrieve existing preferences from localStorage
        const storedPref = localStorage.getItem("userPreference");
        const pref = storedPref ? JSON.parse(storedPref) : {};

        // Update local preferences
        let updatedPref = { ...pref };
        if (platform === "discord") {
            if (discordServer.trim() !== "") {
                updatedPref.groupName = discordServer;
            }
            if (discordWebhookUrl.trim() !== "") {
                updatedPref.webhookUrl = discordWebhookUrl;
            }
        } else if (platform === "telegram") {
            if (telegramChatId.trim() !== "") {
                updatedPref.TELEGRAM_CHAT_ID = telegramChatId;
            }
        }
        localStorage.setItem("userPreference", JSON.stringify(updatedPref));
        console.log("Local preferences saved:", updatedPref);

        // Build request body with non-empty keys only.
        let requestBody: any = {};
        if (platform === "discord") {
            if (discordServer.trim() !== "") {
                requestBody.Discord_Server_Name
                    = discordServer;
            }
            if (discordWebhookUrl.trim() !== "") {
                requestBody.DISCORD_WEBHOOK_URL = discordWebhookUrl;
            }
        } else if (platform === "telegram") {
            if (telegramGroupName.trim() !== "") {
                requestBody.TELEGRAM_GroupName = telegramGroupName;
            }
            if (telegramChatId.trim() !== "") {
                requestBody.TELEGRAM_CHAT_ID = telegramChatId;
            }
        }

        // Choose endpoint based on platform. For Discord, use the new endpoint.
        let endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/linkedToTelegram`;
        if (platform === "discord") {
            endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/linkedToDiscord`;
        }

        try {
            const response = await fetch(endpoint, {
                method: "PUT", // or POST if your API expects that for adding a new account
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                console.error("Failed to save preferences to backend");
                toast.error("❌ Failed to save preferences!", { position: "top-right" });
                return;
            }
            const data = await response.json();
            console.log("Preferences saved to backend:", data);
            toast.success("Preferences saved successfully!", { position: "top-right" });
            onClose();
        } catch (error) {
            console.error("Error saving preferences:", error);
            toast.error("❌ Error saving preferences!", { position: "top-right" });
        }
    };

    // Common styles for input elements (compact & transparent)
    const inputStyles = {
        width: '710px',
        height: '40px',
        borderRadius: '5px',
        border: '1px solid #FFB300',
        padding: '10px',
        backgroundColor: 'transparent',
        '& input': { color: '#fff' },
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: '#171717',
                    color: '#555555',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden',
                },
            }}
        >
            <DialogContent
                sx={{
                    backgroundColor: '#101010',
                    py: 2,
                    px: 3,
                    "&::-webkit-scrollbar": { width: "4px" },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#FFB300",
                        borderRadius: "3px",
                    },
                    backgroundImage: "url('/Ellipse 4.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "top",
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {platform === "discord" && (
                        <>
                            <Box>
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                    Discord Data                                </Typography>
                                <Divider sx={{ mb: 2, borderColor: '#444' }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Input
                                        value={discordServer}
                                        onChange={(e) => setDiscordServer(e.target.value)}
                                        placeholder="Enter Discord Server Name"
                                        sx={inputStyles}
                                    />

                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: "10px" }}>
                                    <Input
                                        value={discordWebhookUrl}
                                        onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                                        placeholder="Enter Discord Webhook URL"
                                        sx={inputStyles}
                                    />
                                </Box>
                            </Box>

                        </>
                    )}
                    {platform === "telegram" && (
                        <>
                            <Box>
                                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                    Telegram Data                                </Typography>

                                <Divider sx={{ mb: 2, borderColor: '#444' }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: "10px", mb: "10px" }}>
                                    <Input
                                        value={telegramGroupName}
                                        onChange={(e) => setTelegramGroupName(e.target.value)}
                                        placeholder="Enter Telegram Group Name"
                                        sx={inputStyles}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Input
                                        value={telegramChatId}
                                        onChange={(e) => setTelegramChatId(e.target.value)}
                                        placeholder="Enter Telegram Chat ID"
                                        sx={inputStyles}
                                    />
                                </Box>
                            </Box>

                        </>

                    )}
                </Box>
            </DialogContent>
            <DialogActions
                sx={{
                    backgroundColor: '#101010',
                    py: 2,
                    px: 3,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{
                            backgroundColor: '#FFB300',
                            color: '#000',
                            '&:hover': { backgroundColor: '#e6ac00' },
                        }}
                    >
                        Save Data
                    </Button>
                    <Button
                        onClick={onClose}
                        sx={{
                            backgroundColor: 'grey',
                            ml: "10px",
                            color: 'white',
                        }}
                    >
                        Close
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default ConnectModal;
