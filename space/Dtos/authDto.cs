using System.Security.Claims;

public class RegisterRequest
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Password { get; set; } = null!;
}

public class LoginRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class AuthResponse
{
    public string Token { get; set; } = null!;
}

public interface IAuthService
{
    Task<(bool Success, User? User, string? ErrorMessage)> GetProfileAsync(ClaimsPrincipal userPrincipal);
    Task<(bool Success, string? ErrorMessage)> RegisterAsync(RegisterRequest request);
    Task<(bool Success, string? Token, string? ErrorMessage)> LoginAsync(LoginRequest request);
}
