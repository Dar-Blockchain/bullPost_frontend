// src/components/AppSettingsTab.tsx
import React from 'react';
import { Typography } from '@mui/material';

const AppSettingsTab: React.FC = () => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        App Settings
      </Typography>
      <Typography variant="body1" sx={{ color: '#ccc' }}>
        Configure application-level settings, notifications, and other preferences.
      </Typography>
    </>
  );
};

export default AppSettingsTab;
