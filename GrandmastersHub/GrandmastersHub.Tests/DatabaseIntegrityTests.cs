using System;
using System.Collections.Generic;
using System.Text;
using GrandmastersHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace GrandmastersHub.Tests;

public class DatabaseIntegrityTests
{
    [Fact]
    public async Task Should_Save_And_Retrieve_Product()
    {
        using var context = TestDbContextFactory.Create();
        using var transaction = await context.Database.BeginTransactionAsync();

        var category = new Category
        {
            Name = "Chess"
        };

        context.Categories.Add(category);
        await context.SaveChangesAsync();

        var product = new Product
        {
            Name = "Wooden Chess Board",
            Slug = $"wood-board-{Guid.NewGuid()}",
            Price = 499.99m,
            CategoryId = category.CategoryId
        };

        context.Products.Add(product);
        await context.SaveChangesAsync();

        var savedProduct = await context.Products
            .FirstOrDefaultAsync(p => p.ProductId == product.ProductId);

        Assert.NotNull(savedProduct);
        Assert.Equal("Wooden Chess Board", savedProduct!.Name);

        await transaction.RollbackAsync();
    }
}