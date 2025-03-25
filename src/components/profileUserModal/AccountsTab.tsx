// src/components/AccountsTab.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, useMediaQuery, TextField, Button } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import DiscordIcon from '@mui/icons-material/Cloud';
import TelegramIcon from '@mui/icons-material/Send';
import { toast } from "react-toastify";
import { AccountItem, AddAccountItem } from './AccountComponents';

interface DiscordAccount {
  groupName: string;
  webhookUrl: string;
  _id: string;
}

interface TelegramAccount {
  groupName: string;
  chatId: string;
  _id: string;
}
interface TwitterAccount {
  twitter_Name: string;
  refresh_token: string;
  _id: string;
}
const AccountsTab: React.FC = () => {
  // Discord states 
  const [twitterAccounts, setTwitterAccounts] = useState<TwitterAccount[]>([]);

  const [discordAccounts, setDiscordAccounts] = useState<DiscordAccount[]>([]);
  const [showDiscordInputs, setShowDiscordInputs] = useState(false);
  const [discordServer, setDiscordServer] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');

  // Telegram states
  const [telegramAccounts, setTelegramAccounts] = useState<TelegramAccount[]>([]);
  const [showTelegramInputs, setShowTelegramInputs] = useState(false);
  const [telegramGroup, setTelegramGroup] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');

  // Responsive grid: 1 column on xs, 2 on sm, 3 on md+
  const isMobile = useMediaQuery('(max-width:600px)');
  const gridColumns = { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' };

  useEffect(() => {
    loadDiscordAccounts();
    // loadTelegramAccounts();
  }, []);

  // Fetch Discord accounts
  const loadDiscordAccounts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/getAcountData`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ types: ["discord", 'telegram', "twitter"] }),
        }
      );
      if (!response.ok) {
        console.error('Failed to fetch Discord accounts:', response.statusText);
        return;
      }
      const data = await response.json();
      console.log('Discord account data:', data);
      // Expect data in data.data.discord
      const accountsArray = data && data.data && Array.isArray(data.data.discord)
        ? data.data.discord
        : [];
      const accountsArrayTelegram = data && data.data && Array.isArray(data.data.telegram)
        ? data.data.telegram
        : [];
      const accountsArrayTwitter = data && data.data && Array.isArray(data.data.twitter)
        ? data.data.twitter
        : [];
      setDiscordAccounts(accountsArray);
      setTelegramAccounts(accountsArrayTelegram)
      setTwitterAccounts(accountsArrayTwitter)
    } catch (error) {
      console.error('Error fetching Discord accounts:', error);
    }
  };

  // Fetch Telegram accounts
  // const loadTelegramAccounts = async () => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     console.error('No token found');
  //     return;
  //   }
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/getAcountData`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({ types: ["telegram"] }),
  //       }
  //     );
  //     if (!response.ok) {
  //       console.error('Failed to fetch Telegram accounts:', response.statusText);
  //       return;
  //     }
  //     const data = await response.json();
  //     console.log('Telegram account data:', data);
  //     const accountsArray = data && data.data && Array.isArray(data.data.telegram)
  //       ? data.data.telegram
  //       : [];
  //     setTelegramAccounts(accountsArray);
  //   } catch (error) {
  //     console.error('Error fetching Telegram accounts:', error);
  //   }
  // };

  // Add a new Discord account with API call
  const handleAddDiscord = async () => {
    if (!discordServer || !discordWebhook) {
      console.error('Both Server Name and Webhook URL are required');
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/addDiscordWebhook`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            groupName: discordServer,
            webhookUrl: discordWebhook,
          }),
        }
      );
      if (!response.ok) {
        console.error("Failed to add Discord account:", response.statusText);
        toast.error("❌ Failed to add Discord account", { position: "top-right" });
        return;
      }
      const data = await response.json();
      console.log("Added Discord account:", data);
      const newAccount: DiscordAccount = data.discordAccount;
      setDiscordAccounts((prev) => [...prev, newAccount]);
      toast.success("Discord account added!", { position: "top-right" });
      setDiscordServer('');
      setDiscordWebhook('');
      setShowDiscordInputs(false);
      loadDiscordAccounts()
    } catch (error) {
      console.error("Error adding Discord account:", error);
      toast.error("❌ Error adding Discord account", { position: "top-right" });
    }
  };

  // Remove Discord account with API call
  const handleRemoveDiscord = async (acc: DiscordAccount, index: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/removeDiscordWebhook`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            webhookUrl: acc.webhookUrl,
          }),
        }
      );
      if (!response.ok) {
        console.error("Failed to remove Discord account:", response.statusText);
        toast.error("❌ Failed to remove Discord account", { position: "top-right" });
        return;
      }
      const data = await response.json();
      console.log("Removed Discord account:", data);
      setDiscordAccounts((prev) => prev.filter((_, i) => i !== index));
      toast.success("Discord account removed", { position: "top-right" });
    } catch (error) {
      console.error("Error removing Discord account:", error);
      toast.error("❌ Error removing Discord account", { position: "top-right" });
    }
  };

  // Add new Telegram account with API call (includes groupName)
  const handleAddTelegram = async () => {
    if (!telegramGroup || !telegramChatId) {
      console.error('Both Telegram Group and Chat ID are required');
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/addTelegramChatId`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            groupName: telegramGroup,
            chatId: telegramChatId,
          }),
        }
      );
      if (!response.ok) {
        console.error("Failed to add Telegram account:", response.statusText);
        toast.error("❌ Failed to add Telegram account", { position: "top-right" });
        return;
      }
      const data = await response.json();
      console.log("Added Telegram account:", data);
      const newAccount: TelegramAccount = data.telegramAccount;
      setTelegramAccounts((prev) => [...prev, newAccount]);
      toast.success("Telegram account added!", { position: "top-right" });
      setTelegramGroup('');
      setTelegramChatId('');
      setShowTelegramInputs(false);
      loadDiscordAccounts()

    } catch (error) {
      console.error("Error adding Telegram account:", error);
      toast.error("❌ Error adding Telegram account", { position: "top-right" });
    }
  };

  // Remove Telegram account with API call
  const handleRemoveTelegram = async (acc: TelegramAccount, index: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/removeTelegramChatId`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatId: acc.chatId,
          }),
        }
      );
      if (!response.ok) {
        console.error("Failed to remove Telegram account:", response.statusText);
        toast.error("❌ Failed to remove Telegram account", { position: "top-right" });
        return;
      }
      const data = await response.json();
      console.log("Removed Telegram account:", data);
      setTelegramAccounts((prev) => prev.filter((_, i) => i !== index));
      toast.success("Telegram account removed", { position: "top-right" });
    } catch (error) {
      console.error("Error removing Telegram account:", error);
      toast.error("❌ Error removing Telegram account", { position: "top-right" });
    }
  };
  const handleRedirect = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/oauth-url`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      if (!response.ok) throw new Error("Failed to fetch the redirect URL");
      const data = await response.json();
      if (data) {
        localStorage.setItem("addAccount", "true"); // Set the flag in localStorage

        window.location.href = data; // Redirect to the provided URL
      } else {
        console.error("Invalid URL received");
      }
    } catch (error) {
      console.error("Error during redirection:", error);
    }
  };
  const handleRemoveTwitter = async (acc: TwitterAccount, index: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}preferences/removeTwitterAccount
`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            refresh_token: acc.refresh_token,
          }),
        }
      );
      if (!response.ok) {
        console.error("Failed to remove Twitter account:", response.statusText);
        toast.error("❌ Failed to remove Twitter account", { position: "top-right" });
        return;
      }
      const data = await response.json();
      console.log("Removed Twitter account:", data);
      setTwitterAccounts((prev) => prev.filter((_, i) => i !== index));
      toast.success("Twitter account removed", { position: "top-right" });
    } catch (error) {
      console.error("Error removing Twitter account:", error);
      toast.error("❌ Error removing Twitter account", { position: "top-right" });
    }
  };
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: gridColumns, gap: 4 }}>
      {/* X (Twitter) Accounts */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
          <img
            src="/XBottom.png"
            alt="X"
            style={{ verticalAlign: "middle", marginRight: "8px" }}
          />
          X Accounts
        </Typography>
        {/* <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
          <TwitterIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> X Accounts
        </Typography> */}
        {twitterAccounts
          .filter((acc) => acc) // Filter out any undefined items
          .map((acc, index) => (
            <AccountItem
              key={acc._id || index}
              name={`${acc.twitter_Name}`}
              url={`(${acc.refresh_token})`}
              onRemove={() => handleRemoveTwitter(acc, index)}
            />
          ))
        }
        <AddAccountItem onClick={handleRedirect} />
      </Box>

      {/* Discord Accounts */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
          <img
            src="/discordBottom.png"
            alt="Discord"
            style={{ verticalAlign: "middle", marginRight: "8px" }}
          />
          Discord Accounts
        </Typography>
        {/* Display fetched Discord accounts */}
        {discordAccounts
          .filter((acc) => acc) // Filter out any undefined items
          .map((acc, index) => (
            <AccountItem
              key={acc._id || index}
              name={`${acc.groupName}`}
              url={`(${acc.webhookUrl})`}
              onRemove={() => handleRemoveDiscord(acc, index)}
            />
          ))
        }
        <AddAccountItem onClick={() => setShowDiscordInputs(true)} />
        {showDiscordInputs && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Server Name"
              fullWidth
              value={discordServer}
              onChange={(e) => setDiscordServer(e.target.value)}
              sx={{
                mb: 1,
                borderRadius: '6px',
                backgroundColor: 'transparent',
              }}
            />
            <TextField
              label="Discord Webhook URL"
              fullWidth
              value={discordWebhook}
              onChange={(e) => setDiscordWebhook(e.target.value)}
              sx={{
                mb: 1,
                borderRadius: '6px',
                backgroundColor: 'transparent',
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleAddDiscord}
                sx={{
                  marginTop: '20px',
                  width: '48%',
                  borderRadius: '8px',
                  fontSize: '12px',
                  padding: '6px 8px',
                  color: '#FFB300',
                  borderColor: '#FFB300',
                  '&:hover': { backgroundColor: '#FFA500', color: '#111' },
                }}
              >
                Add Account
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowDiscordInputs(false)}
                sx={{
                  marginTop: '20px',
                  width: '48%',
                  borderRadius: '8px',
                  fontSize: '12px',
                  padding: '6px 8px',
                  color: 'grey',
                  borderColor: 'grey',
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Telegram Accounts */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
          <TelegramIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Telegram Accounts
        </Typography>
        {telegramAccounts
          .filter((acc) => acc) // Filter out any undefined items
          .map((acc, index) => (
            <AccountItem
              key={acc._id || index}
              name={`${acc.groupName}`}
              url={`(${acc.chatId})`}

              onRemove={() => handleRemoveTelegram(acc, index)}
            />
          ))
        }
        {/* {telegramAccounts &&
          telegramAccounts.length > 0 &&
          telegramAccounts.map((acc, index) => (
            <AccountItem
              key={acc._id || index}
              name={truncateWords(`${acc.groupName} (${acc.chatId})`, 3)}
              onRemove={() => handleRemoveTelegram(acc, index)}
            />
          ))} */}
        <AddAccountItem onClick={() => setShowTelegramInputs(true)} />
        {showTelegramInputs && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Telegram Group Name"
              fullWidth
              value={telegramGroup}
              onChange={(e) => setTelegramGroup(e.target.value)}
              sx={{
                mb: 1,
                borderRadius: '6px',
                backgroundColor: 'transparent',
              }}
            />
            <TextField
              label="Telegram Chat ID"
              fullWidth
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              sx={{
                mb: 1,
                borderRadius: '6px',
                backgroundColor: 'transparent',
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleAddTelegram}
                sx={{
                  marginTop: '20px',
                  width: '48%',
                  borderRadius: '8px',
                  fontSize: '12px',
                  padding: '6px 8px',
                  color: '#FFB300',
                  borderColor: '#FFB300',
                  '&:hover': { backgroundColor: '#FFA500', color: '#111' },
                }}
              >
                Add Account
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowTelegramInputs(false)}
                sx={{
                  marginTop: '20px',
                  width: '48%',
                  borderRadius: '8px',
                  fontSize: '12px',
                  padding: '6px 8px',
                  color: 'grey',
                  borderColor: 'grey',
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AccountsTab;
