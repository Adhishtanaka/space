public interface IPostRepository
{
    Task<Post?> GetByIdAsync(int postId, bool includeRelations = false);
    Task<Post> CreateAsync(Post post);
    Task<List<Post>> GetFeedPostsAsync(List<int> userIds);
    Task<List<Post>> GetUserPostsAsync(int userId);
    Task<Vote?> GetVoteAsync(int userId, int postId);
    Task AddVoteAsync(Vote vote);
    Task UpdateVoteAsync(Vote vote);
    Task RemoveVoteAsync(Vote vote);
    Task<List<Vote>> GetPostVotesAsync(int postId);
    Task DeleteAsync(Post post);
    Task DeleteVotesAsync(IEnumerable<Vote> votes);
    Task SaveChangesAsync();
}