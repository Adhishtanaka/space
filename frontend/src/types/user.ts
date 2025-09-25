export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
}

export interface FollowUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
}

export interface EnhancedUserResponse {
  user: User;
  followers: FollowUser[] | null;
  following: FollowUser[] | null;
}
