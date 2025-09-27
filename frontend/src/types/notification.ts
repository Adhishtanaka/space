import type { User } from "./user";

export interface NotificationHubProps {
    token: string;
    user: User;
    onNewPost: () => void;
}