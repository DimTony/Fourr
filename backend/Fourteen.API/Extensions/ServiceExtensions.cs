using FluentValidation;
using Fourteen.API.Middleware;
using Fourteen.Application;
using Fourteen.Application.Common.Behaviors;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

namespace Fourteen.API.Extensions
{
    public static class ServiceCollectionExtensions
    {

        public static IServiceCollection AddApiServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {

            services.AddRateLimiter(options =>
            {
                options.AddPolicy("auth", ctx => RateLimitPartition.GetFixedWindowLimiter(
                    ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new() { PermitLimit = 10, Window = TimeSpan.FromMinutes(1) }));

                options.AddPolicy("api", ctx =>
                {
                    var userId = ctx.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                                ?? ctx.Connection.RemoteIpAddress?.ToString() 
                                ?? "unknown";
                    return RateLimitPartition.GetFixedWindowLimiter(userId,
                        _ => new() { PermitLimit = 2, Window = TimeSpan.FromMinutes(1) });
                });

                options.OnRejected = async (ctx, _) =>
                {
                    ctx.HttpContext.Response.StatusCode = 429;
                    await ctx.HttpContext.Response.WriteAsJsonAsync(new { 
                        status = "error", message = "Too many requests" });
                };
            });

            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(typeof(AssemblyMarker).Assembly);

                cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
            });


            services.AddValidatorsFromAssembly(typeof(AssemblyMarker).Assembly);

            services.AddControllers()
                .AddJsonOptions(option =>
                {
                    option.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });

            services.AddEndpointsApiExplorer();

            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Fourteen API",
                    Version = "v1",
                    Description = "External Integration API",
                });

                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter your JWT access token"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });

                options.OperationFilter<ApiVersionHeaderFilter>();

            });

            services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    policy
                        .AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
            });

            // Configure JWT Bearer Authentication
            var jwtSecret = configuration.GetValue<string>("Jwt:SecretKey");
            if (string.IsNullOrEmpty(jwtSecret))
                throw new InvalidOperationException("Jwt:SecretKey is not configured in appsettings");

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "Bearer";
                options.DefaultChallengeScheme = "Bearer";
            })
            .AddJwtBearer("Bearer", options =>
            {
                options.TokenValidationParameters = tokenValidationParameters;
            });

            services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", p => p.RequireRole("admin"));
                options.AddPolicy("AnyRole",   p => p.RequireRole("admin", "analyst"));
            });

            services.AddHealthChecks();

            return services;
        }
    }
}
