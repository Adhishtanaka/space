export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
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
