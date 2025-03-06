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

const ApiKeysTab: React.FC = () => {
    // Retrieve the stored preference from its own key (fallback to "Gemini" if not available)
    const storedPreference = localStorage.getItem("userPreference");
    const initialProvider = storedPreference
        ? JSON.parse(storedPreference).OpenIA
            ? "OpenAI"
            : "Gemini"
        : "Gemini";

    const [preferredProvider, setPreferredProvider] = useState(initialProvider);

    // States for additional keys (with default values)
    const [openIaKey, setOpenIaKey] = useState("");
    const [geminiKey, setGeminiKey] = useState("");
    const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
    const [telegramChatId, setTelegramChatId] = useState("");
    // For simplicity, assume these booleans are fixed
    const twitterEnabled = true;
    const telegramEnabled = true;
    const discordEnabled = true;

    // Common Input styles
    const inputStyles = {
        width: '710px',
        height: '40px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        padding: '10px',
        backgroundColor: '#171717',
        '& input': { color: '#fff' }
    };

    // When the provider changes, save it to its own localStorage key.
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
                    // Update provider based on the returned data
                    setPreferredProvider(data.OpenIA ? "OpenAI" : "Gemini");
                    setOpenIaKey(data.OpenIaKey || "");
                    setGeminiKey(data.GeminiKey || "");
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
        if (openIaKey.trim() !== "") {
            requestBody.OpenIaKey = openIaKey;
        }
        if (geminiKey.trim() !== "") {
            requestBody.GeminiKey = geminiKey;
        }
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
                            sx={inputStyles}
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
                        Gemini
                    </Typography>
                    <Input
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        sx={inputStyles}
                    />
                </Box>
            </Box>

            {/* Anthropic Section */}
            <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    Anthropic
                </Typography>
                <Divider sx={{ mb: 2, borderColor: '#444' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                        Sonnet
                    </Typography>
                    <Input
                        sx={inputStyles}
                    />
                </Box>
            </Box>

            {/* Deepseek Section */}
            {/* <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    Deepseek
                </Typography>
                <Divider sx={{ mb: 2, borderColor: '#444' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                        V3
                    </Typography>
                    <Input
                        sx={inputStyles}
                    />
                </Box>
            </Box> */}

            {/* Discord & Telegram Section (if needed) */}
            {/* <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    DISCORD_WEBHOOK_URL 👍 😂 ❤️
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
            </Box> */}

            {/* <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                    TELEGRAM_CHAT_ID
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
            </Box> */}

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
