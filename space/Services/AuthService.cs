using Microsoft.EntityFrameworkCore;

using System.Security.Claims;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly JwtConfig _jwtConfig;

    public AuthService(AppDbContext db, JwtConfig jwtConfig)
    {
        _db = db;
        _jwtConfig = jwtConfig;
    }

    public async Task<(bool Success, User? User, string? ErrorMessage)> GetProfileAsync(ClaimsPrincipal userPrincipal)
    {
        var userIdClaim = userPrincipal.Claims.FirstOrDefault(c => c.Type == "id" || c.Type.EndsWith("/nameidentifier"));
        if (userIdClaim == null)
            return (false, null, "Unauthorized");

        if (!int.TryParse(userIdClaim.Value, out int userId))
            return (false, null, "Unauthorized");

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return (false, null, "User not found");
        return (true, user, null);
    }

    public async Task<(bool Success, string? ErrorMessage)> RegisterAsync(RegisterRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return (false, "Email already in use");

        var role = request.Email.EndsWith("@Space.com") ? "Admin" : "User";

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Role = role,
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