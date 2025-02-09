using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddedAntityFunc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Address_Street",
                table: "CustomerAddress",
                newName: "Street");

            migrationBuilder.RenameColumn(
                name: "Address_State",
                table: "CustomerAddress",
                newName: "State");

            migrationBuilder.RenameColumn(
                name: "Address_PostalCode",
                table: "CustomerAddress",
                newName: "PostalCode");

            migrationBuilder.RenameColumn(
                name: "Address_Country",
                table: "CustomerAddress",
                newName: "Country");

            migrationBuilder.RenameColumn(
                name: "Address_City",
                table: "CustomerAddress",
                newName: "City");

            migrationBuilder.AddColumn<bool>(
                name: "Preferences_MarketingEmails",
                table: "CustomerProfile",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Preferences_NewsletterSubscribed",
                table: "CustomerProfile",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Preferences_OrderNotifications",
                table: "CustomerProfile",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Preferences_PreferredCurrency",
                table: "CustomerProfile",
                type: "nvarchar(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "USD");

            migrationBuilder.AddColumn<string>(
                name: "Preferences_PreferredLanguage",
                table: "CustomerProfile",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "en");

            migrationBuilder.AddColumn<string>(
                name: "Apartment",
                table: "CustomerAddress",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "CustomerAddress",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "CustomerAddress",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "CustomerAddress",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StreetNumber",
                table: "CustomerAddress",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfile_Email",
                table: "CustomerProfile",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CustomerProfile_Email",
                table: "CustomerProfile");

            migrationBuilder.DropColumn(
                name: "Preferences_MarketingEmails",
                table: "CustomerProfile");

            migrationBuilder.DropColumn(
                name: "Preferences_NewsletterSubscribed",
                table: "CustomerProfile");

            migrationBuilder.DropColumn(
                name: "Preferences_OrderNotifications",
                table: "CustomerProfile");

            migrationBuilder.DropColumn(
                name: "Preferences_PreferredCurrency",
                table: "CustomerProfile");

            migrationBuilder.DropColumn(
                name: "Preferences_PreferredLanguage",
                table: "CustomerProfile");

            migrationBuilder.DropColumn(
                name: "Apartment",
                table: "CustomerAddress");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "CustomerAddress");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "CustomerAddress");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "CustomerAddress");

            migrationBuilder.DropColumn(
                name: "StreetNumber",
                table: "CustomerAddress");

            migrationBuilder.RenameColumn(
                name: "Street",
                table: "CustomerAddress",
                newName: "Address_Street");

            migrationBuilder.RenameColumn(
                name: "State",
                table: "CustomerAddress",
                newName: "Address_State");

            migrationBuilder.RenameColumn(
                name: "PostalCode",
                table: "CustomerAddress",
                newName: "Address_PostalCode");

            migrationBuilder.RenameColumn(
                name: "Country",
                table: "CustomerAddress",
                newName: "Address_Country");

            migrationBuilder.RenameColumn(
                name: "City",
                table: "CustomerAddress",
                newName: "Address_City");
        }
    }
}
