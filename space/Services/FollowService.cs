using Microsoft.EntityFrameworkCore;

public class FollowService : IFollowService
{
    private readonly AppDbContext _db;
    private const int MAX_FOLLOWS = 50;

    public FollowService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(bool Success, string? ErrorMessage)> FollowUserAsync(int followerId, int followedId)
    {
        if (followerId == followedId)
            return (false, "Cannot follow yourself");

        var follower = await _db.Users.FindAsync(followerId);
        var followed = await _db.Users.FindAsync(followedId);

        if (follower == null || followed == null)
            return (false, "User not found");

        var existingFollow = await _db.UserFollows
            .FirstOrDefaultAsync(uf => uf.FollowerId == followerId && uf.FollowedId == followedId);

        if (existingFollow != null)
            return (false, "Already following this user");

        var currentFollowCount = await _db.UserFollows
            .CountAsync(uf => uf.FollowerId == followerId);

        if (currentFollowCount >= MAX_FOLLOWS)
            return (false, $"Cannot follow more than {MAX_FOLLOWS} users");

        var userFollow = new UserFollow
        {
            FollowerId = followerId,
            FollowedId = followedId
        };

        _db.UserFollows.Add(userFollow);
        await _db.SaveChangesAsync();

        return (true, null);
    }

    public async Task<(bool Success, string? ErrorMessage)> UnfollowUserAsync(int followerId, int followedId)
    {
        var userFollow = await _db.UserFollows
            .FirstOrDefaultAsync(uf => uf.FollowerId == followerId && uf.FollowedId == followedId);

        if (userFollow == null)
            return (false, "Not following this user");

        _db.UserFollows.Remove(userFollow);
        await _db.SaveChangesAsync();

        return (true, null);
    }

    public async Task<(bool Success, List<UserFollowDto> Users, string? ErrorMessage)> GetFollowersAsync(int userId)
    {
        var followers = await _db.UserFollows
            .Include(uf => uf.Follower)
            .Where(uf => uf.FollowedId == userId)
            .Select(uf => uf.Follower)
            .ToListAsync();

        var followerDtos = new List<UserFollowDto>();
        foreach (var follower in followers)
        {
            var followersCount = await _db.UserFollows.CountAsync(uf => uf.FollowedId == follower.Id);
            var followingCount = await _db.UserFollows.CountAsync(uf => uf.FollowerId == follower.Id);

            followerDtos.Add(new UserFollowDto
            {
                Id = follower.Id,
                FirstName = follower.FirstName,
                LastName = follower.LastName,
                Email = follower.Email,
                IsFollowing = false, 
                FollowersCount = followersCount,
                FollowingCount = followingCount
            });
        }

        return (true, followerDtos, null);
    }

    public async Task<(bool Success, List<UserFollowDto> Users, string? ErrorMessage)> GetFollowingAsync(int userId)
    {
        var following = await _db.UserFollows
            .Include(uf => uf.Followed)
            .Where(uf => uf.FollowerId == userId)
            .Select(uf => uf.Followed)
            .ToListAsync();

        var followingDtos = new List<UserFollowDto>();
        foreach (var followed in following)
        {
            var followersCount = await _db.UserFollows.CountAsync(uf => uf.FollowedId == followed.Id);
            var followingCount = await _db.UserFollows.CountAsync(uf => uf.FollowerId == followed.Id);

            followingDtos.Add(new UserFollowDto
            {
                Id = followed.Id,
                FirstName = followed.FirstName,
                LastName = followed.LastName,
                Email = followed.Email,
                IsFollowing = true,
                FollowersCount = followersCount,
                FollowingCount = followingCount
            });
        }

        return (true, followingDtos, null);
    }

    public async Task<(bool Success, List<UserFollowDto> Users, string? ErrorMessage)> GetSuggestedUsersAsync(int userId)
    {
        var followingIds = await _db.UserFollows
            .Where(uf => uf.FollowerId == userId)
            .Select(uf => uf.FollowedId)
            .ToListAsync();

        followingIds.Add(userId); 
        var suggestedUsers = await _db.Users
            .Where(u => !followingIds.Contains(u.Id))
            .Take(20) 
            .ToListAsync();

        var suggestedUserDtos = new List<UserFollowDto>();
        foreach (var user in suggestedUsers)
        {
            var followersCount = await _db.UserFollows.CountAsync(uf => uf.FollowedId == user.Id);
            var followingCount = await _db.UserFollows.CountAsync(uf => uf.FollowerId == user.Id);

            suggestedUserDtos.Add(new UserFollowDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Gender = user.Gender,
                IsFollowing = false,
                FollowersCount = followersCount,
                FollowingCount = followingCount
            });
        }

        return (true, suggestedUserDtos, null);
    }

}
