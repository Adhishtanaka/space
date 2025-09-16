public class Like
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public AppUser User { get; set; } = null!;

    public int? PostId { get; set; }
    public Post? Post { get; set; }

    public int? CommentId { get; set; }
    public Comment? Comment { get; set; }
}