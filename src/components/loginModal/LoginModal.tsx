import React, { useEffect, useState } from "react";
import {
    Dialog, DialogContent, IconButton, Box, Typography, Button, TextField, RadioGroup, FormControlLabel, Radio,
    useMediaQuery,
    InputAdornment,
    Divider
} from "@mui/material";
import { toast } from "react-toastify";

import CloseIcon from "@mui/icons-material/Close";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { signIn } from "next-auth/react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { getCode, loginUser } from "@/store/slices/authSlice";
import { useAuth } from "@/hooks/useAuth";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Define Props Type
interface LoginModalProps {
    open: boolean;
    handleClose: () => void;
}

// Define Plan Type
interface Plan {
    title: string;
    price: string;
    features: string[];
}

const LoginModal: React.FC<LoginModalProps> = ({ open, handleClose }) => {
    const [step, setStep] = useState<number>(1);
    const [selectedOption, setSelectedOption] = useState<string>("");
    const isMobile = useMediaQuery("(max-width:600px)");
    const dispatch = useDispatch<AppDispatch>();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [timer, setTimer] = useState(0);
    const [isDisabled, setIsDisabled] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false); // Track login state
    const [loginError, setLoginError] = useState("");
    const [isCodeVerified, setIsCodeVerified] = useState(false); // Track if the code request was successful
    const { user } = useAuth(); // ✅ Get user data

    useEffect(() => {
        if (user?.trafficCounter > 1) {
            handleClose(); // ✅ Close the modal if visitorsCount > 1
        }
    }, [user?.trafficCounter]); // ✅ Runs when visitorsCount changes

    const handleGetCode = async () => {
        if (!email) {
            setEmailError("Email is required");
            toast.error("Email is required", { position: "top-right" });
            return;
        }
        if (!emailRegex.test(email)) {
            setEmailError("Invalid email format");
            toast.error("Invalid email format", { position: "top-right" });
            return;
        }
        setEmailError("");

        try {

            const response = await dispatch(getCode(email)).unwrap(); // Unwrap to handle success
            if (response.status === 200) {
                setIsCodeVerified(true); // Allow continue if code is received
                toast.success(response.message, { position: "top-right" });
            } else {
                setIsCodeVerified(false);
                toast.error(response.message, { position: "top-right" });
            }
            setIsDisabled(true);
            setTimer(60);

        } catch (error) {
            console.error("Error getting code:", error);
            toast.error("Error sending code. Please try again later.", { position: "top-right" });
            setIsCodeVerified(false);
        }
    };

    // Handle login
    const handleLogin = async () => {
        setIsLoggingIn(true);
        setLoginError("");

        try {
            const response = await dispatch(loginUser({ email, otp: code })).unwrap();
            console.log(response, "Login Response");

            if (response.status === 200) {
                toast.success("✅ Login successful!");

                console.log("User:", response.user);
                console.log("Token:", response.token);

                // Save token and user data to localStorage
                localStorage.setItem("token", response.token);
                localStorage.setItem("user", JSON.stringify(response.user));

                setStep(2); // Proceed to next step
            } else {
                toast.error(response.message || "❌ Invalid login. Please try again.");
                setLoginError(response.message || "Invalid login. Please try again.");
            }
        } catch (error: any) {
            console.error("Login error:", error);

            toast.error(`❌ ${error.message || "Login failed. Please try again."}`);
            setLoginError(error.message || "Login failed.");
        }

        setIsLoggingIn(false);
    };

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0 && isDisabled) {
            setIsDisabled(false);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timer, isDisabled]);
    const authProviders = [
        {
            label: "Continue with X (Twitter)",
            icon: <TwitterIcon />,
            color: "#1DA1F2",
            provider: "twitter",
        },
        {
            label: "Continue with Discord",
            icon: (
                <img
                    src="/discord.svg" // Ensure this file exists in your public folder
                    alt="Discord"
                    style={{ width: 25, height: 25, marginTop: "5px" }}
                />
            ),
            color: "#5865F2",
            provider: "discord",
        },
        {
            label: "Continue with Google",
            icon: <GoogleIcon />,
            color: "#EA4335",
            provider: "google",
        },
        {
            label: "Continue with Apple",
            icon: <AppleIcon />,
            color: "#fff",
            provider: "apple",
        },

        {
            label: "Connect Wallet",
            icon: <AccountBalanceWalletIcon />,
            color: "white",
            provider: "wallet", // You may handle wallet connection differently
        },
    ];
    // Subscription Plans
    const plans: Plan[] = [
        {
            title: "Standard",
            price: "$30",
            features: [
                "Social Sync Agent",
                "Formatting Agent",
                "Content Optimizer",
                "Multilingual Agent",
            ],
        },
        {
            title: "Image AI Agent",
            price: "$60",
            features: [
                "Image Agent",
                "MEME Agent",
                "Image Agent",
                "AI Training",
            ],
        },
        {
            title: "Video AI Agent",
            price: "$90",
            features: [
                "Faceless Video Agent",
                "UGC Video Agent",
                "AI Orchestrator Chatbot",
                "Autopilot AI Agent",
            ],
        },
    ];

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={step === 5 ? "xl" : "md"}
            fullWidth
            sx={{
                "& .MuiPaper-root": {
                    width: step === 5 ? 1000 : 563,
                    height: 665,
                    borderRadius: "15px",
                    backgroundColor: "#121212",
                    color: "#fff",
                },
            }}
        >
            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    backgroundColor: "#111",
                    padding: 4,
                    borderRadius: "12px",
                    backgroundImage: "url('/Ellipse 4.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "top",
                    mt: step === 5 ? "" : "-75px"
                }}
            >
                {/* Close Button */}
                <IconButton
                    onClick={handleClose}
                    sx={{ position: "absolute", top: 10, right: 10, color: "#FFB300" }}
                >
                    <CloseIcon />
                </IconButton>

                {step === 1 && (
                    <>
                        {/* Header: Logo and Title */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexWrap: "wrap",
                                mb: 2,
                                mt: "50px",
                            }}
                        >
                            <Box
                                component="img"
                                src="/BP_Logo.png"
                                alt="BullPost Logo"
                                sx={{ width: 50, height: 50, mr: 1 }}
                            />
                            <Typography variant="h6" sx={{ color: "#FFB300", fontWeight: 600 }}>
                                BullPost
                            </Typography>
                        </Box>

                        {/* Instruction Text */}
                        <Typography
                            sx={{
                                textAlign: "center",
                                color: "#aaa",
                                fontSize: "14px",
                            }}
                        >
                            To continue, please login:
                        </Typography>

                        {/* Social Login Buttons */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "100%",
                            }}
                        >
                            {authProviders.map((item, index) => (
                                <Button
                                    key={index}
                                    variant="outlined"
                                    onClick={() => {
                                        if (item.provider === "wallet") {
                                            console.log("Connect wallet clicked");
                                        } else {
                                            signIn(item.provider);
                                        }
                                    }}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        alignItems: "center",
                                        gap: 1.5,
                                        mt: 1.5,
                                        borderColor: "#333",
                                        color: "#ccc",
                                        backgroundColor: "#191919",
                                        width: 303,
                                        height: 45,
                                        borderWidth: 1,
                                        borderRadius: "10px",
                                        padding: "11px 10px 10px 10px",
                                        textTransform: "none", // disables uppercase transformation
                                        "&:hover": { backgroundColor: "#222" },
                                    }}
                                >
                                    <Box sx={{ color: item.color }}>{item.icon}</Box>
                                    {item.label}
                                </Button>
                            ))}
                        </Box>

                        {/* Divider */}
                        <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
                            <Divider sx={{ flex: 1, borderColor: "#666" }} />
                            <Typography sx={{ mx: 1, color: "#666", fontSize: "12px" }}>Or</Typography>
                            <Divider sx={{ flex: 1, borderColor: "#666" }} />
                        </Box>

                        {/* Email Input */}
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={!!emailError}
                            helperText={emailError}
                            sx={{
                                width: 303,
                                height: 45,
                                borderWidth: 1,

                                borderRadius: "10px",
                                input: { color: "#fff", padding: "10px" },
                                "& fieldset": { borderColor: "#333" },
                                "&:hover fieldset": { borderColor: "#444" },
                            }}
                        />

                        {/* Code Input with Get Code Button */}
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            sx={{
                                mt: 3,
                                width: 303,
                                height: 45,
                                borderWidth: 1,
                                borderRadius: "10px",
                                input: { color: "#fff", padding: "10px" },
                                "& fieldset": { borderColor: "#333" },
                                "&:hover fieldset": { borderColor: "#444" },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end" sx={{ mr: "-10px" }}>
                                        <Button
                                            variant="contained"
                                            sx={{
                                                fontWeight: "bold",
                                                backgroundColor: "#FFB300",
                                                color: "#111",
                                                textTransform: "none",
                                                height: "100%",
                                                "&:hover": { backgroundColor: "#FFA500" },
                                            }}
                                            onClick={handleGetCode}
                                            disabled={isDisabled}
                                        >
                                            {isDisabled ? `Wait ${timer}s` : "Get Code"}
                                        </Button>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Continue Button */}
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                                width: 301,
                                height: 45,
                                mt: 2,
                                borderRadius: "10px",
                                backgroundColor: isCodeVerified && code ? "#FFB300" : "#444",
                                color: "#111",
                                fontWeight: "bold",
                                "&:hover": {
                                    backgroundColor: isCodeVerified && code ? "#FFA500" : "#444",
                                },
                            }}
                            onClick={handleLogin}
                            disabled={!code}
                        >
                            {isLoggingIn ? "Logging in..." : "Continue"}
                        </Button>
                    </>
                )}
                {step === 2 && (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {/* Progress Indicator */}
                            <Typography sx={{
                                fontSize: "12px", color: "#aaa", mb: 2, textAlign: "left", width: "100%", marginTop: 6

                            }}>
                                1 / 3
                            </Typography>

                            {/* Title */}
                            <Typography
                                variant="h6"
                                sx={{
                                    color: "#FFB300",
                                    fontWeight: 600,
                                    mb: 2,
                                    textAlign: "left",
                                    width: "100%",
                                    fontSize: "18px" // Match image size
                                }}
                            >
                                What best describes you?
                            </Typography>

                            {/* Selection List */}
                            <RadioGroup
                                value={selectedOption}
                                onChange={(e) => setSelectedOption(e.target.value)}
                                sx={{ width: "80%" }}
                            >
                                {[
                                    { label: "Brand / Company", description: "Managing social media for a business" },
                                    { label: "Influencer / Creator", description: "Growing my personal brand" },
                                    { label: "Web3 Project", description: "Promoting a crypto/NFT venture" },
                                    { label: "AI Enthusiast", description: "Exploring AI-powered social media" },
                                ].map((item, index) => (
                                    <FormControlLabel
                                        key={index}
                                        value={item.label}
                                        control={<Radio sx={{ color: "#FFB300" }} />}
                                        label={
                                            <Box>
                                                <Typography
                                                    sx={{
                                                        fontSize: "14px",
                                                        fontWeight: "bold",
                                                        color: selectedOption === item.label ? "#FFB300" : "#fff",
                                                        transition: "color 0.2s ease-in-out"
                                                    }}
                                                >
                                                    {item.label}
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", color: "#aaa" }}>
                                                    {item.description}
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            mb: 1.5, // Spacing between options
                                            width: "100%"
                                        }}
                                    />
                                ))}
                            </RadioGroup>

                            <Button
                                fullWidth
                                variant="outlined"
                                sx={{
                                    width: 301,
                                    height: 45,
                                    borderWidth: 1,
                                    borderRadius: "10px",
                                    borderColor: "#FFB300", // Add the "#" before the color code
                                    borderStyle: "solid", // Ensure the border is visible
                                    padding: "10px",
                                    backgroundColor: "#111",
                                    color: "#FFB300", // Ensure the text color is readable
                                    mt: 2,
                                    fontWeight: "bold",
                                    "&:hover": { backgroundColor: "#FFB300", color: "#111" }, // Change color on hover
                                }}
                                onClick={() => setStep(3)} // Move to step 2
                            >
                                Continue
                            </Button>
                            {/* <Button
                            fullWidth
                            variant="outlined"
                            sx={{
                                width: "100%",
                                height: 45,
                                borderWidth: 2,
                                borderRadius: "10px",
                                borderColor: "#FFB300",
                                padding: "10px",
                                backgroundColor: "transparent",
                                color: "#FFB300",
                                mt: 3,
                                fontWeight: "bold",
                                fontSize: "16px",
                                textTransform: "none",
                                "&:hover": { backgroundColor: "#FFB300", color: "#111" }, // Change color on hover
                            }}
                            onClick={() => setStep(3)} // Move to next step
                            disabled={!selectedOption} // Disable if nothing is selected
                        >
                            Continue
                        </Button> */}

                            {/* Skip Option - Minimalistic */}
                            <Button
                                variant="text"
                                sx={{
                                    mt: 2,
                                    color: "#aaa",
                                    fontWeight: "bold",
                                    textTransform: "none",
                                    fontSize: "14px",
                                    "&:hover": { color: "#fff", textDecoration: "underline" },
                                }}
                                onClick={() => setStep(4)} // Skip selection and move to next step
                            >
                                Skip
                            </Button>
                        </Box></>
                )}
                {step === 3 && (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {/* Progress Indicator */}
                            <Typography sx={{
                                fontSize: "12px", color: "#aaa", mb: 2, textAlign: "left", width: "100%", marginTop: 6

                            }}>
                                2 / 3
                            </Typography>

                            {/* Title */}
                            <Typography
                                variant="h6"
                                sx={{
                                    color: "#FFB300",
                                    fontWeight: 400,
                                    mb: 2,
                                    textAlign: "left",
                                    width: "100%",
                                    fontSize: "16px" // Match image size
                                }}
                            >
                                What’s your main goal with BullPost?                            </Typography>

                            {/* Selection List */}
                            <RadioGroup
                                value={selectedOption}
                                onChange={(e) => setSelectedOption(e.target.value)}
                                sx={{ width: "80%" }}
                            >
                                {[
                                    { label: "Grow my audience", description: "AI-driven engagement strategies" },
                                    { label: "Save time on posting", description: "Automate scheduling & optimization" },
                                    { label: "Monetize my content", description: "Leverage Web3 rewards" },
                                    { label: "Run better campaigns", description: "Advanced analytics & insights" },
                                ].map((item, index) => (
                                    <FormControlLabel
                                        key={index}
                                        value={item.label}
                                        control={<Radio sx={{ color: "#FFB300" }} />}
                                        label={
                                            <Box>
                                                <Typography
                                                    sx={{
                                                        fontSize: "14px",
                                                        fontWeight: "bold",
                                                        color: selectedOption === item.label ? "#FFB300" : "#fff",
                                                        transition: "color 0.2s ease-in-out"
                                                    }}
                                                >
                                                    {item.label}
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", color: "#aaa" }}>
                                                    {item.description}
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            mb: 1.5, // Spacing between options
                                            width: "100%"
                                        }}
                                    />
                                ))}
                            </RadioGroup>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center"
                                }}
                            >
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    sx={{
                                        width: 301,
                                        height: 45,
                                        borderWidth: 1,
                                        borderRadius: "10px",
                                        borderColor: "#FFB300", // Add the "#" before the color code
                                        borderStyle: "solid", // Ensure the border is visible
                                        padding: "10px",
                                        backgroundColor: "#111",
                                        color: "#FFB300", // Ensure the text color is readable
                                        mt: 2,
                                        fontWeight: "bold",
                                        "&:hover": { backgroundColor: "#FFB300", color: "#111" }, // Change color on hover
                                    }}
                                    onClick={() => setStep(4)} // Move to step 2
                                >
                                    Continue
                                </Button>

                                <Button
                                    variant="text"
                                    sx={{
                                        mt: 2,
                                        color: "#aaa",
                                        fontWeight: "bold",
                                        textTransform: "none",
                                        fontSize: "14px",
                                        "&:hover": { color: "#fff", textDecoration: "underline" },
                                    }}
                                    onClick={() => setStep(4)} // Skip selection and move to next step
                                >
                                    Skip
                                </Button>
                            </Box>
                        </Box></>
                )}
                {step === 4 && (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {/* Progress Indicator */}
                            <Typography sx={{
                                fontSize: "12px", color: "#aaa", mb: 2, textAlign: "left", width: "100%", marginTop: 6

                            }}>
                                3 / 3
                            </Typography>

                            {/* Title */}
                            <Typography
                                variant="h6"
                                sx={{
                                    color: "#FFB300",
                                    fontWeight: 400,
                                    mb: 2,
                                    textAlign: "left",
                                    width: "100%",
                                    fontSize: "16px" // Match image size
                                }}
                            >
                                Where do you post the most?                           </Typography>

                            {/* Selection List */}
                            <RadioGroup
                                value={selectedOption}
                                onChange={(e) => setSelectedOption(e.target.value)}
                                sx={{ width: "80%" }}
                            >
                                {[
                                    { label: "X (Twitter)", description: "AI-driven engagement strategies" },
                                    { label: "Discord", description: "Automate scheduling & optimization" },
                                    { label: "Telegram", description: "Leverage Web3 rewards" },
                                ].map((item, index) => (
                                    <FormControlLabel
                                        key={index}
                                        value={item.label}
                                        control={<Radio sx={{ color: "#FFB300" }} />}
                                        label={
                                            <Box>
                                                <Typography
                                                    sx={{
                                                        fontSize: "14px",
                                                        fontWeight: "bold",
                                                        color: selectedOption === item.label ? "#FFB300" : "#fff",
                                                        transition: "color 0.2s ease-in-out"
                                                    }}
                                                >
                                                    {item.label}
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", color: "#aaa" }}>
                                                    {item.description}
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            mb: 1.5, // Spacing between options
                                            width: "100%"
                                        }}
                                    />

                                ))}
                            </RadioGroup>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center"
                                }}
                            >
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    sx={{
                                        width: 301,
                                        height: 45,
                                        borderWidth: 1,
                                        borderRadius: "10px",
                                        borderColor: "#FFB300", // Add the "#" before the color code
                                        borderStyle: "solid", // Ensure the border is visible
                                        padding: "10px",
                                        backgroundColor: "#111",
                                        color: "#FFB300", // Ensure the text color is readable
                                        mt: 2,
                                        fontWeight: "bold",
                                        "&:hover": { backgroundColor: "#FFB300", color: "#111" }, // Change color on hover
                                    }}
                                    onClick={() => setStep(5)} // Move to step 2
                                >
                                    Continue
                                </Button>

                                <Button
                                    variant="text"
                                    sx={{
                                        mt: 2,
                                        color: "#aaa",
                                        fontWeight: "bold",
                                        textTransform: "none",
                                        fontSize: "14px",
                                        "&:hover": { color: "#fff", textDecoration: "underline" },
                                    }}
                                    onClick={() => setStep(5)} // Skip selection and move to next step
                                >
                                    Skip
                                </Button>
                            </Box>
                        </Box></>
                )}
                {step === 5 && (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            mt: isMobile ? "80px" : "40px",
                            height: "100vh",
                            borderRadius: "12px",
                        }}
                    >
                        <Typography variant="h6" sx={{ color: "#FFB300", mt: isMobile ? "80px" : "40px", fontWeight: 600, textAlign: "start", ml: "20px" }}>
                            Select Plan
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", justifyContent: "center", width: "100%", gap: 4 }}>
                            {plans.map((plan, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        padding: 3,
                                        borderRadius: "10px",
                                        textAlign: "start",
                                        mt: 3,
                                        width: 260,
                                        height: 315,
                                        borderWidth: 1,
                                    }}
                                >
                                    <Typography sx={{ fontSize: "16px", fontWeight: 600, color: "#FFB300" }}>
                                        {plan.title}
                                    </Typography>
                                    <Typography sx={{ fontSize: "40px", color: "#fff", mt: 1, fontWeight: "bold" }}>
                                        {plan.price.split(' ')[0]} <span style={{ fontSize: "20px" }}>/ month</span>
                                    </Typography>
                                    <Box sx={{ mt: 2, color: "#aaa" }}>
                                        {plan.features.map((feature, i) => (
                                            <Box key={i} sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                                <img src="/check_circle.svg" alt="check" width={16} height={16} style={{ marginRight: 8 }} />
                                                <Typography sx={{ fontSize: "14px" }}>{feature}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        sx={{
                                            borderWidth: 1,
                                            borderRadius: "10px",
                                            borderColor: "#FFB300",
                                            borderStyle: "solid",
                                            padding: "10px",
                                            backgroundColor: "#111",
                                            color: "#FFB300",
                                            mt: 5,
                                            fontWeight: "bold",
                                            "&:hover": { backgroundColor: "#FFB300", color: "#111" },
                                        }}
                                    >
                                        Select
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                        <Button variant="text" sx={{ mt: 3, mb: 4, color: "#aaa", fontWeight: "bold" }}>
                            Skip for now
                        </Button>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default LoginModal;
