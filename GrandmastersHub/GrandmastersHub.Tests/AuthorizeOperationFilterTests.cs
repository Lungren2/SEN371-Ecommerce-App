using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace GrandmastersHub.Tests;

public sealed class AuthorizeOperationFilterTests
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AuthorizeOperationFilterTests(
        WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Swagger_ProtectedAuthMeEndpoint_HasBearerSecurityRequirement()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/swagger/v1/swagger.json");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var document =
            JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        var meEndpoint =
            document.RootElement
                .GetProperty("paths")
                .GetProperty("/api/v1/Auth/me")
                .GetProperty("get");

        Assert.True(
            meEndpoint.TryGetProperty("security", out var security));

        Assert.True(security.GetArrayLength() > 0);
    }

    [Fact]
    public async Task Swagger_AnonymousRegisterEndpoint_DoesNotHaveSecurityRequirement()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/swagger/v1/swagger.json");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var document =
            JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        var registerEndpoint =
            document.RootElement
                .GetProperty("paths")
                .GetProperty("/api/v1/Auth/register")
                .GetProperty("post");

        Assert.False(
            registerEndpoint.TryGetProperty("security", out _));
    }

    [Fact]
    public async Task Swagger_AnonymousLoginEndpoint_DoesNotHaveSecurityRequirement()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/swagger/v1/swagger.json");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var document =
            JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        var loginEndpoint =
            document.RootElement
                .GetProperty("paths")
                .GetProperty("/api/v1/Auth/login")
                .GetProperty("post");

        Assert.False(
            loginEndpoint.TryGetProperty("security", out _));
    }
}
