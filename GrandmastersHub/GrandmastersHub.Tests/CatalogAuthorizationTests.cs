using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using GrandmastersHub.Domain.Constants;
using GrandmastersHub.Domain.Entities;
using GrandmastersHub.Infrastructure.Security;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Options;

namespace GrandmastersHub.Tests;

public sealed class CatalogAuthorizationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private const string SigningKey = "SEN371-local-development-key-2026-change-me-please";
    private readonly WebApplicationFactory<Program> _factory;

    public CatalogAuthorizationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder => builder.UseEnvironment("Development"));
    }

    [Fact]
    public async Task Create_Product_WithoutAToken_ReturnsUnauthorized()
    {
        using var client = CreateClient();

        var body = new
        {
            name = $"Security Test Board {Guid.NewGuid():N}",
            price = 950,
            stockQuantity = 4,
            categoryId = 1
        };

        var response = await client.PostAsJsonAsync("/api/v1/products", body);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Create_Product_AsCustomer_ReturnsForbidden()
    {
        using var client = CreateClient(UserRoles.Customer);

        var body = new
        {
            name = $"Security Test Board {Guid.NewGuid():N}",
            price = 950,
            stockQuantity = 4,
            categoryId = 1
        };

        var response = await client.PostAsJsonAsync("/api/v1/products", body);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Create_Product_AsAdmin_ReturnsCreated()
    {
        using var client = CreateClient(UserRoles.Admin);

        var body = new
        {
            name = $"Security Test Board {Guid.NewGuid():N}",
            price = 950,
            stockQuantity = 4,
            categoryId = 1
        };

        var response = await client.PostAsJsonAsync("/api/v1/products", body);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Create_Category_WithoutAToken_ReturnsUnauthorized()
    {
        using var client = CreateClient();

        var body = new
        {
            name = $"Security Test Category {Guid.NewGuid():N}",
            description = "Security test category"
        };

        var response = await client.PostAsJsonAsync("/api/v1/categories", body);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Create_Category_AsCustomer_ReturnsForbidden()
    {
        using var client = CreateClient(UserRoles.Customer);

        var body = new
        {
            name = $"Security Test Category {Guid.NewGuid():N}",
            description = "Security test category"
        };

        var response = await client.PostAsJsonAsync("/api/v1/categories", body);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Create_Category_AsAdmin_ReturnsCreated()
    {
        using var client = CreateClient(UserRoles.Admin);

        var body = new
        {
            name = $"Security Test Category {Guid.NewGuid():N}",
            description = "Security test category"
        };

        var response = await client.PostAsJsonAsync("/api/v1/categories", body);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    private HttpClient CreateClient(string? role = null)
    {
        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        if (role is not null)
        {
            var tokenService = new JwtTokenService(Options.Create(new JwtOptions
            {
                Issuer = "GrandmastersHub.Api",
                Audience = "GrandmastersHub.Client",
                SigningKey = SigningKey,
                ExpiryMinutes = 5
            }));

            var token = tokenService.CreateToken(new User
            {
                UserId = 42,
                Email = "security-test@example.com",
                PasswordHash = "not-used",
                Role = role
            });

            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token.AccessToken);
        }

        return client;
    }
}