using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

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
            CurrentUserVote = null
        };

        var followers = await _db.UserFollows
            .Where(uf => uf.FollowedId == userId)
            .Select(uf => uf.FollowerId)
            .ToListAsync();

        if (followers.Any() && NotificationThrottler.ShouldNotify())
        {
            var notification = new
            {
                hasNewPost = true,
                authorName = $"{createdPost.User.FirstName} {createdPost.User.LastName}",
                timestamp = DateTime.UtcNow
            };

            foreach (var followerId in followers)
            {
                await _hubContext.Clients.User(followerId.ToString())
                    .SendAsync("NewPostNotification", notification);
            }
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
            CurrentUserVote = GetUserVote(post.Votes, userId)
        };

        return (true, postDto, null);
    }

    public async Task<(bool Success, List<PostDto> Posts, string? ErrorMessage)> GetFeedAsync(int userId)
    {
        var followedUserIds = await _db.UserFollows
            .Where(uf => uf.FollowerId == userId)
            .Select(uf => uf.FollowedId)
            .ToListAsync();

        followedUserIds.Add(userId);

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
            UserGender = p.User.Gender,
            UpVotes = p.UpVotes,
            DownVotes = p.DownVotes,
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
            UserGender = p.User.Gender,
            UpVotes = p.UpVotes,
            DownVotes = p.DownVotes,
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
            existingVote.IsUpVote = request.IsUpVote;
        }
        else
        {
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
    
    public async Task<(bool Success, List<PostVoteDto> Votes, string? ErrorMessage)> GetPostVotesAsync(int postId)
    {
        var post = await _db.Posts.FindAsync(postId);
        if (post == null)
            return (false, new List<PostVoteDto>(), "Post not found");

        var votes = await _db.Votes
            .Include(v => v.User)
            .Where(v => v.PostId == postId)
            .Select(v => new PostVoteDto
            {
                UserFirstName = v.User.FirstName,
                UserLastName = v.User.LastName,
                UserEmail = v.User.Email,
                UserGender = v.User.Gender,
                VoteType = v.IsUpVote ? "UpVote" : "DownVote"
            })
            .ToListAsync();

        return (true, votes, null);
    }
}