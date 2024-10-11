using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;

using prevsup.Models;
using prevsup.Utils.Import;
using System.IO;
using System.Threading;

namespace prevsup.Controllers
{
    public class ImportDataController : BaseController
    {
        public static Progress ProgressStatus;
        public static Boolean IsImportRunning {get; set;}

        public ImportDataController(IConfiguration config, ILogger<ImportDataController> _logger, IWebHostEnvironment _environment, IMemoryCache memoryCache, DataService _dataService): base(config, _logger, _environment, memoryCache, _dataService)
        {
            if (ImportDataController.ProgressStatus == null) ImportDataController.ProgressStatus = new Progress();
        }

        //public IActionResult Index()
        //{
        //    return StatusCode(StatusCodes.Status200OK, Json(JsonConvert.SerializeObject(new Response{ Result = "ImportDataController Index" })));
        //}

        [HttpPost]
        public IActionResult Index(IFormFile upload)
        {
            try
            {
                Logger.LogInformation("Start Import");
                if(IsImportRunning) throw new Exception("Veuillez attendre la procédure d'import en cours avant de lancer un nouvel import.");

                ImportData imp = new ImportData();
                string rootPath = Path.Combine(Environment.WebRootPath, "upload");

                IsImportRunning = true;
                ImportDataController.ProgressStatus.Status = String.Format("Import de {0} en cours", upload.FileName);
                Boolean isSuccess = imp.ImportYearData(dbContext.CAcademy, dbContext.CAcademyDatas, dbContext.CImportedYear, rootPath, upload);
                //Thread.Sleep(60000);

                IsImportRunning = false;


                Logger.LogInformation("End Import");
                return Json(JsonConvert.SerializeObject(new { result = "ImportDataYear" }));
            } catch(Exception ex)
            {
                ImportDataController.ProgressStatus.Status = "";
                IsImportRunning = false;
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
        
        [HttpGet]
        public IActionResult Progress()
        {
            try
            {
                return Json(JsonConvert.SerializeObject(ImportDataController.ProgressStatus, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}
