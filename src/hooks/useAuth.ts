import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { RootState } from "@/store/store";

export const useAuth = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return { isLoggedIn: isClient && !!token, user: isClient ? user : null };
};
