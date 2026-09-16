using Microsoft.AspNetCore.Mvc;

namespace GrandmastersHub.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ReviewsController : ControllerBase
{
   [HttpGet]
    public IActionResult GetReviews()
    {
        return Ok(new[] { "Great chess board!", "Fast shipping." });
    }
}