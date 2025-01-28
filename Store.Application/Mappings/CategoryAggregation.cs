namespace Store.Application.Mappings;

public class CategoryAggregation
{
    public Guid CategoryId { get; init; }
    public string Name { get; init; } = string.Empty;
    public int Count { get; init; }
}