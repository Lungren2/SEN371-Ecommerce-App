using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using GrandmastersHub.Domain.Entities;
using GrandmastersHub.Infrastructure.Security;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace GrandmastersHub.Tests;

public sealed class ApiSecurityTests : IClassFixture<WebApplicationFactory<Program>>
{
    private const string Issuer = "GrandmastersHub.Api";
    private const string Audience = "GrandmastersHub.Client";
    private const string SigningKey = "SEN371-local-development-key-2026-change-me-please";

    private readonly WebApplicationFactory<Program> _factory;

    public ApiSecurityTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
            builder.UseEnvironment("Development"));
    }

    [Fact]
    public async Task Me_WithMalformedToken_ReturnsUnauthorized()
    {
        using var client = CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", "this-is-not-a-jwt");

        var response = await client.GetAsync("/api/v1/Auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_WithTamperedToken_ReturnsUnauthorized()
    {
        using var client = CreateClient();

        var token = CreateValidToken();

        // Change the final signature character without changing
        // the header or payload.
        var tamperedToken = token[..^1] +
                            (token[^1] == 'A' ? "B" : "A");

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tamperedToken);

        var response = await client.GetAsync("/api/v1/Auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Me_WithExpiredToken_ReturnsUnauthorized()
    {
        using var client = CreateClient();

        var tokenService = new JwtTokenService(Options.Create(new JwtOptions
        {
            Issuer = Issuer,
            Audience = Audience,
            SigningKey = SigningKey,
            ExpiryMinutes = -5
        }));

        var token = tokenService.CreateToken(new User
        {
            UserId = 42,
            Email = "expired-test@example.com",
            PasswordHash = "not-used",
            Role = "Customer"
        });

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token.AccessToken);

        var response = await client.GetAsync("/api/v1/Auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private HttpClient CreateClient()
    {
        return _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });
    }

    private static string CreateValidToken()
    {
        var tokenService = new JwtTokenService(Options.Create(new JwtOptions
        {
            Issuer = Issuer,
            Audience = Audience,
            SigningKey = SigningKey,
            ExpiryMinutes = 5
        }));

        var token = tokenService.CreateToken(new User
        {
            UserId = 42,
            Email = "security-test@example.com",
            PasswordHash = "not-used",
            Role = "Customer"
        });

        return token.AccessToken;
    }
}