using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NLog;
using NLog.Extensions.Logging;
using NLog.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup
{
    public static class Program
{
#if LINUX
        private static IConfiguration Configuration;
#endif

    public static void Main(string[] args)
        {
            var logger = LogManager.Setup()
                                   .LoadConfigurationFromAppSettings()
                                   .GetCurrentClassLogger();
#if LINUX
            Configuration = new ConfigurationBuilder()
                .AddEnvironmentVariables()
                .AddCommandLine(args)
                .AddJsonFile("appsettings.json")
                .Build();
#endif

            try
            {
                logger.Debug("Init main");
                CreateHostBuilder(args).Build().Run();
            }
            catch (Exception exception)
            {
                //NLog: catch setup errors
                logger.Error(exception, "Stopped program because of exception");
                throw;
            }
            finally
            {
                // Ensure to flush and stop internal timers/threads before application-exit (Avoid segmentation fault on Linux)
                NLog.LogManager.Shutdown();
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args)
        {
            return Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
#if LINUX
                int webPort = int.Parse(Configuration["webPort"] ?? "5000");
                string url = "http://localhost:" + (Configuration["webPort"] ?? "5000");
                webBuilder.UseUrls(url);
                webBuilder.UseKestrel(opts =>
                {
                    opts.ListenAnyIP(webPort);
                });
#endif
            })
            .ConfigureLogging(logging =>
            {
                logging.ClearProviders();
                // Kaky - 20/06/2022 - Pour afficher les logs dans la console
                logging.AddConsole();
                logging.SetMinimumLevel(Microsoft.Extensions.Logging.LogLevel.Trace);
            })
            .UseNLog();  // NLog: Setup NLog for Dependency injection
        }
    }
}