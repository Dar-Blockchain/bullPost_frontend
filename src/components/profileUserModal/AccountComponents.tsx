// src/components/AccountComponents.tsx
import React from 'react';
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';

interface AccountItemProps {
  avatar?: string;
  name: string;
  url?: string;
  onRemove: () => void;
}
function shortenString(str: string, front = 8, back = 8) {
  // If the string is already short enough, return as-is
  if (str.length <= front + back) return str;
  // Otherwise, return front...back
  const firstPart = str.slice(0, front);
  const lastPart = str.slice(-back);
  return `${firstPart}...${lastPart}`;
}
export const AccountItem: React.FC<AccountItemProps> = ({ avatar, name, url, onRemove }) => (

  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#171717',
      borderRadius: '9999px',
      padding: '6px 12px',
      mb: 1,
    }}
  >

    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {avatar && <Avatar src={avatar} alt={name} sx={{ width: 32, height: 32 }} />}
      <Typography sx={{ fontSize: '0.95rem' }}>{name}</Typography>
      {url && (
        <Typography sx={{ fontSize: '0.95rem' }}>
          {shortenString(url)}
        </Typography>
      )}
    </Box>
    <IconButton
      onClick={onRemove}
      sx={{
        color: '#bbb',
        transition: 'color 0.2s',
        '&:hover': { color: '#fff' },
      }}
    >
      <ClearIcon fontSize="small" />
    </IconButton>
  </Box>
);

interface AddAccountItemProps {
  onClick: () => void;
}

export const AddAccountItem: React.FC<AddAccountItemProps> = ({ onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#171717',
      borderRadius: '9999px',
      padding: '6px 12px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      '&:hover': { backgroundColor: '#333333' },
    }}
  >
    <Typography sx={{ fontSize: '0.95rem' }}>Add account</Typography>
    <IconButton sx={{ color: '#bbb', p: 0.5, '&:hover': { color: '#fff' } }}>
      <AddIcon fontSize="small" />
    </IconButton>
  </Box>
);
