using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Store.Domain.Entities.Order;
using Document = QuestPDF.Fluent.Document;

namespace Store.Infrastructure.Services;

/// <summary>
///     Utility class for generating PDF receipts
///     Uses QuestPDF library (you need to add this NuGet package)
/// </summary>
public static class ReceiptGenerator
{
    public static byte[] GenerateReceipt(Order order)
    {
        // Note: In a real application, you would use QuestPDF or another PDF library
        // This is a simplified example to demonstrate the concept

        QuestPDF.Settings.License = LicenseType.Community;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(50);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Text($"RECEIPT - Order #{order.OrderNumber}")
                    .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                page.Content().PaddingVertical(20).Column(column =>
                {
                    // Order info
                    column.Item().Text("Order Information")
                        .SemiBold().FontSize(14);

                    column.Item().Grid(grid =>
                    {
                        grid.Columns(2);
                        grid.Item().Text($"Order Date: {order.Created:d}");
                        grid.Item().Text($"Order Status: {order.Status}");
                    });

                    column.Item().PaddingTop(10).Text("Shipping Information")
                        .SemiBold().FontSize(14);

                    column.Item().Text(text =>
                    {
                        text.Line($"{order.ShippingAddress.Street}");
                        text.Line(
                            $"{order.ShippingAddress.City}, {order.ShippingAddress.State} {order.ShippingAddress.PostalCode}");
                        text.Line($"{order.ShippingAddress.Country}");
                    });

                    // Order items
                    column.Item().PaddingTop(10).Text("Order Items")
                        .SemiBold().FontSize(14);

                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(50);
                            columns.RelativeColumn(3);
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("#");
                            header.Cell().Text("Item");
                            header.Cell().Text("Quantity").AlignRight();
                            header.Cell().Text("Unit Price").AlignRight();
                            header.Cell().Text("Total").AlignRight();

                            header.Cell().ColumnSpan(5).BorderBottom(1).BorderColor(Colors.Black);
                        });

                        var index = 1;
                        foreach (var item in order.OrderLines)
                        {
                            table.Cell().Text(index.ToString());
                            table.Cell().Text(item.ProductName);
                            table.Cell().Text(item.Quantity.ToString()).AlignRight();
                            table.Cell().Text($"{item.UnitPrice.Amount:C} {item.UnitPrice.Currency}").AlignRight();
                            table.Cell().Text($"{item.LineTotal.Amount:C} {item.LineTotal.Currency}").AlignRight();

                            index++;
                        }

                        table.Cell().ColumnSpan(3);
                        table.Cell().Text("Total:").Bold().AlignRight();
                        table.Cell().Text($"{order.TotalAmount.Amount:C} {order.TotalAmount.Currency}").Bold()
                            .AlignRight();
                    });
                });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Thank you for your purchase!");
                        x.Span(" | ");
                        x.Span("Page ").SemiBold();
                        x.CurrentPageNumber();
                        x.Span(" of ").SemiBold();
                        x.TotalPages();
                    });
            });
        });

        return document.GeneratePdf();
    }
}