using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Parking.Api.Data;
using Parking.Api.Middleware;
using Parking.Api.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// PostgreSQL connection
var conn = builder.Configuration.GetConnectionString("Postgres")
           ?? "Host=localhost;Port=5432;Database=parking_test;Username=postgres;Password=postgres";

builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseNpgsql(conn);
});

builder.Services.AddScoped<PlacaService>();
builder.Services.AddScoped<FaturamentoService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Parking API", Version = "v1" });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // porta do Vite/React
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

//Configura o Logging Estrutural
Log.Logger = new LoggerConfiguration()
             .Enrich.FromLogContext()
             .Enrich.WithMachineName()
             .Enrich.WithThreadId()
             .WriteTo.Console()
             .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
             .CreateLogger();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors("AllowFrontend");

app.MapControllers();

app.Run();
