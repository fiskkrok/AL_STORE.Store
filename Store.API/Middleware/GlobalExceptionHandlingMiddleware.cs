﻿using Microsoft.AspNetCore.Mvc;
using Store.Domain.Exceptions;

namespace Store.API.Middleware;
/// <summary>
/// 
/// </summary>
public class GlobalExceptionHandlingMiddleware : IMiddleware
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;
    /// <summary>
    /// 
    /// </summary>
    public GlobalExceptionHandlingMiddleware(
        ILogger<GlobalExceptionHandlingMiddleware> logger,
        IWebHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }
    /// <summary>
    /// 
    /// </summary>
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var problemDetails = new ProblemDetails
        {
            Status = GetStatusCode(exception),
            Title = GetTitle(exception),
            Detail = GetDetail(exception),
            Instance = context.Request.Path
        };

        if (_env.IsDevelopment()) problemDetails.Extensions["stackTrace"] = exception.StackTrace;

        context.Response.StatusCode = problemDetails.Status.Value;
        context.Response.ContentType = "application/problem+json";

        return context.Response.WriteAsJsonAsync(problemDetails);
    }

    private static int GetStatusCode(Exception exception)
    {
        return exception switch
        {
            ValidationException => StatusCodes.Status400BadRequest,
            NotFoundException => StatusCodes.Status404NotFound,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError
        };
    }

    private static string GetTitle(Exception exception)
    {
        return exception switch
        {
            ValidationException => "Validation Error",
            NotFoundException => "Resource Not Found",
            UnauthorizedAccessException => "Unauthorized",
            _ => "Server Error"
        };
    }

    private string GetDetail(Exception exception)
    {
        return _env.IsDevelopment()
            ? exception.Message
            : "An error occurred processing your request.";
    }
}