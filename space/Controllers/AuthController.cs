using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService)
    {
        _authService = authService;
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
        return Ok(userDetails);
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

    [HttpPost("geohash")]
    public async Task<IActionResult> UpdateGeohash([FromQuery] string? geohash)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var (success, error) = await _authService.UpdateGeohashAsync(userId.Value, geohash);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(new { message = "Geohash updated successfully" });
    }

    [HttpGet("geohash/{hash}")]
    public async Task<IActionResult> GetUserByGeohash(string hash)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var (success, usergeoDetails, error) = await _authService.GetUsersByGeohashAsync(userId.Value, hash);
        if (!success)
            return BadRequest(new { message = error });

        return Ok(usergeoDetails);
    }


    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
