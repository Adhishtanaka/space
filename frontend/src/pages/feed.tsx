import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../lib/useAuth";
import { useTheme } from "../lib/useTheme";
import { api } from "../lib/api";
import type { FollowUser, Post } from "../lib/types";
import { SparklesIcon } from "@heroicons/react/24/solid";
import SuggestedSidebar from "../components/SuggestedSidebar";
import PostComponent from "../components/Post";
import CreatePost from "../components/CreatePost";

function classNames(...classes: (string | false | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function Feed() {
    const { token, loading } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [feed, setFeed] = useState<Post[]>([]);
    const [suggested, setSuggested] = useState<FollowUser[]>([]);
    const [showSuggested, setShowSuggested] = useState(false);
    const authed = useMemo(() => !!token, [token]);

    useEffect(() => {
        if (!loading && !authed) navigate("/login", { replace: true });
    }, [authed, loading, navigate]);

    useEffect(() => {
        async function load() {
            if (!token) return;
            try {
                const data = await api.getFeed(token);
                setFeed(data);
            } catch {
                // ignore
            }
        }
        load();
    }, [token]);

    useEffect(() => {
        async function loadSuggested() {
            if (!token) return;
            try {
                const users = await api.suggestUsers(token);
                setSuggested(users);
            } catch {
                // ignore
            }
        }
        loadSuggested();
    }, [token]);

    return (
        <div
            className={classNames(
                "min-h-screen transition-colors duration-200",
                isDark ? "bg-black" : "bg-gray-50"
            )}
        >
            <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col md:flex-row gap-8">
                {/* Main Feed */}
                <div className={classNames(
                    "space-y-6 transition-all duration-300",
                    showSuggested ? "flex-1" : "flex-1 md:max-w-2xl md:mx-auto"
                )}>
                    {/* Create Post */}
                    <CreatePost
                        token={token || ""}
                        isDark={isDark}
                        onPostCreated={(newPost) =>
                            setFeed((f) => [newPost, ...f])
                        }
                    />

                    {/* Feed */}
                    <section className="space-y-4">
                        {feed.length === 0 ? (
                            <div
                                className={classNames(
                                    "text-center py-12 rounded-2xl border transition-colors duration-200",
                                    isDark
                                        ? "border-gray-800 bg-gray-900/30 text-gray-400"
                                        : "border-gray-200 bg-white text-gray-500"
                                )}
                            >
                                <SparklesIcon className="size-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium mb-2">
                                    No posts yet
                                </p>
                                <p className="text-sm">
                                    Follow people or create your first post to
                                    get started.
                                </p>
                            </div>
                        ) : (
                            [...feed]
                                .sort(
                                    (a, b) =>
                                        (b.totalScore ?? 0) -
                                        (a.totalScore ?? 0)
                                )
                                .map((post) => (
                                    <PostComponent
                                        key={post.id}
                                        post={post}
                                        token={token || ""}
                                        isDark={isDark}
                                        onVoteChange={(updatedPost) => {
                                            setFeed((items) =>
                                                items.map((item) =>
                                                    item.id === updatedPost.id
                                                        ? updatedPost
                                                        : item
                                                )
                                            );
                                        }}
                                    />
                                ))
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <SuggestedSidebar
                    showSuggested={showSuggested}
                    setShowSuggested={setShowSuggested}
                    suggested={suggested}
                    isDark={isDark}
                />
            </div>
        </div>
    );
}