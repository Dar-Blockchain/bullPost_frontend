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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { loadPreferences } from "@/store/slices/accountsSlice";

const AppSettingsTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const preferences = useSelector((state: RootState) => state.accounts.preferences);

  // Determine initial provider from Redux preferences (defaults to "Gemini")
  const initialProvider = preferences?.OpenIA ? "OpenAI" : "Gemini";
  const [provider, setProvider] = useState(initialProvider);

  // Local state for API keys
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");

  // New flag to initialize inputs only once.
  const [initialized, setInitialized] = useState(false);

  // Input style shared among API key inputs
  const inputStyles = {
    width: '90%',
    height: '40px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    padding: '10px',
    backgroundColor: '#171717',
    '& input': { color: '#fff' }
  };

  // Load preferences from the backend via Redux when the component mounts.
  useEffect(() => {
    dispatch(loadPreferences());
  }, [dispatch]);

  // Update local states when Redux preferences change, but only once.
  useEffect(() => {
    if (preferences && !initialized) {
      setProvider(preferences.OpenIA ? "OpenAI" : "Gemini");
      setDiscordWebhookUrl(preferences.DISCORD_WEBHOOK_URL || "");
      setTelegramChatId(preferences.TELEGRAM_CHAT_ID || "");
      setInitialized(true);
    }
  }, [preferences, initialized]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Build provider preference based on selection.
    const providerPreference = {
      OpenIA: provider === "OpenAI",
      Gemini: provider === "Gemini"
    };

    // Build the request body including only non-empty keys.
    const requestBody: any = {
      ...providerPreference
    };
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
      console.log("Preferences saved to backend:", data);
      toast.success("Preferences saved successfully!", { position: "top-right" });
      // Reload preferences from Redux.
      dispatch(loadPreferences());
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
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
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

      {/* Discord Webhook URL Section */}
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

      {/* Telegram Chat ID Section */}
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
