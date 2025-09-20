using Microsoft.EntityFrameworkCore;

public class CommentService
{
    private readonly AppDbContext _context;
    public CommentService(AppDbContext context)
    {
        _context = context;
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
        return comment;
    }

    public async Task<bool> UpdateCommentAsync(Comment comment)
    {
        var existing = await _context.Comments.FindAsync(comment.Id);
        if (existing == null) return false;
        existing.Content = comment.Content;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteCommentAsync(int id)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null) return false;
        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
        return true;
    }
}
