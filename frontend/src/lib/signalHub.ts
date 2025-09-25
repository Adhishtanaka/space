import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from "@microsoft/signalr";
import type { MessageDto, Conversation } from "../types/message";

export class SignalHubService {
  private connection: HubConnection | null = null;
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async connect(): Promise<HubConnection> {
    if (this.connection?.state === HubConnectionState.Connected) {
      return this.connection;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5106/chatHub", {
        accessTokenFactory: () => this.token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    await this.connection.start();
    return this.connection;
  }

  onReceiveMessage(callback: (message: MessageDto) => void): void {
    this.connection?.on("ReceiveMessage", callback);
  }

  onUserConversations(callback: (conversations: Conversation[]) => void): void {
    this.connection?.on("UserConversations", callback);
  }

  onReconnected(callback: (connectionId?: string) => void): void {
    this.connection?.onreconnected(callback);
  }

  onReconnecting(callback: () => void): void {
    this.connection?.onreconnecting(callback);
  }

  onClose(callback: (error?: Error) => void): void {
    this.connection?.onclose(callback);
  }

  async sendMessage(receiverId: number, content: string): Promise<void> {
    if (this.connection?.state !== HubConnectionState.Connected) {
      throw new Error("Connection not ready");
    }
    await this.connection.invoke("SendMessage", {
      ReceiverId: receiverId,
      Content: content,
    });
  }

  async getConversationHistory(userId: number): Promise<MessageDto[]> {
    if (this.connection?.state !== HubConnectionState.Connected) {
      throw new Error("Connection not ready");
    }
    return await this.connection.invoke("GetConversationHistory", userId);
  }

  async getUserConversations(): Promise<void> {
    if (this.connection?.state !== HubConnectionState.Connected) {
      throw new Error("Connection not ready");
    }
    await this.connection.invoke("GetUserConversations");
  }

  get state(): HubConnectionState | undefined {
    return this.connection?.state;
  }

  get isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  removeAllListeners(): void {
    this.connection?.off("ReceiveMessage");
    this.connection?.off("UserConversations");
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }
}