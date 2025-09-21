public class CreatePostRequest
{
    public string Content { get; set; } = null!;
}

public class PostDto
{
    public int Id { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public int UserId { get; set; }
    public string UserFirstName { get; set; } = null!;
    public string UserLastName { get; set; } = null!;
    public int UpVotes { get; set; }
    public int DownVotes { get; set; }
    public int TotalScore { get; set; }
    public bool? CurrentUserVote { get; set; } // null = no vote, true = upvote, false = downvote
}

public class VoteRequest
{
    public int PostId { get; set; }
    public bool IsUpVote { get; set; }
}

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

    Task<bool> IsFollowingAsync(int followerId, int followedId);
}
