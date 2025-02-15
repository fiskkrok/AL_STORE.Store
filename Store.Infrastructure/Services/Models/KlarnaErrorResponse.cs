using System.Text.Json.Serialization;

namespace Store.Infrastructure.Services.Models;

public class KlarnaErrorResponse
{
    [JsonPropertyName("error_code")] public string ErrorCode { get; set; } = string.Empty;

    [JsonPropertyName("error_message")] public string ErrorMessage { get; set; } = string.Empty;
}