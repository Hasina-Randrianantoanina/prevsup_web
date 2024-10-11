using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using Newtonsoft.Json;
using prevsup.Models;
using prevsup.ViewModel;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Controllers
{
    public class ArchiveController : BaseController
    {
        public ArchiveController(IConfiguration config, ILogger<ArchiveController> _logger, IWebHostEnvironment _environment, IMemoryCache _memoryCache, DataService _dataService) : base(config, _logger, _environment, _memoryCache, _dataService)
        {
        }


        #region actions
        public PartialViewResult GetInterfaceArchive(string id, string name, string type, string user, string academy)
        {
            var model = new Archive(); 
            model.Id = id;
            model.Name = name;
            if (academy == null || (academy != null && academy == "null")) academy = ObjectId.Empty.ToString();
            if (id == "archive_constats")
            {
                model.Type = "Constat";
                dbContext.InitConstat();
                var archives = dbContext.CConstat.AsQueryable().Where(x => x.user == user && x.academy == academy).Select(
                        c => new ArchiveItem() { Id = c.Id, Name = c.Name, Is_archive = c.Is_archive }
                    ).OrderBy(c => c.Name).ToList();
                model.archives = archives;
            }
            else if (id == "archive_scenarios")
            {
                model.Type = "Scenario";
                dbContext.InitScenario();
                var archives = dbContext.CScenario.AsQueryable().Where(x => x.user == user && x.academy == academy).Select(
                        c => new ArchiveItem() { Id = c.Id, Name = c.Name, Is_archive = c.Is_archive }
                    ).OrderBy(c => c.Name).ToList();
                model.archives = archives;
            }
            else if (id == "archive_recaps")
            {
                model.Type = "Recap";
                dbContext.InitRecapitulatif();
                var archives = dbContext.CRecapitulatif.AsQueryable().Where(x => x.iduser == user).Select(
                        c => new ArchiveItem() { Id = c.Id, Name = c.Name, Is_archive = c.Is_archive }
                    ).OrderBy(c => c.Name).ToList();
                model.archives = archives;
            }
            return PartialView("~/Views/Shared/_ArchivePartial.cshtml", model);
        }

        public async Task<IActionResult> ArchiveSave(string ListArchive, string type, string test)
        {
            var archives = JsonConvert.DeserializeObject<List<ArchiveItem>>(ListArchive);
            if (type == "Constat")
            {
                foreach (var item in archives)
                {

                    var constat = MemCache.Get<ConstatViewModel>(item.Id);
                    var filter = Builders<Constat>.Filter.Eq(x => x.Id, item.Id);
                    var update = Builders<Constat>.Update.Set(x => x.Is_archive, item.Is_archive);

                    var result = await dbContext.CConstat.UpdateOneAsync(filter, update);
                }
            }
            else if (type == "Scenario")
            {
                foreach (var item in archives)
                {

                    var scenario = MemCache.Get<ScenarioViewModel>(item.Id);
                    var filter = Builders<Scenario>.Filter.Eq(x => x.Id, item.Id);
                    var update = Builders<Scenario>.Update.Set(x => x.Is_archive, item.Is_archive);

                    var result = await dbContext.CScenario.UpdateOneAsync(filter, update);
                }
            }
            else if (type == "Recap")
            {
                foreach (var item in archives)
                {

                    var recap = MemCache.Get<RecapitulatifViewModel>(item.Id);
                    var filter = Builders<Recapitulatif>.Filter.Eq(x => x.Id, item.Id);
                    var update = Builders<Recapitulatif>.Update.Set(x => x.Is_archive, item.Is_archive);

                    var result = await dbContext.CRecapitulatif.UpdateOneAsync(filter, update);
                }
            }


            return Json("");
        }

        public IActionResult CalculMere(string id, string type, string year, string deg, bool isI)
        {
            if (deg.Length > 2) deg = deg[0].ToString() + deg[1].ToString();

            if (type == "Constat")
            {
                var tree = MemCache.Get<ConstatViewModel>(id);
                var variable = id.Split("_")[0];
                int index = (variable == "T") ? int.Parse(year) - tree.First_year - 1 : int.Parse(year) - tree.First_year;
                List<OneSerie> serie;
                if (index < 0) index = 0;

                if (isI) serie = tree.series.Where(x => x.Variable.StartsWith("TERM_" + deg)).Select(x => new OneSerie() { Variable = x.Variable, Value = x.Values[index] }).ToList();
                else serie = tree.series.Where(x => x.Variable.StartsWith("EFF_" + deg)).Select(x => new OneSerie() { Variable = x.Variable, Value = x.Values[index] }).ToList();
                return Json(JsonConvert.SerializeObject(serie, Settings));
            }
            else
            {
                var tree = MemCache.Get<ScenarioViewModel>(id);
                var variable = id.Split("_")[0];
                int index = (variable == "T") ? int.Parse(year) - tree.firstYears - 1 : int.Parse(year) - tree.firstYears;
                List<OneSerie> serie;
                if (index < 0) index = 0;

                if (isI) serie = tree.ht_data.Where(x => x.Variable.StartsWith("TERM_" + deg)).Select(x => new OneSerie() { Variable = x.Variable, Value = x.Values[index] }).ToList();
                else serie = tree.ht_data.Where(x => x.Variable.StartsWith("EFF_" + deg)).Select(x => new OneSerie() { Variable = x.Variable, Value = x.Values[index] }).ToList();
                return Json(JsonConvert.SerializeObject(serie, Settings));
            }
        }
        #endregion actions
    }
}
