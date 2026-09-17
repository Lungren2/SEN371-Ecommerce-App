using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using GrandmastersHub.Api.Controllers;
using GrandmastersHub.Application.DTOs.Auth;
using GrandmastersHub.Application.Interfaces;
using GrandmastersHub.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GrandmastersHub.Tests;

public sealed class AuthControllerTests
{
    [Fact]
    public async Task Me_WithValidUser_ReturnsOk()
    {
        var expectedUser = new User
        {
            UserId = 42,
            Email = "test@example.com",
            PasswordHash = "not-used",
            Role = "Customer"
        };

        var controller = CreateController(expectedUser);

        var result = await controller.Me(CancellationToken.None);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Me_WhenUserDoesNotExist_ReturnsUnauthorized()
    {
        var controller = CreateController(null);

        var result = await controller.Me(CancellationToken.None);

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task Me_WithInvalidSubject_ReturnsUnauthorized()
    {
        var controller = new AuthController(
            new TestAuthService(null));

        SetUser(controller, "not-a-number");

        var result = await controller.Me(CancellationToken.None);

        Assert.IsType<UnauthorizedResult>(result);
    }

    [Fact]
    public async Task Register_WhenEmailAlreadyExists_ReturnsConflict()
    {
        var controller = new AuthController(
            new TestAuthService(null));

        var request = new RegisterRequestDto
        {
            Email = "existing@example.com",
            Password = "Password123456!"
        };

        var result = await controller.Register(
            request,
            CancellationToken.None);

        var conflict = Assert.IsType<ConflictObjectResult>(result.Result);

        Assert.Equal(409, conflict.StatusCode);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        var controller = new AuthController(
            new TestAuthService(null));

        var request = new LoginRequestDto
        {
            Email = "invalid@example.com",
            Password = "WrongPassword123!"
        };

        var result = await controller.Login(
            request,
            CancellationToken.None);

        var unauthorized =
            Assert.IsType<UnauthorizedObjectResult>(result.Result);

        Assert.Equal(401, unauthorized.StatusCode);
    }

    private static AuthController CreateController(User? user)
    {
        var controller = new AuthController(
            new TestAuthService(user));

        SetUser(controller, user?.UserId.ToString() ?? "42");

        return controller;
    }

    private static void SetUser(
        AuthController controller,
        string subject)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, subject)
        };

        var identity = new ClaimsIdentity(
            claims,
            "TestAuthentication");

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(identity)
            }
        };
    }

    private sealed class TestAuthService : IAuthService
    {
        private readonly User? _user;

        public TestAuthService(User? user)
        {
            _user = user;
        }

        public Task<AuthResponseDto?> RegisterAsync(
            RegisterRequestDto request,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<AuthResponseDto?>(null);
        }

        public Task<AuthResponseDto?> LoginAsync(
            LoginRequestDto request,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<AuthResponseDto?>(null);
        }

        public Task<User?> GetUserAsync(
            int userId,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(_user);
        }
    }
}