using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class LikeController : ControllerBase
{
    private readonly LikeService _likeService;
    public LikeController(LikeService likeService)
    {
        _likeService = likeService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var likes = await _likeService.GetAllLikesAsync();
        return Ok(likes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var like = await _likeService.GetLikeByIdAsync(id);
        if (like == null) return NotFound();
        return Ok(like);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Like like)
    {
        var created = await _likeService.AddLikeAsync(like);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _likeService.DeleteLikeAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
