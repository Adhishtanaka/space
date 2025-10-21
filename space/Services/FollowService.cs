using space.Repositories;

public class FollowService : IFollowService
{
    private readonly IFollowRepository _followRepository;
    private readonly IUserRepository _userRepository;
    private const int MAX_FOLLOWS = 50;

    public FollowService(IFollowRepository followRepository, IUserRepository userRepository)
    {
        _followRepository = followRepository;
        _userRepository = userRepository;
    }

    public async Task<(bool Success, string? ErrorMessage)> FollowUserAsync(int followerId, int followedId)
    {
        if (followerId == followedId)
            return (false, "Cannot follow yourself");

        var follower = await _userRepository.GetByIdAsync(followerId);
        var followed = await _userRepository.GetByIdAsync(followedId);

        if (follower == null || followed == null)
            return (false, "User not found");

        var existingFollow = await _followRepository.GetFollowAsync(followerId, followedId);

        if (existingFollow != null)
            return (false, "Already following this user");

        var currentFollowCount = await _followRepository.GetCurrentFollowCountAsync(followerId);

        if (currentFollowCount >= MAX_FOLLOWS)
            return (false, $"Cannot follow more than {MAX_FOLLOWS} users");

        var userFollow = new UserFollow
        {
            FollowerId = followerId,
            FollowedId = followedId
        };

        await _followRepository.AddFollowAsync(userFollow);
        await _followRepository.SaveChangesAsync();

        return (true, null);
    }

    public async Task<(bool Success, string? ErrorMessage)> UnfollowUserAsync(int followerId, int followedId)
    {
        var userFollow = await _followRepository.GetFollowAsync(followerId, followedId);

        if (userFollow == null)
            return (false, "Not following this user");

        await _followRepository.RemoveFollowAsync(userFollow);
        await _followRepository.SaveChangesAsync();

        return (true, null);
    }

    public async Task<(bool Success, List<UserFollowDto> Users, string? ErrorMessage)> GetFollowersAsync(int userId)
    {
        var followers = await _followRepository.GetFollowersWithDetailsAsync(userId);

        var followerDtos = new List<UserFollowDto>();
        foreach (var follower in followers)
        {
            var followersCount = await _followRepository.GetFollowersCountAsync(follower.Id);
            var followingCount = await _followRepository.GetFollowingCountAsync(follower.Id);

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
        var following = await _followRepository.GetFollowingWithDetailsAsync(userId);

        var followingDtos = new List<UserFollowDto>();
        foreach (var followed in following)
        {
            var followersCount = await _followRepository.GetFollowersCountAsync(followed.Id);
            var followingCount = await _followRepository.GetFollowingCountAsync(followed.Id);

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
        var followingIds = await _followRepository.GetFollowingIdsAsync(userId);
        followingIds.Add(userId);

        var suggestedUsers = await _followRepository.GetSuggestedUsersAsync(userId, followingIds, 20);

        var suggestedUserDtos = new List<UserFollowDto>();
        foreach (var user in suggestedUsers)
        {
            var followersCount = await _followRepository.GetFollowersCountAsync(user.Id);
            var followingCount = await _followRepository.GetFollowingCountAsync(user.Id);

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
