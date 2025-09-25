public class RegisterRequest
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = null!;
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

public class UserDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Gender { get; set; } = null!;
    public DateTime DateOfBirth { get; set; }
    public ICollection<int> FollowedUsers { get; set; } = new List<int>();
}

public interface IAuthService
{
    Task<(bool Success, string? ErrorMessage)> RegisterAsync(RegisterRequest request);
    Task<(bool Success, string? Token, string? ErrorMessage)> LoginAsync(LoginRequest request);
    Task<(bool Success, UserDto? UserDetails, string? ErrorMessage)> GetUserByEmailAsync(string email);
    Task<(bool Success, UserDto? UserDetails, string? ErrorMessage)> GetUserByIdAsync(int userId);
    Task<(bool Success, List<UserDto> Users, string? ErrorMessage)> GetAllUsersAsync();
}
