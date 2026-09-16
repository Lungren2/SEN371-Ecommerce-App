using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace GrandmastersHub.Tests.Controllers;

public class ReviewsControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ReviewsControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetReviews_ReturnsOk_WhenControllerIsImplemented()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/reviews");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}