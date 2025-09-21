public class Vote
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int PostId { get; set; }
    public Post Post { get; set; } = null!;
    public bool IsUpVote { get; set; } // true for upvote, false for downvote
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
