namespace space.Repositories
{
    public interface IFollowRepository
    {
        Task<UserFollow?> GetFollowAsync(int followerId, int followedId);
        Task<List<User>> GetFollowersWithDetailsAsync(int userId);
        Task<List<User>> GetFollowingWithDetailsAsync(int userId);
        Task<List<int>> GetFollowingIdsAsync(int userId);
        Task<List<User>> GetSuggestedUsersAsync(int userId, List<int> excludeIds, int take);
        Task<int> GetFollowersCountAsync(int userId);
        Task<int> GetFollowingCountAsync(int userId);
        Task<int> GetCurrentFollowCountAsync(int followerId);
        Task AddFollowAsync(UserFollow follow);
        Task RemoveFollowAsync(UserFollow follow);
        Task SaveChangesAsync();
    }
}