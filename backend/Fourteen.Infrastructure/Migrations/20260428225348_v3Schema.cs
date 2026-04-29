using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fourteen.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class v3Schema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "sample_size",
                table: "profiles",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "sample_size",
                table: "profiles");
        }
    }
}
