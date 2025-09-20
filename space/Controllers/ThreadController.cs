using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[
    ApiController,
    Authorize,
    Route("api/[controller]")
]
public class ThreadController : ControllerBase
{
    private readonly ThreadService _threadService;
    public ThreadController(ThreadService threadService)
    {
        _threadService = threadService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var threads = await _threadService.GetAllThreadsAsync();
        return Ok(threads);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var thread = await _threadService.GetThreadByIdAsync(id);
        if (thread == null) return NotFound();
        return Ok(thread);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Thread thread)
    {
        var created = await _threadService.AddThreadAsync(thread);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Thread thread)
    {
        if (id != thread.Id) return BadRequest();
        var updated = await _threadService.UpdateThreadAsync(thread);
        if (!updated) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _threadService.DeleteThreadAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}