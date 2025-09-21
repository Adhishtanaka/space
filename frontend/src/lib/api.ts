// Fetch user details by email
export async function getUserByEmail(email: string, token: string) {
    const res = await fetch(`/api/auth/user/${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch user details');
    return res.json();
}
import type { User, Post, FollowUser, LoginResponse } from "./types";

const BASE_URL = "http://localhost:5106";

async function request<T>(
    path: string,
    options: RequestInit = {},
    token?: string,
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        cache: "no-store",
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed: ${res.status}`);
    }
    if (res.status === 204) return undefined as unknown as T;
    return (await res.json()) as T;
}

// Auth
export const api = {
    register: (data: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        dateOfBirth: string;
        password: string;
    }) =>
        request<void>(`/api/auth/register`, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    login: (data: { email: string; password: string }) =>
        request<LoginResponse>(`/api/auth/login`, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getUserByEmail: (email: string, token: string) =>
        request<User>(
            `/api/auth/user?email=${encodeURIComponent(email)}`,
            { method: "GET" },
            token,
        ),

    getUserById: (userId: number, token: string) =>
        request<User>(
            `/api/auth/user/${userId}`,
            { method: "GET" },
            token,
        ),

    getAllUsers: (token: string) =>
        request<User[]>(`/api/auth/users`, { method: "GET" }, token),

    // Posts
    createPost: (content: string, token: string) =>
        request<Post>(
            `/api/post`,
            { method: "POST", body: JSON.stringify({ content }) },
            token,
        ),

    getFeed: (token: string) =>
        request<Post[]>(`/api/post/feed`, { method: "GET" }, token),

    getUserPosts: (userId: number, token: string) =>
        request<Post[]>(`/api/post/user/${userId}`, { method: "GET" }, token),

    vote: (postId: number, isUpVote: boolean, token: string) =>
        request<void>(
            `/api/post/vote`,
            { method: "POST", body: JSON.stringify({ postId, isUpVote }) },
            token,
        ),

    removeVote: (postId: number, token: string) =>
        request<void>(`/api/post/vote/${postId}`, { method: "DELETE" }, token),

    // Follow
    follow: (userId: number, token: string) =>
        request<void>(
            `/api/follow/follow`,
            { method: "POST", body: JSON.stringify({ userId }) },
            token,
        ),

    unfollow: (userId: number, token: string) =>
        request<void>(
            `/api/follow/unfollow`,
            { method: "POST", body: JSON.stringify({ userId }) },
            token,
        ),

    followers: (token: string) =>
        request<FollowUser[]>(`/api/follow/followers`, { method: "GET" }, token),

    following: (token: string) =>
        request<FollowUser[]>(`/api/follow/following`, { method: "GET" }, token),

    suggested: (token: string) =>
        request<FollowUser[]>(`/api/follow/suggested`, { method: "GET" }, token),

    isFollowing: (userId: number, token: string) =>
        request<{ isFollowing: boolean }>(
            `/api/follow/is-following/${userId}`,
            { method: "GET" },
            token,
        ),

    userFollowers: (userId: number, token: string) =>
        request<FollowUser[]>(
            `/api/follow/followers/${userId}`,
            { method: "GET" },
            token,
        ),

    userFollowing: (userId: number, token: string) =>
        request<FollowUser[]>(
            `/api/follow/following/${userId}`,
            { method: "GET" },
            token,
        ),
};
