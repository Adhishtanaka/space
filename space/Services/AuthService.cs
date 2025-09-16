using Microsoft.EntityFrameworkCore;

public interface IAuthService
{
    Task<(bool Success, string? ErrorMessage)> RegisterAsync(RegisterRequest request);
    Task<(bool Success, string? Token, string? ErrorMessage)> LoginAsync(LoginRequest request);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly JwtConfig _jwtConfig;

    public AuthService(AppDbContext db, JwtConfig jwtConfig)
    {
        _db = db;
        _jwtConfig = jwtConfig;
    }

    public async Task<(bool Success, string? ErrorMessage)> RegisterAsync(RegisterRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return (false, "Email already in use");

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool Success, string? Token, string? ErrorMessage)> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return (false, null, "Invalid credentials");

        var token = _jwtConfig.GenerateToken(user);
        return (true, token, null);
    }
}