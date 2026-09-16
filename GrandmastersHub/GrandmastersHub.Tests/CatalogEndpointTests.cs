using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace GrandmastersHub.Tests;

public sealed class CatalogEndpointTests
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public CatalogEndpointTests(
        WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Products_GetAll_ReturnsOk()
    {
        using var client = _factory.CreateClient();

        var response =
            await client.GetAsync("/api/v1/products");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Products_GetById_WhenProductExists_ReturnsOk()
    {
        using var client = _factory.CreateClient();

        var allResponse =
            await client.GetAsync("/api/v1/products");

        Assert.Equal(HttpStatusCode.OK, allResponse.StatusCode);

        using var document =
            JsonDocument.Parse(
                await allResponse.Content.ReadAsStringAsync());

        var products = document.RootElement;

        Assert.True(products.GetArrayLength() > 0);

        var productId =
            products[0].GetProperty("productId").GetInt32();

        var response =
            await client.GetAsync($"/api/v1/products/{productId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Products_GetById_WhenProductDoesNotExist_ReturnsNotFound()
    {
        using var client = _factory.CreateClient();

        var response =
            await client.GetAsync("/api/v1/products/999999999");

        Assert.Equal(
            HttpStatusCode.NotFound,
            response.StatusCode);
    }

    [Fact]
    public async Task Categories_GetAll_ReturnsOk()
    {
        using var client = _factory.CreateClient();

        var response =
            await client.GetAsync("/api/v1/categories");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Categories_GetById_WhenCategoryExists_ReturnsOk()
    {
        using var client = _factory.CreateClient();

        var allResponse =
            await client.GetAsync("/api/v1/categories");

        Assert.Equal(HttpStatusCode.OK, allResponse.StatusCode);

        using var document =
            JsonDocument.Parse(
                await allResponse.Content.ReadAsStringAsync());

        var categories = document.RootElement;

        Assert.True(categories.GetArrayLength() > 0);

        var categoryId =
            categories[0].GetProperty("categoryId").GetInt32();

        var response =
            await client.GetAsync($"/api/v1/categories/{categoryId}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Categories_GetById_WhenCategoryDoesNotExist_ReturnsNotFound()
    {
        using var client = _factory.CreateClient();

        var response =
            await client.GetAsync("/api/v1/categories/999999999");

        Assert.Equal(
            HttpStatusCode.NotFound,
            response.StatusCode);
    }
}