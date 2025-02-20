// pages/_app.tsx
import { AppProps } from "next/app";
import { CssBaseline, ThemeProvider, createTheme, Box } from "@mui/material";
import Sidebar from "../components/sidebar/Sidebar";
import { useState } from "react";
import LoginModal from "@/components/loginModal/LoginModal";
import { Provider } from "react-redux";
import store from "../store/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css"; // Ensure global styles are imported
import { useDispatch } from "react-redux";
import { useAuth } from "@/hooks/useAuth";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#000000",
    },
    text: {
      primary: "#ffffff",
    },
  },
});

function MyAppComponent({ Component, pageProps }: AppProps) {
  const { isLoggedIn } = useAuth(); // Get auth state from Redux
  const [isLoginOpen, setIsLoginOpen] = useState(false); // Control login modal
  const dispatch = useDispatch();

  const handleOpenLogin = () => {
    setIsLoginOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <ToastContainer position="top-right" autoClose={3000} />

      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <Sidebar handleOpen={handleOpenLogin} isLoggedIn={isLoggedIn} />

        {/* Main Content */}
        <Box>
          <Component {...pageProps} />
        </Box>
      </Box>

      {/* Login Modal */}
      <LoginModal open={isLoginOpen} handleClose={handleCloseLogin} />
    </ThemeProvider>
  );
}

// Wrap with Redux Provider
export default function MyApp(props: AppProps) {
  return (
    <Provider store={store}>
      <MyAppComponent {...props} />
    </Provider>
  );
}
