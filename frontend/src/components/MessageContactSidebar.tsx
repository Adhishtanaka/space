import { useEffect, useState } from "react";
import type { FollowUser } from "../types/user";
import type { MessageContactSidebarProps } from "../types/message";
import { api } from "../lib/api";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function MessageContactSidebar({
  conversations,
  currentChat,
  onLoadChat,
  isConnected,
  connecting,
  isDark
}: MessageContactSidebarProps) {
  const [allUsers, setAllUsers] = useState<FollowUser[]>([]);

  useEffect(() => {
    async function loadFollowers() {
      try {
        const token = localStorage.getItem("space_token");
        if (!token) return;
        const data: FollowUser[] = await api.followers(token);
        setAllUsers(data);
      } catch(error) {
      
      }
    }
    loadFollowers();
  }, []);

  return (
    <section className={cx(
      "rounded-2xl border overflow-hidden",
      isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"
    )}>
      <div className={cx(
        "px-4 py-3 border-b text-sm font-semibold",
        isDark ? "border-gray-800 text-white" : "border-gray-200 text-gray-900"
      )}>
        Conversations
        {connecting && (
          <span className={cx("ml-2 text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
            Connecting…
          </span>
        )}
        {!isConnected && !connecting && (
          <span className="ml-2 text-xs text-red-500">Disconnected</span>
        )}
        {isConnected && <span className="ml-2 text-xs text-green-500">Connected</span>}
      </div>

      <div className="max-h-[32rem] overflow-y-auto divide-y">
        {conversations.length === 0 && (
          <div className={cx("p-4 text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
            No conversations yet
          </div>
        )}
        {conversations.map((conv) => (
          <button
            key={conv.userId}
            onClick={() => onLoadChat(conv.userId)}
            disabled={!isConnected}
            className={cx(
              "w-full text-left p-4 transition md:transition-none",
              !isConnected ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 focus:bg-gray-50",
              isDark ? "hover:bg-gray-800/60 focus:bg-gray-800/60 text-gray-200" : "text-gray-800",
              currentChat === conv.userId && (isDark ? "bg-gray-800/80" : "bg-gray-100")
            )}
          >
            <div className="font-medium">{conv.userName}</div>
            <div className={cx("text-sm line-clamp-1", isDark ? "text-gray-400" : "text-gray-500")}>
              {conv.lastMessage.content}
            </div>
          </button>
        ))}
      </div>

      {/* Start new chat */}
      <div className={cx("border-t p-4", isDark ? "border-gray-800" : "border-gray-200")}>
        <div className={cx("font-semibold mb-2 text-sm", isDark ? "text-white" : "text-gray-900")}>
          Start Chat
        </div>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {allUsers
            .filter((u) => !conversations.some((c) => c.userId === u.id))
            .map((user) => (
              <button
                key={user.id}
                onClick={() => onLoadChat(user.id, `${user.firstName} ${user.lastName}`)}
                disabled={!isConnected}
                className={cx(
                  "text-left p-2 border rounded-lg",
                  !isConnected ? "opacity-50 cursor-not-allowed" : "",
                  isDark
                    ? "border-gray-800 hover:bg-gray-800/60 text-gray-200"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                )}
              >
                {user.firstName} {user.lastName}
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}