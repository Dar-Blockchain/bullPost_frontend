// src/components/ApiKeysTab.tsx
import React, { useState } from 'react';
import { Box, Typography, Divider, Input, Button, Select, MenuItem } from '@mui/material';

const ApiKeysTab: React.FC = () => {
    // State for preferred provider, defaulting to "Gemini"
    const [preferredProvider, setPreferredProvider] = useState("Choose AI");

    const handleSave = () => {
        // Retrieve existing user settings from localStorage (if any)
        const userStr = localStorage.getItem("user");
        const userSettings = userStr ? JSON.parse(userStr) : {};

        // Update the Preference property based on the selected provider
        userSettings.Preference = {
            OpenIA: preferredProvider === "OpenAI",
            Gemini: preferredProvider === "Gemini"
        };

        // Save the updated settings back to localStorage
        localStorage.setItem("user", JSON.stringify(userSettings));
        console.log("Save Data clicked", userSettings);
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
                        '& .MuiSelect-select': { padding: '10px' },
                    }}
                >
                    <MenuItem value="Gemini">Gemini</MenuItem>
                    <MenuItem value="OpenAI">OpenAI</MenuItem>
                </Select>
            </Box>

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
                        Gemini
                    </Typography>
                    <Input
                        sx={{
                            width: '710px',
                            height: '40px',
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
