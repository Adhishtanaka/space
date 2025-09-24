using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GeoController : ControllerBase
{
    private readonly IGeoService _geoService;
    public GeoController(IGeoService geoService)
    {
        _geoService = geoService;
    }

    [HttpPost("geohash")]
public async Task<IActionResult> UpdateAndGetNearby([FromQuery] string geohash)
{
    var userId = GetCurrentUserId();
    if (userId == null)
        return Unauthorized();

    var (updateSuccess, updateError) = await _geoService.UpdateGeohashAsync(userId.Value, geohash);
    if (!updateSuccess)
        return BadRequest(new { message = updateError });

    var (getSuccess, usergeoDetails, getError) = await _geoService.GetUsersByGeohashAsync(userId.Value, geohash);
    if (!getSuccess)
        return BadRequest(new { message = getError });

    return Ok(usergeoDetails);
}



    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
