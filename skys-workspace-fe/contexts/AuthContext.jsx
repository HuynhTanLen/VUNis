import { createContext, useState, useEffect } from 'react';
import { loginUser as loginAPI, register as registerAPI, getMe, logoutUser as logoutAPI } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await getMe();
                setUser(userData);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, []);

    const login = async (email, password) => {
        const data = await loginAPI({ email, password });
        setUser(data.user);
        return data;
    };

    const register = async (name, email, password) => {
        const data = await registerAPI({ name, email, password });
        return data;
    };

    const logout = async () => {
        try {
            await logoutAPI();
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
