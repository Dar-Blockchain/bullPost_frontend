import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Divider,
    Input,
    Button
} from '@mui/material';
import { toast } from "react-toastify";

interface ConnectModalProps {
    open: boolean;
    onClose: () => void;
    platform: string;
}

const ConnectModal: React.FC<ConnectModalProps> = ({ open, onClose, platform }) => {
    const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
    const [telegramChatId, setTelegramChatId] = useState("");
    const handleSave = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Retrieve existing preferences from "userPreference"
        const storedPref = localStorage.getItem("userPreference");
        const pref = storedPref ? JSON.parse(storedPref) : {};

        // Update the preference object with Discord and Telegram data directly
        const updatedPref = {
            ...pref,
            DISCORD_WEBHOOK_URL: discordWebhookUrl ? discordWebhookUrl : pref.DISCORD_WEBHOOK_URL,
            TELEGRAM_CHAT_ID: telegramChatId ? telegramChatId : pref.TELEGRAM_CHAT_ID,
        };

        // Save updated preferences back to "userPreference"
        localStorage.setItem("userPreference", JSON.stringify(updatedPref));
        console.log("Local preferences saved:", updatedPref);

        // Build request body with non-empty keys only
        let requestBody: any = {};
        if (discordWebhookUrl.trim() !== "") {
            requestBody.DISCORD_WEBHOOK_URL = discordWebhookUrl;
        }
        if (telegramChatId.trim() !== "") {
            requestBody.TELEGRAM_CHAT_ID = telegramChatId;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/updatePreferences`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestBody),
                }
            );
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

    // Common styles for input elements
    const inputStyles = {
        width: '710px',
        height: '40px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        padding: '10px',
        backgroundColor: '#171717',
        '& input': { color: '#fff' }
    };

    return (
        <Dialog open={open} onClose={onClose}
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: '#171717',
                    color: '#555555',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden',
                },
            }}>
            <DialogContent sx={{
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
            }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* Discord Webhook URL Section */}
                    {platform === "discord" && (
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                DISCORD WEBHOOK URL
                            </Typography>
                            <Divider sx={{ mb: 2, borderColor: '#444' }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Input
                                    value={discordWebhookUrl}
                                    onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                                    placeholder="Enter Discord Webhook URL"
                                    sx={inputStyles}
                                />
                            </Box>
                        </Box>
                    )}
                    {/* Telegram Chat ID Section */}
                    {platform === "telegram" && (
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                TELEGRAM CHAT ID
                            </Typography>
                            <Divider sx={{ mb: 2, borderColor: '#444' }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Input
                                    value={telegramChatId}
                                    onChange={(e) => setTelegramChatId(e.target.value)}
                                    placeholder="Enter Telegram Chat ID"
                                    sx={inputStyles}
                                />
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{
                backgroundColor: '#101010',
                py: 2,
                px: 3,
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{
                            backgroundColor: '#FFB300',
                            color: '#000',
                            '&:hover': { backgroundColor: '#e6ac00' }
                        }}
                    >
                        Save Data
                    </Button>
                    <Button onClick={onClose} sx={{
                        backgroundColor: 'grey', marginLeft: '10px',
                        color: 'white',
                    }}>
                        Close
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default ConnectModal;
