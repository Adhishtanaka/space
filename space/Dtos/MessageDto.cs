public class MessageDto
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime SentAt { get; set; }
    public int SenderId { get; set; }
    public int ReceiverId { get; set; }
}

public class SendMessageDto
{
    public int ReceiverId { get; set; }
    public string Content { get; set; } = string.Empty;
}
