using Microsoft.EntityFrameworkCore;

public class LikeService
{
    private readonly AppDbContext _context;
    public LikeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Like>> GetAllLikesAsync()
    {
        return await _context.Likes.Include(l => l.User).Include(l => l.Thread).Include(l => l.Comment).ToListAsync();
    }

    public async Task<Like?> GetLikeByIdAsync(int id)
    {
        return await _context.Likes.Include(l => l.User).Include(l => l.Thread).Include(l => l.Comment).FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<Like> AddLikeAsync(Like like)
    {
        _context.Likes.Add(like);
        await _context.SaveChangesAsync();
        return like;
    }


    public async Task<bool> DeleteLikeAsync(int id)
    {
        var like = await _context.Likes.FindAsync(id);
        if (like == null) return false;
        _context.Likes.Remove(like);
        await _context.SaveChangesAsync();
        return true;
    }
}
