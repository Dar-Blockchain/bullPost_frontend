// src/components/MyTeamTab.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { AccountItem, AddAccountItem } from './AccountComponents';

const MyTeamTab: React.FC = () => {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        My Team
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
        <Box>
          <AccountItem name="Member 01" onRemove={() => console.log('Remove Member 01')} />
          <AddAccountItem onClick={() => console.log('Add new team member')} />
        </Box>
        <Box>
          <AccountItem name="Member 02" onRemove={() => console.log('Remove Member 02')} />
        </Box>
        <Box>
          <AccountItem name="Member 03" onRemove={() => console.log('Remove Member 03')} />
        </Box>
      </Box>
    </>
  );
};

export default MyTeamTab;
