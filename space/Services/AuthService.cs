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

    public async Task<(bool Success, UserDto? UserDetails, string? ErrorMessage)> GetUserByEmailAsync(string email)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return (false, null, "User not found");

        var userDto = new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            DateOfBirth = user.DateOfBirth,
        };

        return (true, userDto, null);
    }

    public async Task<(bool Success, UserDto? UserDetails, string? ErrorMessage)> GetUserByIdAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return (false, null, "User not found");

        var userDto = new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            DateOfBirth = user.DateOfBirth,
        };

        return (true, userDto, null);
    }

    public async Task<(bool Success, List<UserDto> Users, string? ErrorMessage)> GetAllUsersAsync()
    {
        var users = await _db.Users.ToListAsync();
        var userDtos = users.Select(user => new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            DateOfBirth = user.DateOfBirth,
        }).ToList();
        return (true, userDtos, null);
    }

    public async Task<(bool success, string? ErrorMessage)> UpdateGeohashAsync(int userId, string? geohash)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return (false, "User not found");

        user.Geohash = string.IsNullOrWhiteSpace(geohash) ? null : geohash;
        await _db.SaveChangesAsync();
        return (true, null);
    }

public async Task<(bool Success, List<UserGeoDto> Users, string? ErrorMessage)> GetUsersByGeohashAsync(
     int excludeUserId,string geohash)
{
    string geohashPrefix = geohash.Substring(0, 5);

    var users = await _db.Users
        .Where(u => u.Geohash.StartsWith(geohashPrefix) && u.Id != excludeUserId)
        .ToListAsync();

    var userGeoDtos = users.Select(user => new UserGeoDto
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email,
        Geohash = user.Geohash.Substring(0,5)
    }).ToList();

    return (true, userGeoDtos, null);
}

}
