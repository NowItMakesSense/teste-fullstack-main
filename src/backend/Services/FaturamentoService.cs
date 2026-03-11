using Microsoft.EntityFrameworkCore;
using Parking.Api.Data;
using Parking.Api.Models;

namespace Parking.Api.Services
{
    public class FaturamentoService
    {
        private readonly AppDbContext _db;
        public FaturamentoService(AppDbContext db) => _db = db;

        public async Task<List<Fatura>> GerarAsync(string competencia, CancellationToken ct = default)
        {
            var part = competencia.Split('-');
            var ano = int.Parse(part[0]);
            var mes = int.Parse(part[1]);
            var ultimoDia = DateTime.DaysInMonth(ano, mes);
            var primeiroDia = new DateTime(ano, mes, 1, 00, 00, 00, DateTimeKind.Utc);
            var corte = new DateTime(ano, mes, ultimoDia, 23, 59, 59, DateTimeKind.Utc);

            var mensalistas = await _db.Clientes.Where(c => c.Mensalista)
                                                .AsNoTracking()
                                                .ToListAsync(ct);

            var criadas = new List<Fatura>();
            foreach (var cli in mensalistas)
            {
                //Verifica o Historica, Buscando junto na tabela Fatura para descobrir quais ainda nao foram faturados pela data de competencia fornecida
                var historico = await _db.HistoricoVeiculos.Where(historico => 
                                                                     historico.ClienteId == cli.Id
                                                                  && historico.DataInicio <= corte
                                                                  && (historico.DataFim == null || historico.DataFim > corte) // Filtra no Historico pelo Periodo
                                                                  && !_db.Faturas.Where(f => f.ClienteId == cli.Id && f.Competencia == competencia) 
                                                                                 .SelectMany(f => f.Veiculos) // Verifica na Tabela de Fatura, para saber se ja foi faturado
                                                                                 .Any(v => v.VeiculoId == historico.VeiculoId)).ToListAsync(ct);

                if (!historico.Any()) continue;
                var fat = new Fatura
                {
                    Competencia = competencia,
                    ClienteId = cli.Id,
                    Observacao = "",
                };

                foreach (var item in historico)
                {
                    fat.Valor += CalcularMensalidadeProporcional(primeiroDia, item.DataFim ?? corte, (decimal)cli.ValorMensalidade!);
                    fat.Veiculos.Add(new FaturaVeiculo
                    {
                        FaturaId = fat.Id,
                        VeiculoId = item.VeiculoId
                    });
                }

                _db.Faturas.Add(fat);
                criadas.Add(fat);
            }

            await _db.SaveChangesAsync(ct);
            return criadas;
        }

        private static decimal CalcularMensalidadeProporcional(DateTime dataInicio, DateTime? dataFim, decimal valorMensalidade)
        {
            var fim = dataFim ?? DateTime.UtcNow;

            int diasUtilizados = (fim.Date - dataInicio.Date).Days + 1;
            int diasNoMes = DateTime.DaysInMonth(dataInicio.Year, dataInicio.Month);
            decimal valorPorDia = valorMensalidade / diasNoMes;

            return Math.Round(valorPorDia * diasUtilizados, 2);
        }
    }
}
