using System.Text.Json;
using Microsoft.Extensions.Logging;
using Moq;
using StackExchange.Redis;
using Store.Infrastructure.Services;
using Store.Infrastructure.Services.Models;

namespace Store.IntegrationTests.Services;

public class IdempotencyServiceTests : IAsyncLifetime
{
    private readonly Mock<IDatabase> _dbMock;
    private readonly Mock<ILogger<IdempotencyService>> _loggerMock;
    private readonly Mock<IConnectionMultiplexer> _redisMock;
    private readonly IdempotencyService _service;
    private readonly string _testKey = "test-key";

    public IdempotencyServiceTests()
    {
        _redisMock = new Mock<IConnectionMultiplexer>();
        _dbMock = new Mock<IDatabase>();
        _loggerMock = new Mock<ILogger<IdempotencyService>>();

        _redisMock.Setup(x => x.GetDatabase(It.IsAny<int>(), It.IsAny<object>()))
            .Returns(_dbMock.Object);

        _service = new IdempotencyService(_redisMock.Object, _loggerMock.Object);
    }

    public Task InitializeAsync()
    {
        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        return Task.CompletedTask;
    }

    [Fact]
    public async Task IsOperationProcessed_ReturnsFalse_WhenKeyDoesNotExist()
    {
        // Arrange
        _dbMock.Setup(x => x.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
            .ReturnsAsync(RedisValue.Null);

        // Act
        var result = await _service.IsOperationProcessedAsync(_testKey);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task IsOperationProcessed_ReturnsTrue_WhenKeyExists()
    {
        // Arrange
        _dbMock.Setup(x => x.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
            .ReturnsAsync("some-value");

        // Act
        var result = await _service.IsOperationProcessedAsync(_testKey);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task MarkOperationAsProcessed_StoresRecord_WithCorrectExpiry()
    {
        // Arrange
        var storedValue = new RedisValue();
        TimeSpan? storedExpiry = null;

        _dbMock.Setup(x => x.StringSetAsync(
                It.IsAny<RedisKey>(),
                It.IsAny<RedisValue>(),
                It.IsAny<TimeSpan?>(),
                It.IsAny<When>(),
                It.IsAny<CommandFlags>()))
            .Callback<RedisKey, RedisValue, TimeSpan?, When, CommandFlags>(
                (key, value, expiry, when, flags) =>
                {
                    storedValue = value;
                    storedExpiry = expiry;
                })
            .ReturnsAsync(true);

        // Act
        await _service.MarkOperationAsProcessedAsync(_testKey);

        // Assert
        Assert.NotNull(storedValue);
        Assert.NotNull(storedExpiry);
        Assert.True(storedExpiry?.Days == 7); // Verify 7-day expiry

        var record = JsonSerializer
            .Deserialize<IdempotencyRecord>(storedValue.ToString());

        Assert.NotNull(record);
        Assert.True((record.ExpiresAt - record.ProcessedAt).Days == 7);
    }

    [Fact]
    public async Task GetOperationDetails_ReturnsNull_WhenKeyDoesNotExist()
    {
        // Arrange
        _dbMock.Setup(x => x.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
            .ReturnsAsync(RedisValue.Null);

        // Act
        var result = await _service.GetOperationDetailsAsync(_testKey);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetOperationDetails_ReturnsRecord_WhenKeyExists()
    {
        // Arrange
        var record = new IdempotencyRecord
        {
            ProcessedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        _dbMock.Setup(x => x.StringGetAsync(It.IsAny<RedisKey>(), It.IsAny<CommandFlags>()))
            .ReturnsAsync(JsonSerializer.Serialize(record));

        // Act
        var result = await _service.GetOperationDetailsAsync(_testKey);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(record.ProcessedAt.Date, result.ProcessedAt.Date);
        Assert.Equal(record.ExpiresAt.Date, result.ExpiresAt.Date);
    }
}