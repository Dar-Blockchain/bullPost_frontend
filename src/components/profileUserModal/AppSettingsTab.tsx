// src/components/AppSettingsTab.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Divider,
    Input,
    Button,
    Select,
    MenuItem
} from '@mui/material';

const AppSettingsTab: React.FC = () => {
    const storedPreference = localStorage.getItem("userPreference");
    const initialProvider = storedPreference
        ? JSON.parse(storedPreference).OpenIA
            ? "OpenAI"
            : "Gemini"
        : "Gemini";

    const [preferredProvider, setPreferredProvider] = useState(initialProvider);

    const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
    const [telegramChatId, setTelegramChatId] = useState("");

    useEffect(() => {
        const preference = {
            OpenIA: preferredProvider === "OpenAI",
            Gemini: preferredProvider === "Gemini"
        };
        localStorage.setItem("userPreference", JSON.stringify(preference));
    }, [preferredProvider]);

    // On component mount, fetch the saved preferences from the backend API
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/getPreferences`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                   
                    setDiscordWebhookUrl(data.DISCORD_WEBHOOK_URL || "");
                    setTelegramChatId(data.TELEGRAM_CHAT_ID || "");
                }
            })
            .catch((err) => console.error("Error fetching preferences:", err));
    }, []);

    const handleSave = async () => {
        // Build the provider preference based on the dropdown selection.
        const preference = {
            OpenIA: preferredProvider === "OpenAI",
            Gemini: preferredProvider === "Gemini"
        };
        const token = localStorage.getItem("token");

        // Optionally merge this with your user object.
        const userStr = localStorage.getItem("user");
        const userSettings = userStr ? JSON.parse(userStr) : {};
        userSettings.Preference = preference;
        localStorage.setItem("user", JSON.stringify(userSettings));
        console.log("Local preferences saved:", userSettings);

        // Build the request body and only include keys if they have non-empty values.
        const requestBody: any = {
            OpenIA: preference.OpenIA,
            Gemini: preference.Gemini
        };

        if (discordWebhookUrl.trim() !== "") {
            requestBody.DISCORD_WEBHOOK_URL = discordWebhookUrl;
        }
        if (telegramChatId.trim() !== "") {
            requestBody.TELEGRAM_CHAT_ID = telegramChatId;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/updatePreferences`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                console.error("Failed to save preferences to backend");
                return;
            }
            const data = await response.json();
            console.log("Preferences saved to backend:", data);
        } catch (error) {
            console.error("Error saving preferences:", error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>


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
                        sx={{
                            width: '710px',
                            height: '40px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            padding: '10px',
                            backgroundColor: '#171717',
                            '& input': { color: '#fff' }
                        }}
                    />
                </Box>
            </Box>

            {/* Telegram Section */}
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
                        sx={{
                            width: '710px',
                            height: '40px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            padding: '10px',
                            backgroundColor: '#171717',
                            '& input': { color: '#fff' }
                        }}
                    />
                </Box>
            </Box>

            {/* Anthropic Section */}


            {/* Deepseek Section */}


            {/* Save Data Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
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
            </Box>
        </Box>
    );
};

export default AppSettingsTab;
