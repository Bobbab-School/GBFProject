import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
    username: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API = import.meta.env.VITE_API_URL;
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

// Restore user from localStorage on page load
useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }
}, []);

const login = async (username: string, password: string) => {
    const res = await fetch(`${API}api/db/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Login failed");
    }

    const data = await res.json();
    if (!data || !data.username) {
        throw new Error("Invalid response from server");
    }

    const loggedInUser = {
        username: data.username,
        token: data.token,
    };

    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
};

const logout = () => {
    // Clear localStorage
    localStorage.removeItem("user");
    setUser(null);
};

return (
    <AuthContext.Provider value={{ user, login, logout }}>
        {children}
    </AuthContext.Provider>
);

}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
