
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

public class UpdatePostRequest
{
    public string Content { get; set; } = string.Empty;
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
}
public class PostService : IPostService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<NotificationHub> _hubContext;

    public PostService(AppDbContext db, IHubContext<NotificationHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
    }

    public async Task<(bool Success, PostDto? Post, string? ErrorMessage)> CreatePostAsync(int userId, CreatePostRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return (false, null, "Post content cannot be empty");

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return (false, null, "User not found");

        var post = new Post
        {
            Content = request.Content,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Posts.Add(post);
        await _db.SaveChangesAsync();

        // Load the post with user data for DTO conversion
        var createdPost = await _db.Posts
            .Include(p => p.User)
            .Include(p => p.Votes)
            .FirstOrDefaultAsync(p => p.Id == post.Id);

        var postDto = new PostDto
        {
            Id = createdPost!.Id,
            Content = createdPost.Content,
            CreatedAt = createdPost.CreatedAt,
            UserId = createdPost.UserId,
            UserFirstName = createdPost.User.FirstName,
            UserLastName = createdPost.User.LastName,
            UpVotes = createdPost.UpVotes,
            DownVotes = createdPost.DownVotes,
            TotalScore = createdPost.TotalScore,
            CurrentUserVote = null
        };

        // Send notification to followers
        var followers = await _db.UserFollows
            .Where(uf => uf.FollowedId == userId)
            .Select(uf => uf.FollowerId.ToString())
            .ToListAsync();

        if (followers.Any())
        {
            await _hubContext.Clients.Users(followers)
                .SendAsync("NewPost", postDto);
        }

        return (true, postDto, null);
    }


    public async Task<(bool Success, PostDto? Post, string? ErrorMessage)> UpdatePostAsync(int userId, int postId, UpdatePostRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return (false, null, "Post content cannot be empty");

        var post = await _db.Posts.Include(p => p.User).Include(p => p.Votes).FirstOrDefaultAsync(p => p.Id == postId);
        if (post == null)
            return (false, null, "Post not found");
        if (post.UserId != userId)
            return (false, null, "You are not authorized to update this post");

        post.Content = request.Content;
        await _db.SaveChangesAsync();

        var postDto = new PostDto
        {
            Id = post.Id,
            Content = post.Content,
            CreatedAt = post.CreatedAt,
            UserId = post.UserId,
            UserFirstName = post.User.FirstName,
            UserLastName = post.User.LastName,
            UpVotes = post.UpVotes,
            DownVotes = post.DownVotes,
            TotalScore = post.TotalScore,
            CurrentUserVote = GetUserVote(post.Votes, userId)
        };

        return (true, postDto, null);
    }


    public async Task<(bool Success, List<PostDto> Posts, string? ErrorMessage)> GetFeedAsync(int userId)
    {
        // Get posts from followed users and own posts
        var followedUserIds = await _db.UserFollows
            .Where(uf => uf.FollowerId == userId)
            .Select(uf => uf.FollowedId)
            .ToListAsync();

        followedUserIds.Add(userId); // Include own posts

        var posts = await _db.Posts
            .Include(p => p.User)
            .Include(p => p.Votes)
            .Where(p => followedUserIds.Contains(p.UserId))
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        var postDtos = posts.Select(p => new PostDto
        {
            Id = p.Id,
            Content = p.Content,
            CreatedAt = p.CreatedAt,
            UserId = p.UserId,
            UserFirstName = p.User.FirstName,
            UserLastName = p.User.LastName,
            UpVotes = p.UpVotes,
            DownVotes = p.DownVotes,
            TotalScore = p.TotalScore,
            CurrentUserVote = GetUserVote(p.Votes, userId)
        }).ToList();

        return (true, postDtos, null);
    }

    public async Task<(bool Success, List<PostDto> Posts, string? ErrorMessage)> GetUserPostsAsync(int userId, int currentUserId)
    {
        var posts = await _db.Posts
            .Include(p => p.User)
            .Include(p => p.Votes)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        var postDtos = posts.Select(p => new PostDto
        {
            Id = p.Id,
            Content = p.Content,
            CreatedAt = p.CreatedAt,
            UserId = p.UserId,
            UserFirstName = p.User.FirstName,
            UserLastName = p.User.LastName,
            UpVotes = p.UpVotes,
            DownVotes = p.DownVotes,
            TotalScore = p.TotalScore,
            CurrentUserVote = GetUserVote(p.Votes, currentUserId)
        }).ToList();

        return (true, postDtos, null);
    }

    public async Task<(bool Success, string? ErrorMessage)> VoteAsync(int userId, VoteRequest request)
    {
        var post = await _db.Posts.FindAsync(request.PostId);
        if (post == null)
            return (false, "Post not found");

        var existingVote = await _db.Votes
            .FirstOrDefaultAsync(v => v.UserId == userId && v.PostId == request.PostId);

        if (existingVote != null)
        {
            // Update existing vote
            existingVote.IsUpVote = request.IsUpVote;
        }
        else
        {
            // Create new vote
            var vote = new Vote
            {
                UserId = userId,
                PostId = request.PostId,
                IsUpVote = request.IsUpVote
            };
            _db.Votes.Add(vote);
        }

        await _db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool Success, string? ErrorMessage)> RemoveVoteAsync(int userId, int postId)
    {
        var vote = await _db.Votes
            .FirstOrDefaultAsync(v => v.UserId == userId && v.PostId == postId);

        if (vote == null)
            return (false, "Vote not found");

        _db.Votes.Remove(vote);
        await _db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool Success, string? ErrorMessage)> DeletePostAsync(int userId, int postId)
    {
        var post = await _db.Posts.Include(p => p.Votes).FirstOrDefaultAsync(p => p.Id == postId);
        if (post == null)
            return (false, "Post not found");
        if (post.UserId != userId)
            return (false, "You are not authorized to delete this post");

        // Remove votes associated with the post
        _db.Votes.RemoveRange(post.Votes);
        _db.Posts.Remove(post);
        await _db.SaveChangesAsync();
        return (true, null);
    }

    private bool? GetUserVote(ICollection<Vote> votes, int userId)
    {
        var userVote = votes.FirstOrDefault(v => v.UserId == userId);
        return userVote?.IsUpVote;
    }
}
