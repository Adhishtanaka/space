using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostController : ControllerBase
{
    private readonly IPostService _postService;

    public PostController(IPostService postService)
    {
        _postService = postService;
    }

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var (success, post, error) = await _postService.CreatePostAsync(userId.Value, request);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(post);
    }

    [HttpPut("{postId}")]
    public async Task<IActionResult> UpdatePost(int postId, [FromBody] UpdatePostRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var (success, post, error) = await _postService.UpdatePostAsync(userId.Value, postId, request);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(post);
    }

    [HttpGet("feed")]
    public async Task<IActionResult> GetFeed()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var (success, posts, error) = await _postService.GetFeedAsync(userId.Value);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(posts);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserPosts(int userId)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null)
            return Unauthorized();

        var (success, posts, error) = await _postService.GetUserPostsAsync(userId, currentUserId.Value);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(posts);
    }

    [HttpGet("votes/{postId}")]
    public async Task<IActionResult> GetPostVotes(int postId)
    {
        var (success, votes, error) = await _postService.GetPostVotesAsync(postId);

        if (!success)
            return BadRequest(new { message = error });

        return Ok(votes);
    }


    [HttpPost("vote")]
    public async Task<IActionResult> Vote([FromBody] VoteRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var (success, error) = await _postService.VoteAsync(userId.Value, request);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(new { message = "Vote recorded successfully" });
    }

    [HttpDelete("vote/{postId}")]
    public async Task<IActionResult> RemoveVote(int postId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var (success, error) = await _postService.RemoveVoteAsync(userId.Value, postId);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(new { message = "Vote removed successfully" });
    }

    [HttpDelete("{postId}")]
    public async Task<IActionResult> DeletePost(int postId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var (success, error) = await _postService.DeletePostAsync(userId.Value, postId);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(new { message = "Post deleted successfully" });
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
