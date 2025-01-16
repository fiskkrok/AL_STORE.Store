using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Store.Domain.Common;
public record Error(string Code, string Message)
{
    public static Error None = new(string.Empty, string.Empty);
}
