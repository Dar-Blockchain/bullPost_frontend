// src/components/ApiKeysTab.tsx
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Divider,
    Input,
    Button,
    Select,
    MenuItem
} from '@mui/material';

const ApiKeysTab: React.FC = () => {
    // State for the preferred provider, defaulting to "Gemini"
    const [preferredProvider, setPreferredProvider] = useState("Gemini");

    // States for additional keys (with default values based on your sample)
    const [openIaKey, setOpenIaKey] = useState("");
    const [discordWebhookUrl, setDiscordWebhookUrl] = useState(
        "");
    const [telegramChatId, setTelegramChatId] = useState("");
    // For simplicity, assume these booleans are fixed (or could be enhanced with toggles)
    const twitterEnabled = true;
    const telegramEnabled = true;
    const discordEnabled = true;
    // Assume a default user id (in a real app you might pull this from auth data)

    const handleSave = async () => {
        // Build the provider preference based on the dropdown selection.
        const preference = {
            OpenIA: preferredProvider === "OpenAI",
            Gemini: preferredProvider === "Gemini"
        };

        // Retrieve existing user settings from localStorage (if any)
        const userStr = localStorage.getItem("user");
        const userSettings = userStr ? JSON.parse(userStr) : {};

        // Update the Preference property based on the selected provider
        userSettings.Preference = preference;
        localStorage.setItem("user", JSON.stringify(userSettings));
        console.log("Local preferences saved:", userSettings);

        // Build the request body matching your sample JSON
        const requestBody = {
            twitter: twitterEnabled,
            telegram: telegramEnabled,
            discord: discordEnabled,
            OpenIA: preference.OpenIA,
            Gemini: preference.Gemini,
            DISCORD_WEBHOOK_URL: discordWebhookUrl,
            TELEGRAM_CHAT_ID: telegramChatId,
            OpenIaKey: openIaKey,
            user: userSettings._id
        };


        try {
            const response = await fetch("http://localhost:5000/preferences/addPreferences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
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
            {/* Dropdown for Preferred Provider */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Preferred Provider
                </Typography>
                <Select
                    value={preferredProvider}
                    onChange={(e) => setPreferredProvider(e.target.value)}
                    size="small"
                    sx={{
                        backgroundColor: '#171717',
                        color: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        '& .MuiSelect-select': { padding: '10px' }
                    }}
                >
                    <MenuItem value="Gemini">Gemini</MenuItem>
                    <MenuItem value="OpenAI">OpenAI</MenuItem>
                </Select>
            </Box>

            {/* OpenAI Section */}
            <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    OpenAI
                </Typography>
                <Divider sx={{ mb: 2, borderColor: '#444' }} />
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                            GPT-4o
                        </Typography>
                        <Input
                            value={openIaKey}
                            onChange={(e) => setOpenIaKey(e.target.value)}
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
            </Box>

            {/* Gemini Section */}
            <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    Gemini
                </Typography>
                <Divider sx={{ mb: 2, borderColor: '#444' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                        Gemini API Key
                    </Typography>
                    <Input
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
            <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    Anthropic
                </Typography>
                <Divider sx={{ mb: 2, borderColor: '#444' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                        Sonnet 3.5
                    </Typography>
                    <Input
                        sx={{
                            width: '710px',
                            height: '40px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            padding: '10px',
                            backgroundColor: '#171717',
                            '& input': { color: '#fff' },
                        }}
                    />
                </Box>
            </Box>

            {/* Deepseek */}
            <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    Deepseek
                </Typography>
                <Divider sx={{ mb: 2, borderColor: '#444' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                        V3
                    </Typography>
                    <Input
                        sx={{
                            width: '710px',
                            height: '40px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            padding: '10px',
                            backgroundColor: '#171717',
                            '& input': { color: '#fff' },
                        }}
                    />
                </Box>
            </Box>
            {/* Additional sections (Anthropic, Deepseek, etc.) can be added similarly */}

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

export default ApiKeysTab;
