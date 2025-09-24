import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../lib/useAuth";
import { useTheme } from "../lib/useTheme";
import { api } from "../lib/api";
import type { Post, FollowUser, User } from "../lib/types";
import PostComponent from "../components/Post";
import FollowersModal from "../components/FollowersModal";
import {
    UserPlusIcon,
    UserMinusIcon,
    UserIcon,
} from "@heroicons/react/24/outline";

function classNames(...classes: (string | false | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function Profile() {
    const { id } = useParams<{ id: string }>();
    const userId = Number(id);
    const { token, user, loading } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [posts, setPosts] = useState<Post[]>([]);
    const [followers, setFollowers] = useState<FollowUser[]>([]);
    const [following, setFollowing] = useState<FollowUser[]>([]);
    const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
    const [userDetails, setUserDetails] = useState<User | null>(null);
    const [followLoading, setFollowLoading] = useState(false);
    
    // Modal states
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);

    const isOwn = useMemo(() => user?.id === userId, [user?.id, userId]);

    useEffect(() => {
        if (!loading && !token) navigate("/login", { replace: true });
    }, [loading, token, navigate]);

    useEffect(() => {
        async function load() {
            if (!token) return;
            try {
                const [posts, userResponse] = await Promise.all([
                    api.getUserPosts(userId, token),
                    api.getUserById(userId, token) 
                ]);

                setPosts(posts);
                setUserDetails(userResponse.user);
                setFollowers(userResponse.followers || []);
                setFollowing(userResponse.following || []);

                const followStatus = followers?.some(follower => follower.id === user?.id) || false;
                setIsFollowing(followStatus);
            } catch (err: unknown) {
                console.error("Failed to load profile:", (err as Error)?.message);
            }
        }
        load();
    }, [token, userId, user]);

    async function toggleFollow() {
        if (!token || followLoading) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await api.unfollow(userId, token);
                setIsFollowing(false);
            } else {
                await api.follow(userId, token);
                setIsFollowing(true);
            }
           const [userResponse] = await Promise.all([
                    api.getUserById(userId, token) 
                ]);
                setUserDetails(userResponse.user);
                setFollowers(userResponse.followers || []);
                setFollowing(userResponse.following || []);
        } catch (err: unknown) {
            console.error("Failed to toggle follow:", (err as Error)?.message);
        } finally {
            setFollowLoading(false);
        }
    }

    return (
        <div className={classNames(
            "min-h-screen transition-colors duration-200",
            isDark ? "bg-black" : "bg-gray-50"
        )}>
            <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
                {/* Profile Header */}
                <section className={classNames(
                    "rounded-2xl border p-6 transition-all duration-200",
                    isDark
                        ? "border-gray-800 bg-gray-900/50 backdrop-blur-sm"
                        : "border-gray-200 bg-white"
                )}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div
                                className={classNames(
                                    "size-20 rounded-2xl text-white grid place-items-center text-2xl font-bold shadow-lg",
                                    userDetails?.gender === "F"
                                        ? "bg-gradient-to-br from-pink-400 to-pink-600"
                                        : "bg-gradient-to-br from-[#5296dd] to-[#92bddf]"
                                )}
                            >
                                {userDetails?.firstName?.[0] || <UserIcon className="size-8" />}
                            </div>

                            {/* User Info */}
                            <div className="space-y-2">
                                <div>
                                    <h1 className={classNames(
                                        "text-2xl font-bold transition-colors duration-200",
                                        isDark ? "text-white" : "text-gray-900"
                                    )}>
                                        {userDetails
                                            ? `${userDetails.firstName} ${userDetails.lastName}`
                                            : `User ${userId}`}
                                    </h1>
                                    {userDetails && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {userDetails.email}
                                        </p>
                                    )}
                                </div>

                                {/* Stats - Now clickable */}
                                <div className="flex items-center gap-6 text-sm">
                                    <button
                                        onClick={() => setShowFollowersModal(true)}
                                        className={classNames(
                                            "transition-colors duration-200 hover:opacity-75",
                                            isDark ? "text-gray-300" : "text-gray-600"
                                        )}
                                    >
                                        <span className="font-semibold text-lg">{followers.length}</span>
                                        <span className="ml-1">Followers</span>
                                    </button>
                                    <button
                                        onClick={() => setShowFollowingModal(true)}
                                        className={classNames(
                                            "transition-colors duration-200 hover:opacity-75",
                                            isDark ? "text-gray-300" : "text-gray-600"
                                        )}
                                    >
                                        <span className="font-semibold text-lg">{following.length}</span>
                                        <span className="ml-1">Following</span>
                                    </button>
                                    <div className={classNames(
                                        "transition-colors duration-200",
                                        isDark ? "text-gray-300" : "text-gray-600"
                                    )}>
                                        <span className="font-semibold text-lg">{posts.length}</span>
                                        <span className="ml-1">Posts</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Follow Button */}
                        {!isOwn && isFollowing !== null && (
                            <button
                                onClick={toggleFollow}
                                disabled={followLoading}
                                className={classNames(
                                    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                                    "disabled:opacity-50",
                                    isFollowing
                                        ? isDark
                                            ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                        : "bg-gradient-to-r from-[#5296dd] to-[#92bddf] text-white hover:shadow-lg hover:scale-105"
                                )}
                            >
                                {isFollowing ? (
                                    <UserMinusIcon className="size-4" />
                                ) : (
                                    <UserPlusIcon className="size-4" />
                                )}
                                {followLoading
                                    ? "..."
                                    : isFollowing
                                        ? "Unfollow"
                                        : "Follow"
                                }
                            </button>
                        )}
                    </div>
                </section>

                {/* Posts */}
                <section className="space-y-4">
                    <h2 className={classNames(
                        "text-lg font-semibold transition-colors duration-200",
                        isDark ? "text-white" : "text-gray-900"
                    )}>
                        {isOwn ? "Your Posts" : "Posts"}
                    </h2>

                    {posts.length === 0 ? (
                        <div className={classNames(
                            "text-center py-12 rounded-2xl border transition-colors duration-200",
                            isDark
                                ? "border-gray-800 bg-gray-900/30 text-gray-400"
                                : "border-gray-200 bg-white text-gray-500"
                        )}>
                            <UserIcon className="size-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">No posts yet</p>
                            <p className="text-sm">
                                {isOwn ? "Create your first post to get started." : "This user hasn't posted anything yet."}
                            </p>
                        </div>
                    ) : (
                        posts.map((p) => (
                            <PostComponent
                                key={p.id}
                                post={p}
                                token={token || ""}
                                isDark={isDark}
                                isOwner={isOwn}
                                onVoteChange={() => { }}
                            />
                        ))
                    )}
                </section>
            </div>

            {/* Followers Modal */}
            <FollowersModal
                isOpen={showFollowersModal}
                onClose={() => setShowFollowersModal(false)}
                users={followers}
                title="Followers"
                isDark={isDark}
            />

            {/* Following Modal */}
            <FollowersModal
                isOpen={showFollowingModal}
                onClose={() => setShowFollowingModal(false)}
                users={following}
                title="Following"
                isDark={isDark}
            />
        </div>
    );
}