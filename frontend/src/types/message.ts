export interface MessageDto {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    sentAt: string;
}

export interface Conversation {
    userId: number;
    userName: string;
    lastMessage: MessageDto;
}

export interface MessageViewProps {
  currentChat: number | null;
  currentUserName: string;
  messages: MessageDto[];
  isConnected: boolean;
  error: string | null;
  onSendMessage: (message: string) => Promise<void>;
  isDark: boolean;
}

export interface MessageContactSidebarProps {
  conversations: Conversation[];
  currentChat: number | null;
  onLoadChat: (userId: number, userName?: string) => void;
  isConnected: boolean;
  connecting: boolean;
  isDark: boolean;
}