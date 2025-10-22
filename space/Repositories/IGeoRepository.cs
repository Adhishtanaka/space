public interface IGeoRepository
{
    Task<User?> GetUserByIdAsync(int userId);
    Task UpdateUserGeohashAsync(User user);
    Task<List<User>> GetUsersByGeohashPrefixAsync(int excludeUserId, string geohashPrefix);
    Task SaveChangesAsync();
}