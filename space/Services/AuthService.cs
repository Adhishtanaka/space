using space.Repositories;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly JwtConfig _jwtConfig;

    public AuthService(IUserRepository userRepository, JwtConfig jwtConfig)
    {
        _userRepository = userRepository;
        _jwtConfig = jwtConfig;
    }

    public async Task<(bool Success, string? ErrorMessage)> RegisterAsync(RegisterRequest request)
    {
        if (await _userRepository.ExistsByEmailAsync(request.Email))
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

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool Success, string? Token, string? ErrorMessage)> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return (false, null, "Invalid credentials");

        var token = _jwtConfig.GenerateToken(user);
        return (true, token, null);
    }

    public async Task<(bool Success, UserDto? UserDetails, string? ErrorMessage)> GetUserByEmailAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
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
        var user = await _userRepository.GetByIdAsync(userId);
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
        var users = await _userRepository.GetAllAsync();
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
