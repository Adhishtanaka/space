export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
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
  userId: number;
  userFirstName: string;
  userLastName: string;
  userGender: string;
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
  gender: string;
}

export interface EnhancedUserResponse {
  user: User;
  followers: FollowUser[] | null;
  following: FollowUser[] | null;
}

export interface LoginResponse {
  token: string;
}

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
}

export interface UserGeo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  geohash?: string;
  gender: string; 
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
    gender: string;
  }) => Promise<void>;
  logout: () => void;
}

export interface Friend {
  id: string | number;
  name: string;
  gender: string;
  email:string;
  lat: number;
  lng: number;
}

export interface MapControlsProps {
  updateLocation: () => void;
  loading: boolean;
  geoError: string | null;
  friends: Array<{ id: string | number; name: string; lat: number; lng: number }>;
  isDark: boolean;
}

export interface MapViewProps {
  mounted: boolean;
  activeTheme: string;
  tileConfig: { attribution: string; url: string };
  center: { lat: number; lng: number };
  mapRef: React.MutableRefObject<L.Map | null>;
  hasLocation: boolean;
  user: { firstName?: string,gender?:string } | null;
  friends: Friend[];
  isDark: boolean;
}

export interface PostVoteDto {
    userFirstName: string;
    userLastName: string;
    userEmail: string;
    userGender: string;
    voteType: string;
}

export interface VotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: number;
    token: string;
    isDark: boolean;
}
