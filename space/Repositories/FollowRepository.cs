using Microsoft.EntityFrameworkCore;

namespace space.Repositories
{
    public class FollowRepository : IFollowRepository
    {
        private readonly AppDbContext _db;

        public FollowRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<UserFollow?> GetFollowAsync(int followerId, int followedId)
        {
            return await _db.UserFollows
                .FirstOrDefaultAsync(uf => uf.FollowerId == followerId && uf.FollowedId == followedId);
        }

        public async Task<List<User>> GetFollowersWithDetailsAsync(int userId)
        {
            return await _db.UserFollows
                .Include(uf => uf.Follower)
                .Where(uf => uf.FollowedId == userId)
                .Select(uf => uf.Follower)
                .ToListAsync();
        }

        public async Task<List<User>> GetFollowingWithDetailsAsync(int userId)
        {
            return await _db.UserFollows
                .Include(uf => uf.Followed)
                .Where(uf => uf.FollowerId == userId)
                .Select(uf => uf.Followed)
                .ToListAsync();
        }

        public async Task<List<int>> GetFollowingIdsAsync(int userId)
        {
            return await _db.UserFollows
                .Where(uf => uf.FollowerId == userId)
                .Select(uf => uf.FollowedId)
                .ToListAsync();
        }

        public async Task<List<User>> GetSuggestedUsersAsync(int userId, List<int> excludeIds, int take)
        {
            return await _db.Users
                .Where(u => !excludeIds.Contains(u.Id))
                .Take(take)
                .ToListAsync();
        }

        public async Task<int> GetFollowersCountAsync(int userId)
        {
            return await _db.UserFollows.CountAsync(uf => uf.FollowedId == userId);
        }

        public async Task<int> GetFollowingCountAsync(int userId)
        {
            return await _db.UserFollows.CountAsync(uf => uf.FollowerId == userId);
        }

        public async Task<int> GetCurrentFollowCountAsync(int followerId)
        {
            return await _db.UserFollows.CountAsync(uf => uf.FollowerId == followerId);
        }

        public async Task AddFollowAsync(UserFollow follow)
        {
            await _db.UserFollows.AddAsync(follow);
            await _db.SaveChangesAsync();
        }

        public async Task RemoveFollowAsync(UserFollow follow)
        {
            _db.UserFollows.Remove(follow);
            await _db.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _db.SaveChangesAsync();
        }
    }
}