import { useContext } from "react";
import { AuthContext } from "../lib/AuthContext";
import type { AuthContextType } from "../types/auth";

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}