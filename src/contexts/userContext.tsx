import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

interface User {
  name: string;
  email: string;
  role: string;
  userId: string;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  loading: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    role: "",
    userId: ""
  });
  
  const [loading, setLoading] = useState<boolean>(true);

  // Logout function
  const logout = () => {
    sessionStorage.removeItem("auth_token");
    setUser({ name: "", email: "", role: "", userId: "" });
  };

  // Check for existing token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = sessionStorage.getItem("auth_token");
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        
        // Validate token with backend
        const response = await axios.get(`${BACKEND_URL}/users/profile`, {
          headers: {
            Authorization: token
          }
        });

        if (response.data) {
          const { name, email, role, id } = response.data;
          setUser({ 
            name: name || "", 
            email: email || "", 
            role: role?.code || "", 
            userId: id || "" 
          });
        }
      } catch (error: any) {
        console.error("❌ Token validation failed:", error);
        console.error("Error response:", error.response?.data);
        
        // Only clear token if it's actually invalid (401/403), not network errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
        } else {
          // Keep the token but set user as empty (will retry on next page load)
          setUser({ name: "", email: "", role: "", userId: "" });
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export { UserProvider, useUser };