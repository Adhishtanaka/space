using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class CommentController : ControllerBase
{
    private readonly CommentService _commentService;
    public CommentController(CommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _commentService.GetAllCommentsWithUserContextAsync(User);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var result = await _commentService.GetCommentWithUserContextAsync(id, User);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Comment comment)
    {
        var created = await _commentService.AddCommentAsync(comment);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Comment comment)
    {
        if (id != comment.Id) return BadRequest();
        var updated = await _commentService.UpdateCommentAsync(comment);
        if (!updated) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _commentService.DeleteCommentAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
