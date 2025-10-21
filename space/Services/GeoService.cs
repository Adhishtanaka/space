public class GeoService : IGeoService
{
    private readonly IGeoRepository _geoRepository;

    public GeoService(IGeoRepository geoRepository)
    {
        _geoRepository = geoRepository;
    }

    public async Task<(bool success, string? ErrorMessage)> UpdateGeohashAsync(int userId, string? geohash)
    {
        var user = await _geoRepository.GetUserByIdAsync(userId);
        if (user is null)
            return (false, "User not found");

        user.Geohash = string.IsNullOrWhiteSpace(geohash) ? null : geohash;
        await _geoRepository.UpdateUserGeohashAsync(user);
        await _geoRepository.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool Success, List<UserGeoDto> Users, string ErrorMessage)> GetUsersByGeohashAsync(
         int excludeUserId, string? geohash)
    {
        if (string.IsNullOrWhiteSpace(geohash))
            return (false, new List<UserGeoDto>(), "Geohash is required");

        string geohashPrefix = geohash.Substring(0, 5);
        var users = await _geoRepository.GetUsersByGeohashPrefixAsync(excludeUserId, geohashPrefix);

        var userGeoDtos = users.Select(user => new UserGeoDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Geohash = user.Geohash?.Substring(0, 5) ?? string.Empty,
            Gender = user.Gender,
        }).ToList();

        return (true, userGeoDtos, string.Empty);
    }

}
