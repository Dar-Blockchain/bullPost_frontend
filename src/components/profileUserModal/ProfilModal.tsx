import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Box,
    Avatar,
    Typography,
    Tabs,
    Tab,
    IconButton,
    Divider,
    TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Example icons (replace if you have custom ones)
import TwitterIcon from '@mui/icons-material/Twitter';
import DiscordIcon from '@mui/icons-material/Cloud';
import TelegramIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear'; // For remove icon

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
        // ... any other user fields
    };
}

export default function ProfileModal({ open, onClose, user }: ProfileModalProps) {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // A reusable component for each "account" pill box
    const AccountItem = ({
        avatar,
        name,
        onRemove,
    }: {
        avatar?: string;
        name: string;
        onRemove: () => void;
    }) => (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#171717',
                borderRadius: '9999px', // large radius for pill shape
                padding: '6px 12px',
                mb: 1,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {avatar && (
                    <Avatar
                        src={avatar}
                        alt={name}
                        sx={{ width: 32, height: 32 }}
                    />
                )}
                <Typography sx={{ fontSize: '0.95rem' }}>{name}</Typography>
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

    // A reusable component for the "Add account" pill
    const AddAccountItem = ({ onClick }: { onClick: () => void }) => (
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
                '&:hover': {
                    backgroundColor: '#333333',
                },
            }}
        >
            <Typography sx={{ fontSize: '0.95rem' }}>Add account</Typography>
            <IconButton
                sx={{
                    color: '#bbb',
                    p: 0.5,
                    '&:hover': { color: '#fff' },
                }}
            >
                <AddIcon fontSize="small" />
            </IconButton>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    // // Add your background image here:
                    // backgroundImage: "url('/Ellipse 4.png')",
                    // backgroundSize: 'cover',
                    // backgroundPosition: 'top',
                    // backgroundRepeat: 'no-repeat',
                    backgroundColor: '#101010', // fallback color behind the image
                    color: '#555555',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden',
                    height: '80vh',
                },
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#101010',
                    
                    py: 1.5,
                    px: 2,
                }}
            >
                <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                        src={user.avatarUrl}
                        alt={user.name}
                        sx={{ width: 45, height: 45 }}
                    />
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                        {user.name}
                    </Typography>
                </Box>
                <IconButton onClick={onClose}>
                    <CloseIcon sx={{ color: '#FFB300' }} />
                </IconButton>
            </DialogTitle>

            {/* Tabs */}
            <Box
                sx={{
                    backgroundColor: 'transparent',
                    px: 2,
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    TabIndicatorProps={{
                        style: { backgroundColor: '#FFB300', height: '3px' },
                    }}
                    sx={{
                        '& .MuiTab-root': {
                            color: '#bbb',
                            textTransform: 'none',
                            fontWeight: 500,
                            transition: 'color 0.2s',
                            '&:hover': {
                                color: '#fff',
                            },
                        },
                        '& .Mui-selected': {
                            color: '#FFB300 !important',
                            fontWeight: 'bold',
                        },
                    }}
                >
                    <Tab label="Accounts" />
                    <Tab label="My Team" />
                    <Tab label="API Keys" />
                    <Tab label="Plans" />
                    <Tab label="App Settings" />
                </Tabs>
            </Box>

            {/* Content */}
            <DialogContent sx={{ backgroundColor: 'transparent', py: 2, px: 3 }}>
                {/* TAB 0: Accounts */}
                <TabPanel value={activeTab} index={0}>
                    {/* 3 columns for X / Discord / Telegram */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 4,
                        }}
                    >
                        {/* X Accounts */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                <TwitterIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                X Accounts
                            </Typography>

                            {/* Example existing account */}
                            <AccountItem
                                name="OxJulio"
                                onRemove={() => {
                                    console.log('Remove X account');
                                }}
                            />
                            {/* Another example */}
                            <AccountItem
                                name="AnotherX"
                                onRemove={() => {
                                    console.log('Remove AnotherX');
                                }}
                            />

                            {/* Add account pill */}
                            <AddAccountItem
                                onClick={() => {
                                    console.log('Add X account');
                                }}
                            />
                        </Box>

                        {/* Discord Accounts */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                <DiscordIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                Discord Accounts
                            </Typography>

                            <AccountItem
                                name="OxJulio"
                                onRemove={() => {
                                    console.log('Remove Discord account');
                                }}
                            />
                            <AccountItem
                                name="AnotherDiscord"
                                onRemove={() => {
                                    console.log('Remove AnotherDiscord');
                                }}
                            />

                            <AddAccountItem
                                onClick={() => {
                                    console.log('Add Discord account');
                                }}
                            />
                        </Box>

                        {/* Telegram Accounts */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                <TelegramIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                Telegram Accounts
                            </Typography>

                            <AccountItem
                                name="OxJulio"
                                onRemove={() => {
                                    console.log('Remove Telegram account');
                                }}
                            />
                            <AccountItem
                                name="AnotherTelegram"
                                onRemove={() => {
                                    console.log('Remove AnotherTelegram');
                                }}
                            />

                            <AddAccountItem
                                onClick={() => {
                                    console.log('Add Telegram account');
                                }}
                            />
                        </Box>
                    </Box>
                </TabPanel>

                {/* TAB 1: My Team */}
                <TabPanel value={activeTab} index={1}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                        My Team
                    </Typography>

                    {/* 3 columns for team members */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 4,
                        }}
                    >
                        {/* Column 1 */}
                        <Box>
                            <AccountItem
                                name="Member 01"
                                onRemove={() => {
                                    console.log('Remove Member 01');
                                }}
                            />
                            {/* Optionally add more team members here if desired */}

                            {/* Add member pill at the bottom of Column 1 */}
                            <AddAccountItem
                                onClick={() => {
                                    console.log('Add new team member');
                                }}
                            />
                        </Box>

                        {/* Column 2 */}
                        <Box>
                            <AccountItem
                                name="Member 02"
                                onRemove={() => {
                                    console.log('Remove Member 02');
                                }}
                            />
                        </Box>

                        {/* Column 3 */}
                        <Box>
                            <AccountItem
                                name="Member 03"
                                onRemove={() => {
                                    console.log('Remove Member 03');
                                }}
                            />
                        </Box>
                    </Box>
                </TabPanel>

                {/* TAB 2: API Keys */}
                <TabPanel value={activeTab} index={2}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                        API Keys
                    </Typography>

                    {/* Single-column layout for all providers */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* 1. OpenAI */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                OpenAI
                            </Typography>
                            <Divider sx={{ mb: 2, borderColor: '#444' }} />

                            {/* GPT-4o */}
                            <Box sx={{ mb: 3 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                    }}
                                >
                                    <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                                        GPT-4o
                                    </Typography>
                                    <TextField
                                        placeholder="Enter API Key"
                                        value="12e3fa789-abde723-23afw3-23vfra"
                                        sx={{
                                            width: '100%',
                                            backgroundColor: '#171717',
                                            borderRadius: '8px',
                                            input: { color: '#fff' },
                                        }}
                                    />
                                    {/* Example if you want the "Key valid" indicator inline:
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: '#3FAE3F',
                    }}
                  >
                    <CheckCircleIcon fontSize="small" />
                    <Typography variant="body2" sx={{ color: 'inherit' }}>
                      Key valid
                    </Typography>
                  </Box> */}
                                </Box>
                            </Box>

                            {/* o1-mini */}
                            <Box sx={{ mb: 3 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                    }}
                                >
                                    <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                                        o1-mini
                                    </Typography>
                                    <TextField
                                        placeholder="Enter API Key"
                                        fullWidth
                                        sx={{
                                            backgroundColor: '#171717',
                                            borderRadius: '8px',
                                            input: { color: '#fff' },
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* o1 */}
                            <Box sx={{ mb: 3 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                    }}
                                >
                                    <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                                        o1
                                    </Typography>
                                    <TextField
                                        placeholder="Enter API Key"
                                        fullWidth
                                        sx={{
                                            backgroundColor: '#171717',
                                            borderRadius: '8px',
                                            input: { color: '#fff' },
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* 2. Anthropic */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                Anthropic
                            </Typography>
                            <Divider sx={{ mb: 2, borderColor: '#444' }} />

                            {/* Sonnet 3.5 */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                                    Sonnet 3.5
                                </Typography>
                                <TextField
                                    placeholder="Enter API Key"
                                    fullWidth
                                    sx={{
                                        backgroundColor: '#171717',
                                        borderRadius: '8px',
                                        input: { color: '#fff' },
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* 3. Deepseek */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                                Deepseek
                            </Typography>
                            <Divider sx={{ mb: 2, borderColor: '#444' }} />

                            {/* v3 */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                                    v3
                                </Typography>
                                <TextField
                                    placeholder="Enter API Key"
                                    fullWidth
                                    sx={{
                                        backgroundColor: '#171717',
                                        borderRadius: '8px',
                                        input: { color: '#fff' },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </TabPanel>

                {/* TAB 3: Plans */}
                <TabPanel value={activeTab} index={3}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                        Plans
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ccc' }}>
                        View and manage your subscription plan. Upgrade, downgrade, or cancel your plan here.
                    </Typography>
                </TabPanel>

                {/* TAB 4: App Settings */}
                <TabPanel value={activeTab} index={4}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                        App Settings
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#ccc' }}>
                        Configure application-level settings, notifications, and other preferences.
                    </Typography>
                </TabPanel>
            </DialogContent>
        </Dialog>
    );
}
