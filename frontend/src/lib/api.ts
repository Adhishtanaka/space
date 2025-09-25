import axios, { type AxiosRequestConfig } from "axios";
import type { LoginResponse } from "../types/auth";
import type { Post , PostVoteDto } from "../types/post";
import type { User, FollowUser ,EnhancedUserResponse} from "../types/user";
import type { UserGeo } from "../types/geo";

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
        gender: string;
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
        request<EnhancedUserResponse>(`/api/auth/user/${userId}`, { method: "GET" }, token),

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

    updatePost: (postId: number, content: string, token: string) =>
        request<Post>(
            `/api/post/${postId}`,
            { method: "PUT", data: { content } },
            token
        ),

    deletePost: (postId: number, token: string) =>
        request<void>(`/api/post/${postId}`, { method: "DELETE" }, token),

    updateGeoAndgetNearby: (geohash: string, token: string) =>
        request<UserGeo[]>(
            `/api/Geo/geohash?geohash=${encodeURIComponent(geohash)}`,
            { method: "POST" },
            token
        ),

    getPostVotes: (postId: number, token: string) =>
        request<PostVoteDto[]>(`/api/post/votes/${postId}`, { method: "GET" }, token),
};
