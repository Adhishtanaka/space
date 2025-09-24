public class UserGeoDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Geohash { get; set; } = null!;
    public string Gender { get; set; } = null!;
}

public interface IGeoService
{
    Task<(bool success, string? ErrorMessage)> UpdateGeohashAsync(int userId, string? geohash);
    Task<(bool Success, List<UserGeoDto> Users, string ErrorMessage)> GetUsersByGeohashAsync(int excludeUserId ,string? geohash);
}

