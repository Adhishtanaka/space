public class Message
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }

    public int SenderId { get; set; }
    public int ReceiverId { get; set; }

    public User Sender { get; set; } = null!;
    public User Receiver { get; set; } = null!;
}
