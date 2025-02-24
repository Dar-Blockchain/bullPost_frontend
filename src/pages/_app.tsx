import { AppProps } from "next/app";
import { useRouter } from "next/router";
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
import { SessionProvider } from "next-auth/react"; // ✅ Import SessionProvider

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
  const router = useRouter(); // ✅ Fix: Get router from Next.js
  const { isLoggedIn } = useAuth(); // Get auth state from Redux
  const [isLoginOpen, setIsLoginOpen] = useState(false); // Control login modal
  const dispatch = useDispatch();
  console.log(isLoggedIn, '-----------------isLoggedin------------------')
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

      <Box sx={{ display: "flex", minHeight: "100vh", width: '100%' }}> {/* ✅ Ensure full width */}
        {/* Sidebar */}
        <Sidebar handleOpen={handleOpenLogin} isLoggedIn={isLoggedIn} />

        {/* Main Content */}
          <Component {...pageProps} router={router} /> {/* ✅ Pass Router Here */}
      </Box>

      {/* Login Modal */}
      <LoginModal open={isLoginOpen} handleClose={handleCloseLogin} />
    </ThemeProvider>
  );
}

// ✅ Fix by correctly typing the `_app.tsx` function
export default function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}> 
      <Provider store={store}>
        <MyAppComponent Component={Component} pageProps={pageProps} router={router} /> {/* ✅ Pass Router Here */}
      </Provider>
    </SessionProvider>
  );
}
