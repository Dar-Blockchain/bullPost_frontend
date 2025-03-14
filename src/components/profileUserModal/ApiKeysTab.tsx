import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Divider,
    Input,
    Button,
    Select,
    MenuItem
} from '@mui/material';
import { toast } from "react-toastify";

const ApiKeysTab: React.FC = () => {
    // Retrieve stored provider preference (defaults to "Gemini")
    const storedPreference = localStorage.getItem("userPreference");
    const initialProvider =
        storedPreference && JSON.parse(storedPreference).OpenIA ? "OpenAI" : "Gemini";

    const [preferredProvider, setPreferredProvider] = useState(initialProvider);
    // States for additional API keys
    const [openIaKey, setOpenIaKey] = useState("");
    const [geminiKey, setGeminiKey] = useState("");
    const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
    const [telegramChatId, setTelegramChatId] = useState("");
    const [refresh_tokenLinked, setRefresh_tokenLinked] = useState("");

    // Input style shared among API key inputs
    const inputStyles = {
        width: '710px',
        height: '40px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        padding: '10px',
        backgroundColor: '#171717',
        '& input': { color: '#fff' }
    };

    // When the provider selection changes, update localStorage
    useEffect(() => {
        const preference = {
            OpenIA: preferredProvider === "OpenAI",
            Gemini: preferredProvider === "Gemini",
            DISCORD_WEBHOOK_URL: discordWebhookUrl,
            TELEGRAM_CHAT_ID: telegramChatId,
            refresh_Token: refresh_tokenLinked
        };
        localStorage.setItem("userPreference", JSON.stringify(preference));
    }, [preferredProvider, discordWebhookUrl, telegramChatId]);

    // On component mount, fetch saved preferences from the backend
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
                    setPreferredProvider(data.OpenIA ? "OpenAI" : "Gemini");
                    setOpenIaKey(data.OpenIaKey || "");
                    setGeminiKey(data.GeminiKey || "");
                    setDiscordWebhookUrl(data.DISCORD_WEBHOOK_URL || "");
                    setTelegramChatId(data.TELEGRAM_CHAT_ID || "");
                    setRefresh_tokenLinked(data.refresh_token || "")
                }
            })
            .catch((err) => console.error("Error fetching preferences:", err));
    }, []);

    const handleSave = async () => {
        // Build provider preference based on dropdown selection
        const preference = {
            OpenIA: preferredProvider === "OpenAI",
            Gemini: preferredProvider === "Gemini"
        };
        const token = localStorage.getItem("token");
        if (!token) return;

        // Merge the preference with user settings in localStorage
        const userStr = localStorage.getItem("user");
        const userSettings = userStr ? JSON.parse(userStr) : {};
        userSettings.Preference = preference;
        localStorage.setItem("user", JSON.stringify(userSettings));
        console.log("Local preferences saved:", userSettings);

        // Build the request body by including non-empty keys only
        const requestBody: any = {
            OpenIA: preference.OpenIA,
            Gemini: preference.Gemini
        };
        if (openIaKey.trim() !== "") requestBody.OpenIaKey = openIaKey;
        if (geminiKey.trim() !== "") requestBody.GeminiKey = geminiKey;
        if (discordWebhookUrl.trim() !== "") requestBody.DISCORD_WEBHOOK_URL = discordWebhookUrl;
        if (telegramChatId.trim() !== "") requestBody.TELEGRAM_CHAT_ID = telegramChatId;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/updatePreferences`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(requestBody)
                }
            );
            if (!response.ok) {
                console.error("Failed to save preferences to backend");
                toast.error("❌ Failed to save preferences!", { position: "top-right" });
                return;
            }
            const data = await response.json();
            toast.success("Preferences saved successfully!", { position: "top-right" });
            console.log("Preferences saved to backend:", data);
        } catch (error) {
            console.error("Error saving preferences:", error);
            toast.error("❌ Error saving preferences!", { position: "top-right" });
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Preferred Provider Dropdown */}
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
                    <Input sx={inputStyles} />
                </Box>
            </Box>

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
