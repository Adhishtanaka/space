export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
}

export interface CreatePostProps {
    token: string;
    isDark: boolean;
    onPostCreated: (post: Post) => void;
}

export interface PostProps {
    post: Post;
    token: string;
    isDark: boolean;
    isOwner?: boolean;
    currentUserId?: number;
    onVoteChange: (updatedPost: Post) => void;
    onPostUpdate?: (updatedPost: Post) => void;
    onPostDelete?: (postId: number) => void;
}

export interface Post {
  id: number;
  content: string;
  createdAt: string;
  userFirstName: string;
  userLastName: string;
  upVotes: number;
  downVotes: number;
  totalScore: number;
  currentUserVote: boolean | null;
}

export interface FollowUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface LoginResponse {
  token: string;
}

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}
