﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Store.Domain.Entities.Customer;

namespace Store.Application.Contracts;
public interface ICustomerRepository
{
    Task<CustomerProfile?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<CustomerProfile?> GetByUserIdAsync(string userId, CancellationToken ct = default);
    Task<CustomerProfile?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> ExistsAsync(string userId, CancellationToken ct = default);
    Task AddAsync(CustomerProfile customer, CancellationToken ct = default);
    Task<IReadOnlyList<CustomerAddress>> GetAddressesAsync(Guid customerId, CancellationToken ct = default);
    Task AddAddressAsync(CustomerAddress address, CancellationToken ct = default);
    void Update(CustomerProfile customer);
}