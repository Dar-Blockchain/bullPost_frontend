// src/components/ProfileModal.tsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Avatar,
    Typography,
    Tabs,
    Tab,
    IconButton,
    useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountsTab from './AccountsTab';
import MyTeamTab from './MyTeamTab';
import ApiKeysTab from './ApiKeysTab';
import PlansTab from './PlansTab';
import AppSettingsTab from './AppSettingsTab';
import { useAuth } from '@/hooks/useAuth';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 2, px: 1 }}>{children}</Box>}
        </div>
    );
}

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
    user: {
        name: string;
        avatarUrl: string;
    };
}

export default function ProfileModal({ open, onClose }: ProfileModalProps) {
    const [activeTab, setActiveTab] = useState(0);
    const { user } = useAuth(); // ✅ Get user data
    const isMobile = useMediaQuery("(max-width:600px)");

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
            sx: {
                backgroundColor: '#171717',
                color: '#555555',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden',
                height: '80vh',
                zIndex: 10000,
                maxWidth: isMobile ? '100%' : '70%', // This will prevent the modal from becoming too wide
            },
        }}
    >
        <DialogContent
            sx={{
                backgroundColor: '#101010',
                py: 2,
                px: 3,
                zIndex: 10000,
                overflowY: "auto",
                overflowX: "hidden", // Prevent horizontal scrolling
                "&::-webkit-scrollbar": { width: "2px" },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#FFB300",
                    borderRadius: "3px",
                    width: "1px",
                },
                backgroundImage: "url('/Ellipse 4.png')",
                backgroundSize: "cover",
                backgroundPosition: "top",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    px: 2,
                    mb: 2,
                }}
            >
                {user && (
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user?.user_image}`}
                            alt={"user.name"}
                            sx={{ width: 45, height: 45 }}
                        />
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                            {user.userName}
                        </Typography>
                    </Box>
                )}
                <IconButton onClick={onClose}>
                    <CloseIcon sx={{ color: '#FFB300' }} />
                </IconButton>
            </Box>
            {/* Tabs */}
            <Box>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    TabIndicatorProps={{ style: { backgroundColor: '#FFB300', height: '3px' } }}
                    sx={{
                        '& .MuiTab-root': {
                            color: '#bbb',
                            textTransform: 'none',
                            fontWeight: 500,
                            transition: 'color 0.2s',
                            '&:hover': { color: '#fff' },
                        },
                        '& .Mui-selected': { color: '#FFB300 !important', fontWeight: 'bold' },
                    }}
                >
                    <Tab label="Accounts" />
                    <Tab label="My Team" />
                    <Tab label="API Keys" />
                    <Tab label="Plans" />
                    <Tab label="App Settings" />
                </Tabs>
            </Box>
            {/* Tab Panels */}
            <TabPanel value={activeTab} index={0}>
                <AccountsTab />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
                <MyTeamTab />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
                <ApiKeysTab />
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
                <PlansTab />
            </TabPanel>
            <TabPanel value={activeTab} index={4}>
                <AppSettingsTab />
            </TabPanel>
        </DialogContent>
    </Dialog>
    
    );
}
