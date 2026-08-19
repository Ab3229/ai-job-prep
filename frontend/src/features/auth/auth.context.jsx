import { createContext, useState, useEffect } from 'react';
import { me } from './service/auth.api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // App load hote hi check karo user already logged in hai ya nahi
    useEffect(() => {
        (async () => {
            try {
                const data = await me();
                setUser(data.user ?? data);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};