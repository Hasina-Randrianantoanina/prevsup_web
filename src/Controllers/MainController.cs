using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using prevsup.Models;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using MongoDB.Bson;
using System.Globalization;
using prevsup.ViewModel;
using prevsup.Utils;
using System.Xml;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using System.IO;
using System.IO.Compression;
using CsvHelper;
using System.Xml.Serialization;
using CsvHelper.Configuration;
using System.Text;
using Microsoft.AspNetCore.Http;
// using System.Text.Json; 


namespace prevsup.Controllers
{
    public class MainController : BaseController
    {



        public MainController(IConfiguration config, ILogger<MainController> _logger, IWebHostEnvironment _environment, IMemoryCache _memoryCache, DataService _dataService) : base(config, _logger, _environment, _memoryCache, _dataService)
        {
        }
        public IActionResult Login()
        {
            return View();
        }

        [HttpGet]
        public IActionResult GetFile(string file)
        {
            try
            {
                string path = Environment.WebRootPath + "/FileCSV/" + file;
                var fs = new FileStream(path, FileMode.Open);
                return File(fs, "application/CSV", "Tab recap LMD.csv");
            }
            catch { return null; }
        }

        [HttpPost]
        public IActionResult GetAides()
        {
            try
            {
                string path = Path.Combine(Environment.WebRootPath, "Aide/aides.json");
                var jsonData = System.IO.File.ReadAllText(path); //read all the content inside the file

                if (string.IsNullOrWhiteSpace(jsonData)) return Json(JsonConvert.SerializeObject(new List<string>(), Settings));
                var aides = JsonConvert.DeserializeObject<List<string>>(jsonData);
                if (aides == null || aides.Count == 0) return Json(JsonConvert.SerializeObject(new List<string>(), Settings));

                return Json(JsonConvert.SerializeObject(aides, Settings));
            }
            catch { return Json(JsonConvert.SerializeObject(new List<string>(), Settings)); }
        }

        [HttpPost]
        public IActionResult ListAcademy()
        {
            try
            {
                Logger.LogInformation("Start ListAcademy");
                //var academies = dbContext.CAcademy.AsQueryable().Select(x => new
                //{
                //    Id = x.Id,
                //    Name = x.Name,
                //}).OrderBy(x => x.Name).ToList();
                var academies = AcademyData.FindAllAca(dbContext.CAcademyDatas, dbContext.CAcademy);
                Logger.LogInformation("End ListAcademy");
                return Json(JsonConvert.SerializeObject(academies, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult ListUserAcademy(string iduser)
        {
            try
            {
                Logger.LogInformation("Start ListUserAcademy");
                var academies = dbContext.CAcademy.AsQueryable().Select(x => new
                {
                    Id = x.Id,
                    Name = x.Name,
                    Selected = "selected",
                }).OrderBy(x => x.Name).ToList();
                Logger.LogInformation("End ListUserAcademy");
                return Json(JsonConvert.SerializeObject(academies, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }


}