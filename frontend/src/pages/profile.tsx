
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../lib/useAuth";
import { api } from "../lib/api";
import type { Post, FollowUser, User } from "../lib/types";
import { UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/outline";


export default function Profile() {
    const { id } = useParams<{ id: string }>();
    const userId = Number(id);
    const { token, user, loading } = useAuth();
    const navigate = useNavigate();

    const [posts, setPosts] = useState<Post[]>([]);
    const [followers, setFollowers] = useState<FollowUser[]>([]);
    const [following, setFollowing] = useState<FollowUser[]>([]);
    const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
    const [userDetails, setUserDetails] = useState<User | null>(null);

    const isOwn = useMemo(() => user?.id === userId, [user?.id, userId]);

    useEffect(() => {
        if (!loading && !token) navigate("/login", { replace: true });
    }, [loading, token, navigate]);

    useEffect(() => {
        async function load() {
            if (!token) return;
            try {
                const [p, f1, f2 ,f3] = await Promise.all([
                    api.getUserPosts(userId, token),
                    api.userFollowers(userId, token),
                    api.userFollowing(userId, token),
                    api.getUserById(userId, token)
                ]);
                setPosts(p);
                setFollowers(f1);
                setFollowing(f2);
                setUserDetails(f3);
                const s = await api.isFollowing(userId, token);
                setIsFollowing(s.isFollowing);
            } catch (err: unknown) {
                console.error("Failed to load profile:", (err as Error)?.message);
            }
        }
        load();
    }, [token, userId, user]);

    async function toggleFollow() {
        if (!token) return;
        try {
            if (isFollowing) {
                await api.unfollow(userId, token);
                setIsFollowing(false);
            } else {
                await api.follow(userId, token);
                setIsFollowing(true);
            }
            // refresh counts
            const [f1, f2] = await Promise.all([
                api.userFollowers(userId, token),
                api.userFollowing(userId, token),
            ]);
            setFollowers(f1);
            setFollowing(f2);
        } catch (err: unknown) {
            console.error("Failed to toggle follow:", (err as Error)?.message);
        }
    }

    return (
        <div className="space-y-6">
            <section className="rounded border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">
                            {userDetails
                                ? `${userDetails.firstName} ${userDetails.lastName}`
                                : `User ${userId}`}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {userDetails && (
                                <>
                                    <span>{userDetails.email}</span>
                                    {userDetails.phoneNumber && (
                                        <span> • {userDetails.phoneNumber}</span>
                                    )}
                                </>
                            )}
                        </p>
                        <p className="text-sm text-gray-600">
                            Followers {followers.length} • Following {following.length}
                        </p>
                    </div>
                    {!isOwn && isFollowing !== null && (
                        <button
                            onClick={toggleFollow}
                            className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium border border-gray-300 ${isFollowing
                                ? "bg-white text-gray-900 hover:bg-gray-50"
                                : "bg-[#5296dd] text-white hover:bg-[#5296dd]/90"
                                }`}
                        >
                            {isFollowing ? (
                                <UserMinusIcon className="size-4" />
                            ) : (
                                <UserPlusIcon className="size-4" />
                            )}
                            {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    )}
                </div>
            </section>

            <section className="space-y-3">
                {posts.length === 0 ? (
                    <div className="text-center text-gray-600">No posts yet.</div>
                ) : (
                    posts.map((p) => (
                        <article
                            key={p.id}
                            className="rounded border border-gray-200 bg-white p-4"
                        >
                            <div className="mb-2 text-sm text-gray-500">
                                {new Date(p.createdAt).toLocaleString()}
                            </div>
                            <p className="whitespace-pre-wrap text-[15px]">{p.content}</p>
                            <div className="mt-3 text-sm text-gray-500">
                                 • Up {p.upVotes} • Down {p.downVotes}
                            </div>
                        </article>
                    ))
                )}
            </section>
        </div>
    );
}
