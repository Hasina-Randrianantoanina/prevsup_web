using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MongoDB.Driver;
using prevsup.Controllers;
using prevsup.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup
{
    public class Startup
    {
        public void InitDB()
        {
            if (dbContext.dbClient is null)
            {
                string db = "";
                db = (String.IsNullOrEmpty(Configuration["dbUsername"]) && String.IsNullOrEmpty(Configuration["dbPassword"])) ?
                    Configuration["dbServerIP"] + ":" + Configuration["dbPort"] :
                    Configuration["dbUsername"] + ":" + Configuration["dbPassword"] + "@" + Configuration["dbServerIP"] + ":" + Configuration["dbPort"];
                dbContext.SetHost = db;
            }
        }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
            InitDB();
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(
                    policy =>
                    {
                        policy.WithOrigins("http://localhost:3000").AllowAnyMethod().AllowAnyHeader();
                        policy.WithOrigins("https://prevsupdev.softia.fr").AllowAnyMethod().AllowAnyHeader();
                        policy.WithOrigins("*").AllowAnyMethod().AllowAnyHeader();
                    });
            });

            services.AddControllersWithViews().AddJsonOptions( options => options.JsonSerializerOptions.PropertyNamingPolicy = null);
            services.AddMvc().AddControllersAsServices(); // Register all controllers as services
            services.AddSingleton<DataService>();

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            //app.UseCors();
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
#if !LINUX
                app.UseHsts();
#endif
            }
#if !LINUX
            app.UseHttpsRedirection();
#endif
            
            // Ce que l'application affiche au client en cas d'erreur
            app.UseStatusCodePages(); // TODO: à décommenter
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            app.UseCors();

            //app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    //spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
