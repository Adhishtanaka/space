using Microsoft.EntityFrameworkCore;

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

        if (request.Gender.ToUpper() != "F" && request.Gender.ToUpper() != "M")
        {
            return (false, "wrong gender value");
        }

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Gender = request.Gender.ToUpper()
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
            DateOfBirth = user.DateOfBirth,
            Gender = user.Gender
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
            DateOfBirth = user.DateOfBirth,
            Gender = user.Gender,
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
            DateOfBirth = user.DateOfBirth,
            Gender = user.Gender,
        }).ToList();
        return (true, userDtos, null);
    }

}
