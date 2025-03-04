// src/components/PlansTab.tsx
import React from 'react';
import { Typography } from '@mui/material';

const PlansTab: React.FC = () => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Plans
      </Typography>
      <Typography variant="body1" sx={{ color: '#ccc' }}>
        View and manage your subscription plan. Upgrade, downgrade, or cancel your plan here.
      </Typography>
    </>
  );
};

export default PlansTab;
