public class Like
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int? ThreadId { get; set; }
    public Thread? Thread { get; set; }

    public int? CommentId { get; set; }
    public Comment? Comment { get; set; }
}