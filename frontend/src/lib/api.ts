import axios, { type AxiosRequestConfig } from "axios";
import type { User, Post, FollowUser, LoginResponse, UserGeo } from "./types";

const BASE_URL = "http://localhost:5106";

// Axios instance
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request wrapper
async function request<T>(
    path: string,
    options: AxiosRequestConfig = {},
    token?: string
): Promise<T> {
    try {
        const res = await apiClient.request<T>({
            url: path,
            ...options,
            headers: {
                ...(options.headers || {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
        return res.data;
    } catch (err: unknown) {
        let msg = "Request failed";
        if (axios.isAxiosError(err)) {
            msg =
                err.response?.data?.message ||
                err.response?.data ||
                err.message ||
                msg;
        } else if (err instanceof Error) {
            msg = err.message;
        }
        throw new Error(msg);
    }
}


// API methods
export const api = {
    // Auth
    register: (data: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        dateOfBirth: string;
        password: string;
    }) =>
        request<void>("/api/auth/register", {
            method: "POST",
            data,
        }),

    login: (data: { email: string; password: string }) =>
        request<LoginResponse>("/api/auth/login", {
            method: "POST",
            data,
        }),

    getUserByEmail: (email: string, token: string) =>
        request<User>(
            `/api/auth/user?email=${encodeURIComponent(email)}`,
            { method: "GET" },
            token
        ),

    getUserById: (userId: number, token: string) =>
        request<User>(`/api/auth/user/${userId}`, { method: "GET" }, token),

    getAllUsers: (token: string) =>
        request<User[]>(`/api/auth/users`, { method: "GET" }, token),

    // Posts
    createPost: (content: string, token: string) =>
        request<Post>(
            `/api/post`,
            { method: "POST", data: { content } },
            token
        ),

    getFeed: (token: string) =>
        request<Post[]>(`/api/post/feed`, { method: "GET" }, token),

    getUserPosts: (userId: number, token: string) =>
        request<Post[]>(`/api/post/user/${userId}`, { method: "GET" }, token),

    vote: (postId: number, isUpVote: boolean, token: string) =>
        request<void>(
            `/api/post/vote`,
            { method: "POST", data: { postId, isUpVote } },
            token
        ),

    removeVote: (postId: number, token: string) =>
        request<void>(`/api/post/vote/${postId}`, { method: "DELETE" }, token),

    // Follow
    follow: (userId: number, token: string) =>
        request<void>(
            `/api/follow/follow`,
            { method: "POST", data: { userId } },
            token
        ),

    unfollow: (userId: number, token: string) =>
        request<void>(
            `/api/follow/unfollow`,
            { method: "POST", data: { userId } },
            token
        ),

    followers: (token: string) =>
        request<FollowUser[]>(`/api/follow/followers`, { method: "GET" }, token),

    following: (token: string) =>
        request<FollowUser[]>(`/api/follow/following`, { method: "GET" }, token),

    suggestUsers: (token: string) =>
        request<FollowUser[]>(`/api/follow/suggested`, { method: "GET" }, token),

    isFollowing: (userId: number, token: string) =>
        request<{ isFollowing: boolean }>(
            `/api/follow/is-following/${userId}`,
            { method: "GET" },
            token
        ),

    userFollowers: (userId: number, token: string) =>
        request<FollowUser[]>(
            `/api/follow/followers/${userId}`,
            { method: "GET" },
            token
        ),

    userFollowing: (userId: number, token: string) =>
        request<FollowUser[]>(
            `/api/follow/following/${userId}`,
            { method: "GET" },
            token
        ),
    updatePost: (postId: number, content: string, token: string) =>
        request<Post>(
            `/api/post/${postId}`,
            { method: "PUT", data: { content } },
            token
        ),

    deletePost: (postId: number, token: string) =>
        request<void>(`/api/post/${postId}`, { method: "DELETE" }, token),

    updateGeohash: (geohash: string, token: string) =>
        request<void>(
            `/api/Auth/geohash?geohash=${encodeURIComponent(geohash)}`,
            { method: "POST" },
            token
        ),

    getNearbyUsers: (hash: string, token: string) =>
        request<UserGeo[]>(
            `/api/Auth/geohash/${encodeURIComponent(hash)}`,
            { method: "GET" },
            token
        ),
};
