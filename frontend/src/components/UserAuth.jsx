import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            setLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode(storedToken);

            // optional expiry check
            if (decoded.exp * 1000 < Date.now()) {
                logout();
            } else {
                setUser(decoded);
                setToken(storedToken);
            }
        } catch {
            logout();
        }

        setLoading(false);
    }, []);

    const login = (jwt) => {
        const decoded = jwtDecode(jwt);
        localStorage.setItem("token", jwt);
        setToken(jwt);
        setUser(decoded);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
