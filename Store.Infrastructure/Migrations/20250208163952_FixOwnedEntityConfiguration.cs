using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixOwnedEntityConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentSession_Order_OrderId",
                table: "PaymentSession");

            migrationBuilder.RenameColumn(
                name: "Amount_Currency",
                table: "PaymentSession",
                newName: "Currency");

            migrationBuilder.RenameColumn(
                name: "Amount_Amount",
                table: "PaymentSession",
                newName: "Amount");

            migrationBuilder.RenameColumn(
                name: "TotalAmount_Currency",
                table: "Order",
                newName: "Currency");

            migrationBuilder.RenameColumn(
                name: "TotalAmount_Amount",
                table: "Order",
                newName: "TotalAmount");

            migrationBuilder.RenameColumn(
                name: "ShippingAddress_Street",
                table: "Order",
                newName: "ShippingStreet");

            migrationBuilder.RenameColumn(
                name: "ShippingAddress_State",
                table: "Order",
                newName: "ShippingState");

            migrationBuilder.RenameColumn(
                name: "ShippingAddress_PostalCode",
                table: "Order",
                newName: "ShippingPostalCode");

            migrationBuilder.RenameColumn(
                name: "ShippingAddress_Country",
                table: "Order",
                newName: "ShippingCountry");

            migrationBuilder.RenameColumn(
                name: "ShippingAddress_City",
                table: "Order",
                newName: "ShippingCity");

            migrationBuilder.RenameColumn(
                name: "BillingAddress_Street",
                table: "Order",
                newName: "BillingStreet");

            migrationBuilder.RenameColumn(
                name: "BillingAddress_State",
                table: "Order",
                newName: "BillingState");

            migrationBuilder.RenameColumn(
                name: "BillingAddress_PostalCode",
                table: "Order",
                newName: "BillingPostalCode");

            migrationBuilder.RenameColumn(
                name: "BillingAddress_Country",
                table: "Order",
                newName: "BillingCountry");

            migrationBuilder.RenameColumn(
                name: "BillingAddress_City",
                table: "Order",
                newName: "BillingCity");

            migrationBuilder.AlterColumn<string>(
                name: "ShippingCountry",
                table: "Order",
                type: "nvarchar(2)",
                maxLength: 2,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "BillingCountry",
                table: "Order",
                type: "nvarchar(2)",
                maxLength: 2,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Currency",
                table: "PaymentSession",
                newName: "Amount_Currency");

            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "PaymentSession",
                newName: "Amount_Amount");

            migrationBuilder.RenameColumn(
                name: "TotalAmount",
                table: "Order",
                newName: "TotalAmount_Amount");

            migrationBuilder.RenameColumn(
                name: "ShippingStreet",
                table: "Order",
                newName: "ShippingAddress_Street");

            migrationBuilder.RenameColumn(
                name: "ShippingState",
                table: "Order",
                newName: "ShippingAddress_State");

            migrationBuilder.RenameColumn(
                name: "ShippingPostalCode",
                table: "Order",
                newName: "ShippingAddress_PostalCode");

            migrationBuilder.RenameColumn(
                name: "ShippingCountry",
                table: "Order",
                newName: "ShippingAddress_Country");

            migrationBuilder.RenameColumn(
                name: "ShippingCity",
                table: "Order",
                newName: "ShippingAddress_City");

            migrationBuilder.RenameColumn(
                name: "Currency",
                table: "Order",
                newName: "TotalAmount_Currency");

            migrationBuilder.RenameColumn(
                name: "BillingStreet",
                table: "Order",
                newName: "BillingAddress_Street");

            migrationBuilder.RenameColumn(
                name: "BillingState",
                table: "Order",
                newName: "BillingAddress_State");

            migrationBuilder.RenameColumn(
                name: "BillingPostalCode",
                table: "Order",
                newName: "BillingAddress_PostalCode");

            migrationBuilder.RenameColumn(
                name: "BillingCountry",
                table: "Order",
                newName: "BillingAddress_Country");

            migrationBuilder.RenameColumn(
                name: "BillingCity",
                table: "Order",
                newName: "BillingAddress_City");

            migrationBuilder.AlterColumn<string>(
                name: "ShippingAddress_Country",
                table: "Order",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(2)",
                oldMaxLength: 2);

            migrationBuilder.AlterColumn<string>(
                name: "BillingAddress_Country",
                table: "Order",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(2)",
                oldMaxLength: 2);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentSession_Order_OrderId",
                table: "PaymentSession",
                column: "OrderId",
                principalTable: "Order",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
