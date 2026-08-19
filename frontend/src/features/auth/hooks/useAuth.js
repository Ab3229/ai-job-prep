import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../service/auth.api";

export function useAuth() {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async ({ email, password }) => {
        setSubmitting(true);
        setError(null);
        try {
            const data = await login({ email, password });
            setUser(data.user ?? data);
            return data;
        } catch (err) {
            setError(err?.response?.data?.message || "Login failed");
            throw err;
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegister = async ({ username, email, password }) => {
        setSubmitting(true);
        setError(null);
        try {
            const data = await register({ username, email, password });
            setUser(data.user ?? data);
            return data;
        } catch (err) {
            setError(err?.response?.data?.message || "Registration failed");
            throw err;
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = async () => {
        setSubmitting(true);
        try {
            await logout();
            setUser(null);
            navigate("/login");
        } finally {
            setSubmitting(false);
        }
    };

    return { user, handleLogin, handleRegister, handleLogout, loading: submitting, error };
}