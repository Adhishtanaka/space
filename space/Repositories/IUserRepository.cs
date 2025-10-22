namespace space.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int id);
        Task<List<User>> GetAllAsync();
        Task<bool> ExistsByEmailAsync(string email);
        Task AddAsync(User user);
        Task SaveChangesAsync();
    }
}