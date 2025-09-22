public class Post
{
    public int Id { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public ICollection<Vote> Votes { get; set; } = [];

    public int UpVotes => Votes.Count(v => v.IsUpVote);
    public int DownVotes => Votes.Count(v => !v.IsUpVote);
    public int TotalScore => UpVotes - DownVotes;
}
