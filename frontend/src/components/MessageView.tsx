import { useEffect, useRef, useState, type FormEvent } from "react";
import type { MessageDto, MessageViewProps } from "../types/message";
import CharacterCounter from "./CharacterCounter";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const MESSAGE_LIMIT = 500;

export function MessageView({
  currentChat,
  currentUserName,
  messages,
  isConnected,
  error,
  onSendMessage,
  isDark
}: MessageViewProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(e: FormEvent) {
    e.preventDefault();
    if (!message.trim() || currentChat == null) return;
    
    try {
      await onSendMessage(message.trim());
      setMessage("");
    } catch (error) {
    }
  }

  const getSenderName = (msg: MessageDto): string => {
    if (currentChat !== null && msg.senderId !== currentChat) {
      return "You";
    }
    return currentUserName.split(' ')[0] || "User";
  };

  if (!currentChat) {
    return (
      <section className={cx(
        "rounded-2xl border flex flex-col min-h-[60vh]",
        isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"
      )}>
        <div className="flex-1 grid place-items-center text-sm p-8">
          <div className={cx(isDark ? "text-gray-400" : "text-gray-500")}>
            {isConnected ? "Select a conversation or start a new chat" : "Connecting to chat..."}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cx(
      "rounded-2xl border flex flex-col min-h-[60vh]",
      isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"
    )}>
      <div className={cx(
        "px-4 py-3 border-b flex items-center justify-between",
        isDark ? "border-gray-800" : "border-gray-200"
      )}>
        <div className={cx("font-semibold", isDark ? "text-white" : "text-gray-900")}>
          Chat with {currentUserName}
        </div>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const mine = currentChat !== null ? msg.senderId !== currentChat : false;
          return (
            <div key={msg.id} className={cx("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cx(
                "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                mine
                  ? "bg-gradient-to-br from-[#5296dd] to-[#92bddf] text-white"
                  : isDark
                    ? "bg-gray-800 text-gray-100"
                    : "bg-gray-100 text-gray-800"
              )}>
                <div className="opacity-70 text-[10px] mb-0.5">
                  {getSenderName(msg)}
                </div>
                <div>{msg.content}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className={cx("p-3 border-t", isDark ? "border-gray-800" : "border-gray-200")}>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!isConnected}
              maxLength={MESSAGE_LIMIT}
              className={cx(
                "w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2",
                !isConnected ? "opacity-50" : "",
                isDark
                  ? "bg-black border-gray-800 text-white placeholder:text-gray-500 focus:ring-[#92bddf]"
                  : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 focus:ring-[#5296dd]"
              )}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
            />
          </div>
          <CharacterCounter current={message.length} max={MESSAGE_LIMIT} isDark={isDark} />
          <button
            type="submit"
            disabled={!isConnected || !message.trim() || message.length > MESSAGE_LIMIT}
            className={cx(
              "px-4 py-2 rounded-xl text-white text-sm font-medium transition",
              !isConnected || !message.trim() || message.length > MESSAGE_LIMIT
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#5296dd] to-[#92bddf] hover:shadow-lg hover:scale-[1.02]"
            )}
          >
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
