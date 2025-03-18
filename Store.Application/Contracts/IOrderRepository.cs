using Store.Domain.Entities.Order;

namespace Store.Application.Contracts;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken ct = default);
    Task<Order?> GetWithPaymentSessionsAsync(Guid id, CancellationToken ct = default);
    Task<Order?> GetByKlarnaAsync(string id, CancellationToken ct = default);
    
    // New method to get order by any payment reference (Klarna or other payment methods)
    Task<Order?> GetByPaymentReferenceAsync(string reference, CancellationToken ct = default);
    
    Task<IReadOnlyList<Order>> GetCustomerOrdersAsync(string customerId, CancellationToken ct = default);
    Task<string> GenerateOrderNumberAsync(CancellationToken ct = default);
    Task AddAsync(Order order, CancellationToken ct = default);
    void Update(Order order);
}