using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

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

    [HttpGet("user/{email}")]
    public async Task<IActionResult> GetUserById(string email)
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
