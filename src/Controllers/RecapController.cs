using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using prevsup.Models;
using prevsup.Utils;
using prevsup.ViewModel;
using System;
using System.IO;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Linq;

namespace prevsup.Controllers
{
    public class RecapController : BaseController
    {
        public RecapController(IConfiguration config, ILogger<RecapController> _logger, IWebHostEnvironment _environment, IMemoryCache _memoryCache, DataService _dataService) : base(config, _logger, _environment, _memoryCache, _dataService)
        {
        }

        #region actions
        [HttpPost]
        public IActionResult CreateRecap(string name, string userId, string academyId, string idscenario)
        {

            try
            {
                Logger.LogInformation("Start CreateRecap");
                dbContext.InitRecapitulatif();

                if (Recapitulatif.Exists(dbContext.CRecapitulatif, userId, name, academyId)) throw new Exception("Ce nom existe déjà. Veuillez choisir un autre nom.");
                // Kaky - 08/08/2021 - Nouveau code de Recap
                // INFO: Get Scenario
                ScenarioViewModel scenario = GetScenarioById(idscenario);
                string summaryRootPath = Path.Combine(Environment.WebRootPath, "Summary");

                // INFO: Create Recap and launch Engine
                Recapitulatif newRecap = Recapitulatif.Create(scenario.ht_data, academyId, userId, name, idscenario);
                newRecap.Series = Recapitulatif.ExecuteEngine(newRecap.Series, summaryRootPath, scenario.firstYears, scenario.lastYears, true);


                // INFO: Insert recapitulatif
                Recapitulatif.Insert(dbContext.CRecapitulatif, newRecap);

                // INFO: Create Result Object
                ModelTreeRecap res = Recapitulatif.CreateTree(newRecap.Series, summaryRootPath, scenario, newRecap.Id);

                Logger.LogInformation("End CreateRecap");
                return Json(JsonConvert.SerializeObject(res, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        //TODO: Check if Tab recap name exist
        [HttpPost]
        public IActionResult OpenRecap(string userId, string academyId, string recapit)
        {

            try
            {
                Logger.LogInformation("Start OpenRecap");
                dbContext.InitRecapitulatif();

                // Kaky - 08/08/2022 - Nouveau code recap
                string summaryRootPath = Path.Combine(Environment.WebRootPath, "Summary");

                Recapitulatif foundRecap = Recapitulatif.Find(dbContext.CRecapitulatif, userId, recapit);
                ScenarioViewModel scenario = GetScenarioById(foundRecap.idscenario1);
                foundRecap.Series = Recapitulatif.ExecuteEngine(foundRecap.Series, summaryRootPath, scenario.firstYears, scenario.lastYears);

                // Create Result Object
                ModelTreeRecap res = Recapitulatif.CreateTree(foundRecap.Series, summaryRootPath, scenario, foundRecap.Id);

                Logger.LogInformation("End OpenRecap");
                return Json(JsonConvert.SerializeObject(res, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpDelete]
        public IActionResult DeleteRecap(string name)
        {
            try
            {
                Logger.LogInformation("Start DeleteRecap");
                dbContext.InitRecapitulatif();
                Recapitulatif.Delete(dbContext.CRecapitulatif, name);
                Logger.LogInformation("End DeleteRecap");
                var res = new { result = "success", msg = "Récapitulatif supprimer avec succès" };
                return Json(JsonConvert.SerializeObject(res, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult ListRecap(string userId, string academyId)
        {
            try
            {
                Logger.LogInformation("Start ListRecap");
                //Données Académiques

                //Constats
                dbContext.InitRecapitulatif();
                var datas1 = Recapitulatif.FindAll(dbContext.CRecapitulatif, userId);
                //datas1.Constats = dbContext.CConstat.Find(x => x.user == userId && x.academy == academyId).ToList();

                //Scenario

                //tab recap
                Logger.LogInformation("End ListRecap");
                return Json(JsonConvert.SerializeObject(datas1, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

        }


        [HttpPost]
        public IActionResult downloadFile(string name, string type, string userId, string academyId)
        {
            try
            {
                Logger.LogInformation("Start downloadFile");
                if (type != "eff" && type != "dip" && type != "acc") throw new Exception("Veuillez vérifier que Type soit parmis {eff, dip, acc}");
                dbContext.InitRecapitulatif();

                // INFO: Setup Export
                Recapitulatif foundRecap = Recapitulatif.Find(dbContext.CRecapitulatif, userId, name);
                var foundScenario = GetScenarioById(foundRecap.idscenario1);
                var scenariodata = RecapUtil.getDataRecapByscenario(foundScenario, foundRecap.Series);
                ExportRecap export = new ExportRecap(Environment.WebRootPath, foundRecap, type, scenariodata);

                // INFO: Download the file
                string fileName = export.WriteToCSV();

                var result = new { Path = fileName };

                Logger.LogInformation("End downloadFile");
                return Json(JsonConvert.SerializeObject(result, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult GetRecapitulatifArchive(string id, string name, string type, string user, string academy)
        {
            var model = new Archive();
            model.Id = id;
            model.Name = name;
            if (academy == null || (academy != null && academy == "null")) academy = ObjectId.Empty.ToString();
            model.Type = "Recap";
            dbContext.InitRecapitulatif();
            var archives = dbContext.CRecapitulatif.AsQueryable().Where(x => x.iduser == user).Select(
                    c => new ArchiveItem() { Id = c.Id, Name = c.Name, Is_archive = c.Is_archive }
                ).OrderBy(c => c.Name).ToList();
            model.archives = archives;
            return Json(JsonConvert.SerializeObject(model, Settings));
        }

        #endregion actions
    }
}
