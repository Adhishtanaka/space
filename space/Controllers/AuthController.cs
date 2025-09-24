using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
   private readonly IAuthService _authService;
    private readonly IFollowService _followService;
    
    public AuthController(IAuthService authService, IFollowService followService)
    {
        _authService = authService;
        _followService = followService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var (success, error) = await _authService.RegisterAsync(request);
        if (!success)
            return BadRequest(new { message = error });
        return Ok(new { message = "User registered successfully" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var (success, token, error) = await _authService.LoginAsync(request);
        if (!success)
            return Unauthorized(new { message = error });
        return Ok(new AuthResponse { Token = token! });
    }

[HttpGet("user/{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var (success, userDetails, error) = await _authService.GetUserByIdAsync(id);
        if (!success || userDetails == null)
        {
            return NotFound(new { message = error ?? "User not found" });
        }
        
        var (followersSuccess, followers, followersError) = await _followService.GetFollowersAsync(id);
        var (followingSuccess, following, followingError) = await _followService.GetFollowingAsync(id);
        if (!followersSuccess && followersError != null)
        {
            return BadRequest(new { message = followersError });
        }
        if (!followingSuccess && followingError != null)
        {
            return BadRequest(new { message = followingError });
        }
        var enhancedUserData = new
        {
            User = userDetails,
            Followers = followersSuccess ? followers : null,
            Following = followingSuccess ? following : null,

        };

        return Ok(enhancedUserData);
    }

    [HttpGet("user")]
    public async Task<IActionResult> GetUserByEmail([FromQuery] string email)
    {
        var (success, userDetails, error) = await _authService.GetUserByEmailAsync(email);
        if (!success || userDetails == null)
        {
            return NotFound(new { message = error ?? "User not found" });
        }
        return Ok(userDetails);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var (success, users, error) = await _authService.GetAllUsersAsync();
        if (!success)
        {
            return BadRequest(new { message = error ?? "Failed to retrieve users" });
        }
        return Ok(users);
    }
}
