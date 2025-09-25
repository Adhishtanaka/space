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

    public string UserGender { get; set; } = null!;
    public int UpVotes { get; set; }
    public int DownVotes { get; set; }
    public bool? CurrentUserVote { get; set; }
}

public class VoteRequest
{
    public int PostId { get; set; }
    public bool IsUpVote { get; set; }
}

public class UpdatePostRequest
{
    public string Content { get; set; } = string.Empty;
}

public class PostVoteDto
{
    public string UserFirstName { get; set; } = null!;
    public string UserLastName { get; set; } = null!;
    public string UserEmail { get; set; } = null!;
    public string UserGender { get; set; } = null!;
    public string VoteType { get; set; } = null!; // "UpVote" or "DownVote"
}

public interface IPostService
{
    Task<(bool Success, PostDto? Post, string? ErrorMessage)> CreatePostAsync(int userId, CreatePostRequest request);
    Task<(bool Success, List<PostDto> Posts, string? ErrorMessage)> GetFeedAsync(int userId);
    Task<(bool Success, List<PostDto> Posts, string? ErrorMessage)> GetUserPostsAsync(int userId, int currentUserId);
    Task<(bool Success, string? ErrorMessage)> VoteAsync(int userId, VoteRequest request);
    Task<(bool Success, string? ErrorMessage)> RemoveVoteAsync(int userId, int postId);
    Task<(bool Success, string? ErrorMessage)> DeletePostAsync(int userId, int postId);
    Task<(bool Success, PostDto? Post, string? ErrorMessage)> UpdatePostAsync(int userId, int postId, UpdatePostRequest request);

    Task<(bool Success, List<PostVoteDto> Votes, string? ErrorMessage)> GetPostVotesAsync(int postId);
}
