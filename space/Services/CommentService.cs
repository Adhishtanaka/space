using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

public class CommentService
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;
    public CommentService(AppDbContext context, IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<List<Comment>> GetAllCommentsAsync()
    {
        return await _context.Comments.Include(c => c.User).Include(c => c.Likes).Include(c => c.Replies).ToListAsync();
    }

    public async Task<Comment?> GetCommentByIdAsync(int id)
    {
        return await _context.Comments.Include(c => c.User).Include(c => c.Likes).Include(c => c.Replies).FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Comment> AddCommentAsync(Comment comment)
    {
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();
        await TryNotifyClients();
        return comment;
    }

    public async Task<bool> UpdateCommentAsync(Comment comment)
    {
        var existing = await _context.Comments.FindAsync(comment.Id);
        if (existing == null) return false;
        existing.Content = comment.Content;
        await _context.SaveChangesAsync();
        await TryNotifyClients();
        return true;
    }

    public async Task<bool> DeleteCommentAsync(int id)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null) return false;
        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
        await TryNotifyClients();
        return true;
    }

    public async Task<object> GetAllCommentsWithUserContextAsync(ClaimsPrincipal user)
    {
        var comments = await GetAllCommentsAsync();
        var userId = GetUserIdFromClaims(user);

        return comments.Select(c => new
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
        });
    }

    public async Task<object?> GetCommentWithUserContextAsync(int id, ClaimsPrincipal user)
    {
        var comment = await GetCommentByIdAsync(id);
        if (comment == null) return null;

        var userId = GetUserIdFromClaims(user);

        return new
        {
            comment.Id,
            comment.Content,
            comment.CreatedAt,
            comment.UserId,
            comment.User,
            LikeCount = comment.Likes?.Count ?? 0,
            LikedByCurrentUser = userId.HasValue && (comment.Likes?.Any(l => l.UserId == userId.Value) ?? false),
            comment.ParentCommentId,
            comment.Replies
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
