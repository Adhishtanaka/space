using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[Authorize]
public class ChatHub : Hub
{
    private readonly AppDbContext _context;

    public ChatHub(AppDbContext context)
    {
        _context = context;
    }
    public async Task GetUserConversations()
    {
        var senderIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(senderIdStr, out var senderId))
            throw new HubException("Unauthorized");

        // Get all users that the current user has exchanged messages with
        var conversationUserIds = await _context.Messages
            .Where(m => m.SenderId == senderId || m.ReceiverId == senderId)
            .Select(m => m.SenderId == senderId ? m.ReceiverId : m.SenderId)
            .Distinct()
            .ToListAsync();

        var conversations = new List<object>();

        foreach (var userId in conversationUserIds)
        {
            var user = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new { u.Id, u.FirstName, u.LastName })
                .FirstOrDefaultAsync();

            if (user != null)
            {
                // Get the last message between current user and this user
                var lastMessage = await _context.Messages
                    .Where(m => (m.SenderId == senderId && m.ReceiverId == userId) ||
                               (m.SenderId == userId && m.ReceiverId == senderId))
                    .OrderByDescending(m => m.SentAt)
                    .Select(m => new { m.Content, m.SentAt })
                    .FirstOrDefaultAsync();

                conversations.Add(new
                {
                    UserId = user.Id,
                    UserName = $"{user.FirstName} {user.LastName}",
                    LastMessage = new { 
                        Content = lastMessage?.Content ?? "", 
                        SentAt = lastMessage?.SentAt ?? DateTime.MinValue 
                    }
                });
            }
        }

        await Clients.Caller.SendAsync("UserConversations", conversations);
    }

    public async Task<List<MessageDto>> GetConversationHistory(int otherUserId)
    {
        var senderIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(senderIdStr, out var senderId))
            throw new HubException("Unauthorized");

        var messages = await _context.Messages
            .Where(m => (m.SenderId == senderId && m.ReceiverId == otherUserId) ||
                        (m.SenderId == otherUserId && m.ReceiverId == senderId))
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        return messages.Select(m => new MessageDto
        {
            Id = m.Id,
            Content = m.Content,
            SentAt = m.SentAt,
            SenderId = m.SenderId,
            ReceiverId = m.ReceiverId
        }).ToList();
    }

    public override async Task OnConnectedAsync()
    {
        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out var userId))
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.ConnectionId = Context.ConnectionId;
                await _context.SaveChangesAsync();
                await Clients.Others.SendAsync("UserConnected", userId.ToString());
            }
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out var userId))
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.ConnectionId = null;
                await _context.SaveChangesAsync();
                await Clients.Others.SendAsync("UserDisconnected", userId.ToString());
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(SendMessageDto messageDto)
    {
        var senderIdStr = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(senderIdStr, out var senderId))
            throw new HubException("Unauthorized");

        var receiver = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == messageDto.ReceiverId);

        if (receiver == null)
            throw new HubException("Receiver not found");

        var message = new Message
        {
            Content = messageDto.Content,
            SenderId = senderId,
            ReceiverId = messageDto.ReceiverId,
            SentAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        var messageToSend = new MessageDto
        {
            Id = message.Id,
            Content = message.Content,
            SentAt = message.SentAt,
            SenderId = message.SenderId,
            ReceiverId = message.ReceiverId
        };

        // Send to sender
        await Clients.Caller.SendAsync("ReceiveMessage", messageToSend);

        // Send to receiver if online
        if (!string.IsNullOrEmpty(receiver.ConnectionId))
        {
            await Clients.Client(receiver.ConnectionId)
                .SendAsync("ReceiveMessage", messageToSend);
        }
    }
}