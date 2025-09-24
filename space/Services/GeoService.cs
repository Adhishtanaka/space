using Microsoft.EntityFrameworkCore;

public class GeoService : IGeoService
{
    private readonly AppDbContext _db;

    public GeoService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(bool success, string? ErrorMessage)> UpdateGeohashAsync(int userId, string? geohash)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return (false, "User not found");

        user.Geohash = string.IsNullOrWhiteSpace(geohash) ? null : geohash;
        await _db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool Success, List<UserGeoDto> Users, string? ErrorMessage)> GetUsersByGeohashAsync(
         int excludeUserId, string geohash)
    {
        string geohashPrefix = geohash.Substring(0, 5);

        var users = await _db.Users
                .Where(u =>
                    u.Geohash != null &&
                    u.Geohash.StartsWith(geohashPrefix) &&
                    u.Id != excludeUserId)
                .ToListAsync();

        var userGeoDtos = users.Select(user => new UserGeoDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Geohash = user.Geohash.Substring(0, 5),
            Gender = user.Gender,
        }).ToList();

        return (true, userGeoDtos, null);
    }

}
