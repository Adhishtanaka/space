import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { api } from "./api";
import type { AuthUser, LoginResponse } from "./types";
// useAuth hook moved to useAuth.ts for react-refresh compliance

import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // hydrate from localStorage
    useEffect(() => {
        const t = localStorage.getItem("space_token");
        const u = localStorage.getItem("space_user");
        if (t) setToken(t);
        if (u) setUser(JSON.parse(u));
        setLoading(false);
    }, []);

    // persist
    useEffect(() => {
        if (token) localStorage.setItem("space_token", token);
        else localStorage.removeItem("space_token");
    }, [token]);
    useEffect(() => {
        if (user) localStorage.setItem("space_user", JSON.stringify(user));
        else localStorage.removeItem("space_user");
    }, [user]);

    const doLogin = useCallback(async (email: string, password: string) => {
        setLoading(true);
        try {
            const res: LoginResponse = await api.login({ email, password });
            setToken(res.token);
            // fetch user by email to get id and names
            const u = await api.getUserByEmail(email, res.token);
            setUser({
                id: u.id,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const doRegister = useCallback(
        async (data: {
            firstName: string;
            lastName: string;
            email: string;
            phoneNumber: string;
            dateOfBirth: string;
            password: string;
        }) => {
            setLoading(true);
            try {
                await api.register(data);
                // auto login after register
                await doLogin(data.email, data.password);
            } finally {
                setLoading(false);
            }
        },
        [doLogin],
    );

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            login: doLogin,
            register: doRegister,
            logout,
        }),
        [user, token, loading, doLogin, doRegister, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
