using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Parking.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVeiculoHistorico : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "veiculo_cliente_historico",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    veiculo_id = table.Column<Guid>(type: "uuid", nullable: false),
                    cliente_id = table.Column<Guid>(type: "uuid", nullable: false),
                    data_inicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    data_fim = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_veiculo_cliente_historico", x => x.id);
                    table.ForeignKey(
                        name: "FK_veiculo_cliente_historico_cliente_cliente_id",
                        column: x => x.cliente_id,
                        principalSchema: "public",
                        principalTable: "cliente",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_veiculo_cliente_historico_veiculo_veiculo_id",
                        column: x => x.veiculo_id,
                        principalSchema: "public",
                        principalTable: "veiculo",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_veiculo_cliente_historico_lookup",
                schema: "public",
                table: "veiculo_cliente_historico",
                columns: new[] { "veiculo_id", "data_inicio", "data_fim" });

            migrationBuilder.CreateIndex(
                name: "IX_veiculo_cliente_historico_cliente_id",
                schema: "public",
                table: "veiculo_cliente_historico",
                column: "cliente_id");

            migrationBuilder.Sql(@"
                                  CREATE OR REPLACE FUNCTION fn_veiculo_cliente_historico()
                                  RETURNS trigger AS $$
                                  BEGIN
                                  
                                      IF NEW.cliente_id <> OLD.cliente_id THEN
                                  
                                          UPDATE veiculo_cliente_historico
                                          SET data_fim = now()
                                          WHERE veiculo_id = OLD.id
                                          AND data_fim IS NULL;
                                  
                                          INSERT INTO veiculo_cliente_historico
                                          (id, veiculo_id, cliente_id, data_inicio)
                                          VALUES
                                          (uuid_generate_v4(), NEW.id, NEW.cliente_id, now());
                                  
                                      END IF;
                                  
                                      RETURN NEW;
                                  
                                  END;
                                  $$ LANGUAGE plpgsql;");

            migrationBuilder.Sql(@"
                                  CREATE TRIGGER trg_veiculo_cliente_historico
                                  AFTER UPDATE OF cliente_id
                                  ON veiculo
                                  FOR EACH ROW
                                  EXECUTE FUNCTION fn_veiculo_cliente_historico();");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "veiculo_cliente_historico",
                schema: "public");
        }
    }
}
