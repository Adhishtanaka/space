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

