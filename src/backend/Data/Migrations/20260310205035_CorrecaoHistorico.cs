using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Parking.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class CorrecaoHistorico : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                                  DROP TRIGGER IF EXISTS trg_veiculo_cliente_historico ON public.veiculo;                      
                                  DROP FUNCTION IF EXISTS fn_veiculo_cliente_historico();                
                                  DROP TABLE IF EXISTS public.veiculo_cliente_historico CASCADE;");

            migrationBuilder.Sql(@"
                                   CREATE TABLE public.veiculo_cliente_historico (
                                       id uuid PRIMARY KEY,
                                       veiculo_id uuid NOT NULL,
                                       cliente_id uuid NOT NULL,
                                       data_inicio timestamp NOT NULL,
                                       data_fim timestamp NULL,
                                   
                                       CONSTRAINT fk_veiculo_historico_veiculo
                                           FOREIGN KEY (veiculo_id) REFERENCES public.veiculo(id)
                                           ON DELETE CASCADE,
                                   
                                       CONSTRAINT fk_veiculo_historico_cliente
                                           FOREIGN KEY (cliente_id) REFERENCES public.cliente(id)
                                           ON DELETE RESTRICT
                                   );
                                   
                                   CREATE INDEX idx_veiculo_cliente_historico_lookup
                                   ON public.veiculo_cliente_historico(veiculo_id, data_inicio, data_fim);
                                   
                                   CREATE UNIQUE INDEX ux_veiculo_historico_aberto
                                   ON public.veiculo_cliente_historico(veiculo_id)
                                   WHERE data_fim IS NULL;");

            migrationBuilder.Sql(@"
                                   CREATE OR REPLACE FUNCTION fn_veiculo_cliente_historico()
                                   RETURNS trigger AS $$
                                   BEGIN
                                   
                                       IF NEW.cliente_id = OLD.cliente_id THEN
                                           RETURN NEW;
                                       END IF;
                                   
                                       UPDATE veiculo_cliente_historico
                                       SET data_fim = now()
                                       WHERE veiculo_id = OLD.id
                                       AND data_fim IS NULL;
                                   
                                       INSERT INTO veiculo_cliente_historico
                                       (id, veiculo_id, cliente_id, data_inicio)
                                       VALUES
                                       (uuid_generate_v4(), NEW.id, NEW.cliente_id, now());
                                   
                                       RETURN NEW;
                                   
                                   END;
                                   $$ LANGUAGE plpgsql;");

            migrationBuilder.Sql(@"
                                  CREATE OR REPLACE FUNCTION fn_veiculo_cliente_historico()
                                  RETURNS trigger AS $$
                                  BEGIN
                                  
                                      IF NEW.cliente_id = OLD.cliente_id THEN
                                          RETURN NEW;
                                      END IF;
                                  
                                      UPDATE veiculo_cliente_historico
                                      SET data_fim = now()
                                      WHERE veiculo_id = OLD.id
                                      AND data_fim IS NULL;
                                  
                                      INSERT INTO veiculo_cliente_historico
                                      (id, veiculo_id, cliente_id, data_inicio)
                                      VALUES
                                      (uuid_generate_v4(), NEW.id, NEW.cliente_id, now());
                                  
                                      RETURN NEW;
                                  
                                  END;
                                  $$ LANGUAGE plpgsql;
                                  
                                  CREATE TRIGGER trg_veiculo_cliente_historico
                                  AFTER UPDATE OF cliente_id
                                  ON public.veiculo
                                  FOR EACH ROW
                                  EXECUTE FUNCTION fn_veiculo_cliente_historico(); ");

            migrationBuilder.Sql(@"
                                   INSERT INTO veiculo_cliente_historico
                                   (id, veiculo_id, cliente_id, data_inicio)
                                   SELECT
                                       uuid_generate_v4(),
                                       v.id,
                                       v.cliente_id,
                                       v.data_inclusao
                                   FROM veiculo v;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
