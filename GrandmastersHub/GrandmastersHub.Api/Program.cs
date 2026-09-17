using System.Security.Claims;
using System.Text;
using GrandmastersHub.Application.Interfaces;
using GrandmastersHub.Application.Services;
using GrandmastersHub.Api.Middleware;
using GrandmastersHub.Api.Security;
using GrandmastersHub.Domain.Constants;
using GrandmastersHub.Domain.Interfaces;
using GrandmastersHub.Infrastructure.Data;
using GrandmastersHub.Infrastructure.Repositories;
using GrandmastersHub.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

var configuredConnectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is required.");
var databaseProvider = builder.Configuration["Database:Provider"] ?? "SqlServer";
var connectionString = NormalizeConnectionString(configuredConnectionString, databaseProvider);

builder.Services.AddDbContext<GrandmastersDbContext>(options =>
{
    if (databaseProvider.Equals("Postgres", StringComparison.OrdinalIgnoreCase))
    {
        options.UseNpgsql(connectionString);
        return;
    }

    if (databaseProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        options.UseSqlServer(connectionString);
        return;
    }

    throw new InvalidOperationException($"Unsupported Database:Provider '{databaseProvider}'.");
});

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<ICheckoutRepository, CheckoutRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordHasher<GrandmastersHub.Domain.Entities.User>, PasswordHasher<GrandmastersHub.Domain.Entities.User>>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddSingleton<ITokenService, JwtTokenService>();
builder.Services.AddControllers();
builder.Services.AddScoped<ICategoryService, GrandmastersHub.Application.Services.CategoryService>();
builder.Services.AddScoped<IProductService, GrandmastersHub.Application.Services.ProductService>();

builder.Services.AddCors(options => options.AddPolicy("AllowFrontend", policy =>
    policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
        .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    const string bearerScheme = "Bearer";
    options.AddSecurityDefinition(bearerScheme, new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Enter a JWT access token."
    });
    options.OperationFilter<AuthorizeOperationFilter>();
});

var jwtSection = builder.Configuration.GetSection(JwtOptions.SectionName);
builder.Services.AddOptions<JwtOptions>().Bind(jwtSection)
    .Validate(o => !string.IsNullOrWhiteSpace(o.Issuer), "Jwt:Issuer is required.")
    .Validate(o => !string.IsNullOrWhiteSpace(o.Audience), "Jwt:Audience is required.")
    .Validate(o => Encoding.UTF8.GetByteCount(o.SigningKey ?? string.Empty) >= 32, "Jwt:SigningKey must contain at least 32 bytes.")
    .Validate(o => o.ExpiryMinutes is > 0 and <= 1440, "Jwt:ExpiryMinutes must be between 1 and 1440.")
    .ValidateOnStart();

var jwtOptions = jwtSection.Get<JwtOptions>() ?? throw new InvalidOperationException("The Jwt configuration section is required.");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey ?? string.Empty));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.MapInboundClaims = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, ValidIssuer = jwtOptions.Issuer,
        ValidateAudience = true, ValidAudience = jwtOptions.Audience,
        ValidateIssuerSigningKey = true, IssuerSigningKey = signingKey,
        ValidateLifetime = true, ClockSkew = TimeSpan.Zero, RoleClaimType = ClaimTypes.Role
    };
});
builder.Services.AddAuthorization(options =>
    options.AddPolicy(AuthorizationPolicies.AdminOnly, policy =>
        policy.RequireRole(UserRoles.Admin)));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

var ensureCreatedOnStartup = app.Configuration.GetValue("Database:EnsureCreatedOnStartup", false);
var applyMigrationsOnStartup = app.Configuration.GetValue(
    "Database:ApplyMigrationsOnStartup", app.Environment.IsDevelopment());

if (ensureCreatedOnStartup || applyMigrationsOnStartup)
{
    await using var scope = app.Services.CreateAsyncScope();
    var database = scope.ServiceProvider.GetRequiredService<GrandmastersDbContext>();

    if (database.Database.IsNpgsql() && ensureCreatedOnStartup)
    {
        await database.Database.EnsureCreatedAsync();
        await PostgresDemoSeeder.SeedAsync(database);
    }
    else if (applyMigrationsOnStartup)
    {
        if (!database.Database.GetMigrations().Any())
        {
            throw new InvalidOperationException(
                "No EF Core migrations were found. Run scripts/Initialize-Database.ps1 "
                + "from the repository root to generate and apply the initial migration.");
        }

        try
        {
            await database.Database.MigrateAsync();
        }
        catch (Exception exception) when (exception.GetBaseException() is Microsoft.Data.SqlClient.SqlException)
        {
            throw new InvalidOperationException(
                "Database initialization failed. Check ConnectionStrings:DefaultConnection, "
                + "the SQL Server instance, the database state, and your login's database permissions.", exception);
        }
    }
}

app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors("AllowFrontend");
app.UseMiddleware<GlobalErrorHandlingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapControllers();
app.MapFallbackToFile("index.html");
app.Run();

static string NormalizeConnectionString(string connectionString, string databaseProvider)
{
    if (!databaseProvider.Equals("Postgres", StringComparison.OrdinalIgnoreCase))
    {
        return connectionString;
    }

    if (!Uri.TryCreate(connectionString, UriKind.Absolute, out var uri)
        || !(uri.Scheme.Equals("postgres", StringComparison.OrdinalIgnoreCase)
            || uri.Scheme.Equals("postgresql", StringComparison.OrdinalIgnoreCase)))
    {
        return connectionString;
    }

    var userInfo = uri.UserInfo.Split(':', 2);
    if (userInfo.Length != 2 || string.IsNullOrWhiteSpace(uri.Host))
    {
        throw new InvalidOperationException("The PostgreSQL connection URL is missing credentials or a host.");
    }

    var database = Uri.UnescapeDataString(uri.AbsolutePath.Trim('/'));
    if (string.IsNullOrWhiteSpace(database))
    {
        throw new InvalidOperationException("The PostgreSQL connection URL is missing a database name.");
    }

    return new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.IsDefaultPort || uri.Port < 1 ? 5432 : uri.Port,
        Database = database,
        Username = Uri.UnescapeDataString(userInfo[0]),
        Password = Uri.UnescapeDataString(userInfo[1]),
        Pooling = true,
    }.ConnectionString;
}

public partial class Program;
