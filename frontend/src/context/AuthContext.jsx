import { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Verify Authentication on Load
    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Hits your GET /auth/status endpoint
                const response = await API.get('/auth/status');
                if (response.data.is_authenticated) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error("Auth verification failed:", error);
                localStorage.removeItem('token'); // Clear invalid token
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // 2. Login Function
    const login = async (email, password) => {
        // Hits your POST /auth/login endpoint
        const response = await API.post('/auth/login', { email, password });
        const { token, user_id } = response.data;

        localStorage.setItem('token', token);
        
        // After login, fetch the full user details using the status check
        const statusRes = await API.get('/auth/status');
        setUser(statusRes.data.user);
        return response.data;
    };

    // 3. Register Function
    const register = async (username, email, password) => {
        // Hits your POST /auth/register endpoint
        const response = await API.post('/auth/register', { username, email, password });
        const { token } = response.data;

        localStorage.setItem('token', token);
        
        const statusRes = await API.get('/auth/status');
        setUser(statusRes.data.user);
        return response.data;
    };

    // 4. Logout Function
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy access in components
export const useAuth = () => useContext(AuthContext);