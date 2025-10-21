using Microsoft.AspNetCore.SignalR;
using space.Repositories;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepository;
    private readonly IFollowRepository _followRepository;
    private readonly IHubContext<NotificationHub> _hubContext;

    public PostService(IPostRepository postRepository, IFollowRepository followRepository, IHubContext<NotificationHub> hubContext)
    {
        _postRepository = postRepository;
        _followRepository = followRepository;
        _hubContext = hubContext;
    }

    public async Task<(bool Success, PostDto? Post, string? ErrorMessage)> CreatePostAsync(int userId, CreatePostRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return (false, null, "Post content cannot be empty");

        var post = new Post
        {
            Content = request.Content,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _postRepository.CreateAsync(post);
        var createdPost = await _postRepository.GetByIdAsync(post.Id, includeRelations: true);

        if (createdPost == null)
            return (false, null, "Failed to create post");

        var postDto = new PostDto
        {
            Id = createdPost.Id,
            Content = createdPost.Content,
            CreatedAt = createdPost.CreatedAt,
            UserId = createdPost.UserId,
            UserFirstName = createdPost.User.FirstName,
            UserLastName = createdPost.User.LastName,
            UpVotes = createdPost.UpVotes,
            DownVotes = createdPost.DownVotes,
            CurrentUserVote = null
        };

        var followers = await _followRepository.GetFollowersWithDetailsAsync(userId);

        if (followers.Any() && NotificationThrottler.ShouldNotify())
        {
            var notification = new
            {
                hasNewPost = true,
                authorName = $"{createdPost.User.FirstName} {createdPost.User.LastName}",
                timestamp = DateTime.UtcNow
            };

            foreach (var follower in followers)
            {
                await _hubContext.Clients.User(follower.Id.ToString())
                    .SendAsync("NewPostNotification", notification);
            }
        }

        return (true, postDto, null);
    }

    public async Task<(bool Success, PostDto? Post, string? ErrorMessage)> UpdatePostAsync(int userId, int postId, UpdatePostRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return (false, null, "Post content cannot be empty");

        var post = await _postRepository.GetByIdAsync(postId, includeRelations: true);
        if (post == null)
            return (false, null, "Post not found");
        if (post.UserId != userId)
            return (false, null, "You are not authorized to update this post");

        post.Content = request.Content;
        await _postRepository.SaveChangesAsync();

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
        var followedUserIds = await _followRepository.GetFollowingIdsAsync(userId);
        followedUserIds.Add(userId);

        var posts = await _postRepository.GetFeedPostsAsync(followedUserIds);

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
        var posts = await _postRepository.GetUserPostsAsync(userId);

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
        var post = await _postRepository.GetByIdAsync(request.PostId);
        if (post == null)
            return (false, "Post not found");

        var existingVote = await _postRepository.GetVoteAsync(userId, request.PostId);

        if (existingVote != null)
        {
            existingVote.IsUpVote = request.IsUpVote;
            await _postRepository.UpdateVoteAsync(existingVote);
        }
        else
        {
            var vote = new Vote
            {
                UserId = userId,
                PostId = request.PostId,
                IsUpVote = request.IsUpVote
            };
            await _postRepository.AddVoteAsync(vote);
        }

        return (true, null);
    }

    public async Task<(bool Success, string? ErrorMessage)> RemoveVoteAsync(int userId, int postId)
    {
        var vote = await _postRepository.GetVoteAsync(userId, postId);

        if (vote == null)
            return (false, "Vote not found");

        await _postRepository.RemoveVoteAsync(vote);
        return (true, null);
    }

    public async Task<(bool Success, string? ErrorMessage)> DeletePostAsync(int userId, int postId)
    {
        var post = await _postRepository.GetByIdAsync(postId, includeRelations: true);
        if (post == null)
            return (false, "Post not found");
        if (post.UserId != userId)
            return (false, "You are not authorized to delete this post");

        await _postRepository.DeleteVotesAsync(post.Votes);
        await _postRepository.DeleteAsync(post);
        return (true, null);
    }

    private bool? GetUserVote(ICollection<Vote> votes, int userId)
    {
        var userVote = votes.FirstOrDefault(v => v.UserId == userId);
        return userVote?.IsUpVote;
    }

    public async Task<(bool Success, List<PostVoteDto> Votes, string? ErrorMessage)> GetPostVotesAsync(int postId)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        if (post == null)
            return (false, new List<PostVoteDto>(), "Post not found");

        var votes = await _postRepository.GetPostVotesAsync(postId);

        var voteDtos = votes.Select(v => new PostVoteDto
        {
            UserFirstName = v.User.FirstName,
            UserLastName = v.User.LastName,
            UserEmail = v.User.Email,
            UserGender = v.User.Gender,
            VoteType = v.IsUpVote ? "UpVote" : "DownVote"
        }).ToList();

        return (true, voteDtos, null);
    }
}