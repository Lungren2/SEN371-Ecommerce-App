using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;
using GrandmastersHub.Domain.Entities;
using Xunit;

namespace GrandmastersHub.Tests;

public class ModelValidationTests
{
    [Fact]
    public void Product_Should_Require_Name()
    {
        var product = new Product
        {
            Name = "",
            Slug = "valid-slug"
        };

        var results = new List<ValidationResult>();

        var isValid = Validator.TryValidateObject(
            product,
            new ValidationContext(product),
            results,
            true);

        Assert.False(isValid);
    }

    [Fact]
    public void Product_Name_Should_Not_Exceed_200_Characters()
    {
        var product = new Product
        {
            Name = new string('A', 201),
            Slug = "valid-slug"
        };

        var results = new List<ValidationResult>();

        var isValid = Validator.TryValidateObject(
            product,
            new ValidationContext(product),
            results,
            true);

        Assert.False(isValid);
    }

    [Fact]
    public void Product_Should_Require_Slug()
    {
        var product = new Product
        {
            Name = "Chess Set",
            Slug = ""
        };

        var results = new List<ValidationResult>();

        var isValid = Validator.TryValidateObject(
            product,
            new ValidationContext(product),
            results,
            true);

        Assert.False(isValid);
    }
}
