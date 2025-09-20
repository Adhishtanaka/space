using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

public class ThreadService
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;
    public ThreadService(AppDbContext context, IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<List<Thread>> GetAllThreadsAsync()
    {
        return await _context.Threads.Include(t => t.User).Include(t => t.Comments).Include(t => t.Likes).ToListAsync();
    }

    public async Task<Thread?> GetThreadByIdAsync(int id)
    {
        return await _context.Threads.Include(t => t.User).Include(t => t.Comments).Include(t => t.Likes).FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Thread> AddThreadAsync(Thread thread)
    {
        _context.Threads.Add(thread);
        await _context.SaveChangesAsync();
        await TryNotifyClients();
        return thread;
    }

    public async Task<bool> UpdateThreadAsync(Thread thread)
    {
        var existing = await _context.Threads.FindAsync(thread.Id);
        if (existing == null) return false;
        existing.Title = thread.Title;
        existing.Description = thread.Description;
        await _context.SaveChangesAsync();
        await TryNotifyClients();
        return true;
    }

    public async Task<bool> DeleteThreadAsync(int id)
    {
        var thread = await _context.Threads.FindAsync(id);
        if (thread == null) return false;
        _context.Threads.Remove(thread);
        await _context.SaveChangesAsync();
        await TryNotifyClients();
        return true;
    }

    public async Task<object> GetAllThreadsWithUserContextAsync(ClaimsPrincipal user)
    {
        var threads = await GetAllThreadsAsync();
        var userId = GetUserIdFromClaims(user);

        return threads.Select(t => new
        {
            t.Id,
            t.Title,
            t.Description,
            t.CreatedAt,
            t.UserId,
            t.User,
            LikeCount = t.Likes?.Count ?? 0,
            LikedByCurrentUser = userId.HasValue && (t.Likes?.Any(l => l.UserId == userId.Value) ?? false),
            CommentCount = t.Comments?.Count ?? 0
        });
    }

    public async Task<object?> GetThreadWithUserContextAsync(int id, ClaimsPrincipal user)
    {
        var thread = await GetThreadByIdAsync(id);
        if (thread == null) return null;

        var userId = GetUserIdFromClaims(user);

        return new
        {
            thread.Id,
            thread.Title,
            thread.Description,
            thread.CreatedAt,
            thread.UserId,
            thread.User,
            LikeCount = thread.Likes?.Count ?? 0,
            LikedByCurrentUser = userId.HasValue && (thread.Likes?.Any(l => l.UserId == userId.Value) ?? false),
            CommentCount = thread.Comments?.Count ?? 0,
            Comments = thread.Comments?.Select(c => new
            {
                c.Id,
                c.Content,
                c.CreatedAt,
                c.UserId,
                c.User,
                LikeCount = c.Likes?.Count ?? 0,
                LikedByCurrentUser = userId.HasValue && (c.Likes?.Any(l => l.UserId == userId.Value) ?? false),
                c.ParentCommentId,
                c.Replies
            })
        };
    }

    private int? GetUserIdFromClaims(ClaimsPrincipal user)
    {
        if (user.Identity?.IsAuthenticated != true) return null;

        var userIdClaim = user.Claims.FirstOrDefault(c => c.Type == "id" || c.Type.EndsWith("/nameidentifier"));
        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int uid))
            return uid;

        return null;
    }

    private async Task TryNotifyClients()
    {
        if (NotificationThrottler.ShouldNotify())
        {
            await _hubContext.Clients.All.SendAsync("ShouldRefresh", true);
        }
    }
}
