import { useEffect, useMemo, useState } from "react";
import type { Conversation, MessageDto } from "../types/message";
import { useTheme } from "../hooks/useTheme";
import { SignalHubService } from "../lib/ChatSignalHub";
import { MessageContactSidebar } from "../components/MessageContactSidebar";
import { MessageView } from "../components/MessageView";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function MessagePage() {
  const { isDark } = useTheme();
  const [hubService, setHubService] = useState<SignalHubService | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [currentChat, setCurrentChat] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize SignalR connection
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("space_token") || "" : "";
    const service = new SignalHubService(token);
    
    let mounted = true;

    async function setupConnection() {
      try {
        await service.connect();
        
        if (!mounted) return;
        
        setConnecting(false);
        setError(null);
        setHubService(service);

        service.onReceiveMessage((msg: MessageDto) => {
          setMessages((prev) => {
            const belongsToCurrentChat = currentChat && 
              (msg.senderId === currentChat || msg.receiverId === currentChat);
            return belongsToCurrentChat ? [...prev, msg] : prev;
          });
        });

        service.onUserConversations((convs: Conversation[]) => {
          const mappedConversations: Conversation[] = convs.map(conv => ({
            userId: conv.userId,
            userName: conv.userName,
            lastMessage: {
              id: 0,
              senderId: 0,
              receiverId: 0,
              content: conv.lastMessage.content,
              sentAt: conv.lastMessage.sentAt
            }
          }));
          setConversations(mappedConversations);
        });

        // Connection event handlers
        service.onReconnected(async () => {
          setError(null);
          setConnecting(false);
          
          if (service.isConnected) {
            try {
              await service.getUserConversations();
            } catch (error) {
              // Reconnection error handled silently
            }
          }
        });

        service.onReconnecting(() => {
          setConnecting(true);
          setError("Reconnecting...");
        });
        
        service.onClose((error) => {
          setConnecting(false);
          setHubService(null);
          if (error) {
            setError("Connection lost. Attempting to reconnect...");
          }
        });

        // Get initial conversations
        if (service.isConnected) {
          await service.getUserConversations();
        }

      } catch (error) {
        if (mounted) {
          setConnecting(false);
          setError(error instanceof Error ? error.message : "Failed to connect to chat.");
        }
      }
    }

    setupConnection();

    return () => {
      mounted = false;
      service.removeAllListeners();
      service.disconnect().catch(() => {
        // Cleanup error handled silently
      });
    };
  }, []);

  // Update message handler when currentChat changes
  useEffect(() => {
    if (!hubService) return;

    hubService.onReceiveMessage((msg: MessageDto) => {
      setMessages((prev) => {
        const belongsToCurrentChat = currentChat && 
          (msg.senderId === currentChat || msg.receiverId === currentChat);
        return belongsToCurrentChat ? [...prev, msg] : prev;
      });
    });
  }, [hubService, currentChat]);

  async function handleSendMessage(message: string): Promise<void> {
    if (!hubService || currentChat == null) {
      throw new Error("Connection not ready");
    }
    
    if (!hubService.isConnected) {
      setError("Connection not ready. Please wait and try again.");
      throw new Error("Connection not ready");
    }

    try {
      await hubService.sendMessage(currentChat, message);
      setError(null);
    } catch (error) {
      const errorMessage = "Failed to send message. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async function loadChat(userId: number, userName?: string): Promise<void> {
    if (!hubService || !hubService.isConnected) {
      setError("Connection not ready. Please wait and try again.");
      return;
    }

    setCurrentChat(userId);
    setMessages([]);
    setError(null);

    if (userName && !conversations.find((c) => c.userId === userId)) {
      setConversations((prev) => [...prev, { 
        userId, 
        userName, 
        lastMessage: { 
          id: 0, 
          senderId: 0, 
          receiverId: 0, 
          content: "", 
          sentAt: new Date().toISOString() 
        } 
      }]);
    }

    try {
      const history: MessageDto[] = await hubService.getConversationHistory(userId);
      setMessages(history || []);
    } catch (error) {
      setError("Failed to load chat history.");
    }
  }

  const currentUserName = useMemo(
    () => conversations.find((c) => c.userId === currentChat)?.userName || "User",
    [conversations, currentChat]
  );

  const isConnected = hubService?.isConnected ?? false;

  return (
    <div className={cx(
      "min-h-screen w-full transition-colors duration-200",
      isDark ? "bg-black" : "bg-gray-50"
    )}>
      <main className="mx-auto max-w-6xl px-4 py-4 md:py-8 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 md:gap-6">
        <MessageContactSidebar
          conversations={conversations}
          currentChat={currentChat}
          onLoadChat={loadChat}
          isConnected={isConnected}
          connecting={connecting}
          isDark={isDark}
        />
        
        <MessageView
          currentChat={currentChat}
          currentUserName={currentUserName}
          messages={messages}
          isConnected={isConnected}
          error={error}
          onSendMessage={handleSendMessage}
          isDark={isDark}
        />
      </main>
    </div>
  );
}