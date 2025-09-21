import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../lib/useAuth";
import { useTheme } from "../lib/useTheme";

function classNames(...classes: (string | false | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function Home() {
    const { token } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) navigate("/feed", { replace: true });
    }, [token, navigate]);

    return (
        <div className={classNames(
            "min-h-screen flex items-center justify-center transition-colors duration-200",
            isDark ? "bg-black" : "bg-gray-50"
        )}>
            <div className="mx-auto max-w-4xl px-4 py-10 w-full">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="mx-auto mb-8 h-20 w-20 rounded-2xl bg-gradient-to-br from-[#5296dd] to-[#92bddf] text-white grid place-items-center text-3xl font-bold shadow-2xl">
                        S
                    </div>
                    <h1 className={classNames(
                        "text-5xl font-bold tracking-tight mb-4 transition-colors duration-200",
                        isDark ? "text-white" : "text-gray-900"
                    )}>
                        Welcome to Space
                    </h1>
                    <p className={classNames(
                        "text-xl leading-relaxed mb-8 max-w-2xl mx-auto transition-colors duration-200",
                        isDark ? "text-gray-300" : "text-gray-600"
                    )}>
                        A minimal social feed focused on meaningful connections. Share thoughts, engage with posts, and build your community.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <Link
                            to="/register"
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#5296dd] to-[#92bddf] text-white font-medium hover:shadow-xl hover:scale-105 transition-all duration-200"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/login"
                            className={classNames(
                                "px-8 py-3 rounded-xl border font-medium transition-all duration-200",
                                isDark
                                    ? "border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                            )}
                        >
                            Log In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}