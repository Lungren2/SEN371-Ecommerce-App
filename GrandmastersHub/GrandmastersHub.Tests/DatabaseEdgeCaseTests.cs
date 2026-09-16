using GrandmastersHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Xunit;

namespace GrandmastersHub.Tests;

public class DatabaseEdgeCaseTests
{
    [Fact]
    public async Task Querying_Nonexistent_Product_Should_Return_Null()
    {
        using var context = TestDbContextFactory.Create();

        var product = await context.Products
            .FirstOrDefaultAsync(p => p.ProductId == -999);

        Assert.Null(product);
    }

    
    [Fact]
    public void Product_Name_Over_200_Characters_Should_Fail_Validation()
    {
        var product = new Product
        {
            Name = new string('X', 201),
            Slug = "long-name"
        };

        var results = new List<ValidationResult>();

        var isValid = Validator.TryValidateObject(
            product,
            new ValidationContext(product),
            results,
            true);

        Assert.False(isValid);
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(Product.Name)));
    }
}
