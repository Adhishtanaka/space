import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { api } from "../lib/api";
import type { FollowUser } from "../types/user";
import type { Post } from "../types/post";
import { SparklesIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import SuggestedSidebar from "../components/SuggestedSidebar";
import PostComponent from "../components/Post";
import CreatePost from "../components/CreatePost";
import * as signalR from "@microsoft/signalr";
import RefreshNotification from "../components/RefreshBar";

function classNames(...classes: (string | false | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function Feed() {
    const { token, loading, user } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [feed, setFeed] = useState<Post[]>([]);
    const [suggested, setSuggested] = useState<FollowUser[]>([]);
    const [showSuggested, setShowSuggested] = useState(false);
    const [showRefresh, setShowRefresh] = useState(false);
    const [, setConnection] = useState<signalR.HubConnection | null>(null);
    const [isLoadingFeed, setIsLoadingFeed] = useState(false);

    const authed = useMemo(() => !!token, [token]);

    useEffect(() => {
        if (!loading && !authed) navigate("/login", { replace: true });
    }, [authed, loading, navigate]);

    useEffect(() => {
        if (!token || !user) return;

        const hubUrl = `http://localhost:5106/notificationHub`;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        const startConnection = async () => {
            try {
                await newConnection.start();
                const userId = user.id.toString();
                await newConnection.invoke("JoinUserGroup", userId);

                newConnection.on("NewPostNotification", (notification) => {
                    if (notification.hasNewPost) {
                        setShowRefresh(true);
                    }
                });

                setConnection(newConnection);
            } catch (err) {
                console.error("SignalR Connection Error:", err);
            }
        };

        startConnection();

        return () => {
            if (newConnection) {
                newConnection.stop();
            }
        };
    }, [token, user]);

    // Load initial feed
    const loadFeed = async () => {
        if (!token) return;
        try {
            setIsLoadingFeed(true);
            const data = await api.getFeed(token);
            setFeed(data);
        } catch {
            // ignore
        } finally {
            setIsLoadingFeed(false);
        }
    };

    useEffect(() => {
        loadFeed();
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

    const handleRefresh = async () => {
        setShowRefresh(false);
        await loadFeed();
    };

    const handleNewPostCreated = (newPost: Post) => {
        setFeed((f) => [newPost, ...f]);
        if (showRefresh) {
            setShowRefresh(false);
        }
    };

    return (
        <div
            className={classNames(
                "min-h-screen transition-colors duration-200",
                isDark ? "bg-black" : "bg-gray-50"
            )}
        >
            {/* Refresh Notification */}
            <RefreshNotification
                show={showRefresh}
                onRefresh={handleRefresh}
                isDark={isDark}
            />

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
                        onPostCreated={handleNewPostCreated}
                    />

                    {/* Feed */}
                    <section className="space-y-4">
                        {isLoadingFeed && feed.length === 0 ? (
                            <div
                                className={classNames(
                                    "text-center py-12 rounded-2xl border transition-colors duration-200",
                                    isDark
                                        ? "border-gray-800 bg-gray-900/30 text-gray-400"
                                        : "border-gray-200 bg-white text-gray-500"
                                )}
                            >
                                <ArrowPathIcon className="size-8 mx-auto mb-4 opacity-50 animate-spin" />
                                <p className="text-lg font-medium">
                                    Loading posts...
                                </p>
                            </div>
                        ) : feed.length === 0 ? (
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
                                .sort((a, b) => {
                                    const aTotal = a.upVotes + a.downVotes;
                                    const bTotal = b.upVotes + b.downVotes;

                                    if (aTotal >= 10 && bTotal >= 10) {
                                        return (b.upVotes - b.downVotes) - (a.upVotes - a.downVotes);
                                    }

                                    if (aTotal < 10 && bTotal < 10) {
                                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                                    }

                                    return aTotal >= 10 ? -1 : 1;
                                })
                                .map((post) => (
                                    <PostComponent
                                        key={post.id}
                                        post={post}
                                        token={token || ""}
                                        isDark={isDark}
                                        onVoteChange={(updatedPost) => {
                                            setFeed((items) =>
                                                items.map((item) =>
                                                    item.id === updatedPost.id ? updatedPost : item
                                                )
                                            );
                                        }}
                                    />
                                )))}


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