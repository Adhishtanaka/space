using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FollowController : ControllerBase
{
    private readonly IFollowService _followService;

    public FollowController(IFollowService followService)
    {
        _followService = followService;
    }

    [HttpPost("follow")]
    public async Task<IActionResult> FollowUser([FromBody] FollowRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var (success, error) = await _followService.FollowUserAsync(userId.Value, request.UserId);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(new { message = "User followed successfully" });
    }

    [HttpPost("unfollow")]
    public async Task<IActionResult> UnfollowUser([FromBody] FollowRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var (success, error) = await _followService.UnfollowUserAsync(userId.Value, request.UserId);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(new { message = "User unfollowed successfully" });
    }

    [HttpGet("followers")]
    public async Task<IActionResult> GetFollowers()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var (success, followers, error) = await _followService.GetFollowersAsync(userId.Value);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(followers);
    }

    [HttpGet("following")]
    public async Task<IActionResult> GetFollowing()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var (success, following, error) = await _followService.GetFollowingAsync(userId.Value);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(following);
    }

    [HttpGet("suggested")]
    public async Task<IActionResult> GetSuggestedUsers()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var (success, suggested, error) = await _followService.GetSuggestedUsersAsync(userId.Value);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(suggested);
    }

    [HttpGet("followers/{userId}")]
    public async Task<IActionResult> GetUserFollowers(int userId)
    {
        var (success, followers, error) = await _followService.GetFollowersAsync(userId);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(followers);
    }

    [HttpGet("following/{userId}")]
    public async Task<IActionResult> GetUserFollowing(int userId)
    {
        var (success, following, error) = await _followService.GetFollowingAsync(userId);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(following);
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
