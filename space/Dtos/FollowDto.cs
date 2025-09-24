public class FollowRequest
{
    public int UserId { get; set; }
}

public class UserFollowDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Gender { get; set; } = null!;
    public bool IsFollowing { get; set; }
    public int FollowersCount { get; set; }
    public int FollowingCount { get; set; }
}

public interface IFollowService
{
    Task<(bool Success, string? ErrorMessage)> FollowUserAsync(int followerId, int followedId);
    Task<(bool Success, string? ErrorMessage)> UnfollowUserAsync(int followerId, int followedId);
    Task<(bool Success, List<UserFollowDto> Users, string? ErrorMessage)> GetFollowersAsync(int userId);
    Task<(bool Success, List<UserFollowDto> Users, string? ErrorMessage)> GetFollowingAsync(int userId);
    Task<(bool Success, List<UserFollowDto> Users, string? ErrorMessage)> GetSuggestedUsersAsync(int userId);

}