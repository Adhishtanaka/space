using Microsoft.EntityFrameworkCore;

public class PostRepository : IPostRepository
{
    private readonly AppDbContext _db;

    public PostRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Post?> GetByIdAsync(int postId, bool includeRelations = false)
    {
        if (includeRelations)
        {
            return await _db.Posts
                .Include(p => p.User)
                .Include(p => p.Votes)
                .FirstOrDefaultAsync(p => p.Id == postId);
        }
        return await _db.Posts.FindAsync(postId);
    }

    public async Task<Post> CreateAsync(Post post)
    {
        _db.Posts.Add(post);
        await SaveChangesAsync();
        return post;
    }

    public async Task<List<Post>> GetFeedPostsAsync(List<int> userIds)
    {
        return await _db.Posts
            .Include(p => p.User)
            .Include(p => p.Votes)
            .Where(p => userIds.Contains(p.UserId))
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Post>> GetUserPostsAsync(int userId)
    {
        return await _db.Posts
            .Include(p => p.User)
            .Include(p => p.Votes)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Vote?> GetVoteAsync(int userId, int postId)
    {
        return await _db.Votes
            .FirstOrDefaultAsync(v => v.UserId == userId && v.PostId == postId);
    }

    public async Task AddVoteAsync(Vote vote)
    {
        _db.Votes.Add(vote);
        await SaveChangesAsync();
    }

    public async Task UpdateVoteAsync(Vote vote)
    {
        _db.Votes.Update(vote);
        await SaveChangesAsync();
    }

    public async Task RemoveVoteAsync(Vote vote)
    {
        _db.Votes.Remove(vote);
        await SaveChangesAsync();
    }

    public async Task<List<Vote>> GetPostVotesAsync(int postId)
    {
        return await _db.Votes
            .Include(v => v.User)
            .Where(v => v.PostId == postId)
            .ToListAsync();
    }

    public async Task DeleteAsync(Post post)
    {
        _db.Posts.Remove(post);
        await SaveChangesAsync();
    }

    public async Task DeleteVotesAsync(IEnumerable<Vote> votes)
    {
        _db.Votes.RemoveRange(votes);
        await SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }
}