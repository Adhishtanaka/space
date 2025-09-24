public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string PasswordHash { get; set; } = null!;
    public string? Geohash { get; set; }
    public string Gender { get; set; } = null!;

    // Navigation properties
    public ICollection<Post> Posts { get; set; } = [];
    public ICollection<Vote> Votes { get; set; } = [];
    public ICollection<UserFollow> Following { get; set; } = [];
    public ICollection<UserFollow> Followers { get; set; } = [];
}

