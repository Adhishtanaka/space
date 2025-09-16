using System;
using System.Collections.Generic;

public abstract class AppUser
{
    public int Id { get; set; }
    
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    
    public string Email { get; set; } = null!; 
    public string? PhoneNumber { get; set; }
    
    public DateTime DateOfBirth { get; set; }
    
    public string PasswordHash { get; set; } = null!;
}

public class User : AppUser
{
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Like> Likes { get; set; } = new List<Like>();
    
    public string Role { get; set; } = "User";
}

public class Admin : AppUser
{
    public string Role { get; set; } = "Admin";
}