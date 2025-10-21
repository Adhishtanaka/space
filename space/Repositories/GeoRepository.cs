using Microsoft.EntityFrameworkCore;

public class GeoRepository : IGeoRepository
{
    private readonly AppDbContext _db;

    public GeoRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _db.Users.FindAsync(userId);
    }

    public async Task UpdateUserGeohashAsync(User user)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    public async Task<List<User>> GetUsersByGeohashPrefixAsync(int excludeUserId, string geohashPrefix)
    {
        return await _db.Users
            .Where(u =>
                u.Geohash != null &&
                u.Geohash.StartsWith(geohashPrefix) &&
                u.Id != excludeUserId)
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }
}