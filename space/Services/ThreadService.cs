using Microsoft.EntityFrameworkCore;

public class ThreadService
{
    private readonly AppDbContext _context;
    public ThreadService(AppDbContext context)
    {
        _context = context;
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
        return thread;
    }

    public async Task<bool> UpdateThreadAsync(Thread thread)
    {
        var existing = await _context.Threads.FindAsync(thread.Id);
        if (existing == null) return false;
        existing.Title = thread.Title;
        existing.Description = thread.Description;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteThreadAsync(int id)
    {
        var thread = await _context.Threads.FindAsync(id);
        if (thread == null) return false;
        _context.Threads.Remove(thread);
        await _context.SaveChangesAsync();
        return true;
    }
}
