// src/components/AccountsTab.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import DiscordIcon from '@mui/icons-material/Cloud';
import TelegramIcon from '@mui/icons-material/Send';
import { AccountItem, AddAccountItem } from './AccountComponents';

const AccountsTab: React.FC = () => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
          <TwitterIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> X Accounts
        </Typography>
        <AccountItem name="OxJulio" onRemove={() => console.log('Remove X account')} />
        <AccountItem name="AnotherX" onRemove={() => console.log('Remove AnotherX')} />
        <AddAccountItem onClick={() => console.log('Add X account')} />
      </Box>
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
          <DiscordIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Discord Accounts
        </Typography>
        <AccountItem name="OxJulio" onRemove={() => console.log('Remove Discord account')} />
        <AccountItem name="AnotherDiscord" onRemove={() => console.log('Remove AnotherDiscord')} />
        <AddAccountItem onClick={() => console.log('Add Discord account')} />
      </Box>
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
          <TelegramIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Telegram Accounts
        </Typography>
        <AccountItem name="OxJulio" onRemove={() => console.log('Remove Telegram account')} />
        <AccountItem name="AnotherTelegram" onRemove={() => console.log('Remove AnotherTelegram')} />
        <AddAccountItem onClick={() => console.log('Add Telegram account')} />
      </Box>
    </Box>
  );
};

export default AccountsTab;
