// src/components/ApiKeysTab.tsx
import React from 'react';
import { Box, Typography, Divider, Input, Button } from '@mui/material';

const ApiKeysTab: React.FC = () => {
  const handleSave = () => {
    // Implement your saving logic here.
    console.log("Save Data clicked");
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* OpenAI */}
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
              sx={{
                width: '710px',
                height: '40px',
                display: 'flex',
                justifyContent: 'space-between',
                borderRadius: '5px',
                border: '1px solid #ccc',
                padding: '10px',
                backgroundColor: '#171717',
                '& input': { color: '#fff' },
              }}
            />
          </Box>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
              o1-mini
            </Typography>
            <Input
              sx={{
                width: '710px',
                height: '40px',
                display: 'flex',
                justifyContent: 'space-between',
                borderRadius: '5px',
                border: '1px solid #ccc',
                padding: '10px',
                backgroundColor: '#171717',
                '& input': { color: '#fff' },
              }}
            />
          </Box>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#aaa', mb: 1, mr: 4 }}>
              o1
            </Typography>
            <Input
              sx={{
                width: '710px',
                height: '40px',
                display: 'flex',
                justifyContent: 'space-between',
                borderRadius: '5px',
                border: '1px solid #ccc',
                padding: '10px',
                backgroundColor: '#171717',
                '& input': { color: '#fff' },
              }}
            />
          </Box>
        </Box>
      </Box>
      {/* Anthropic */}
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
              display: 'flex',
              justifyContent: 'space-between',
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
              display: 'flex',
              justifyContent: 'space-between',
              borderRadius: '5px',
              border: '1px solid #ccc',
              padding: '10px',
              backgroundColor: '#171717',
              '& input': { color: '#fff' },
            }}
          />
        </Box>
      </Box>
      {/* Gemini */}
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
              display: 'flex',
              justifyContent: 'space-between',
              borderRadius: '5px',
              border: '1px solid #ccc',
              padding: '10px',
              backgroundColor: '#171717',
              '& input': { color: '#fff' },
            }}
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
            '&:hover': { backgroundColor: '#e6ac00' },
          }}
        >
          Save Data
        </Button>
      </Box>
    </Box>
  );
};

export default ApiKeysTab;
