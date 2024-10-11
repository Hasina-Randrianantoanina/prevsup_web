using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using prevsup.Models;
using prevsup.Utils.Import;
using System;

using System.IO;

namespace prevsup.Controllers
{
    public class TestingController : BaseController
    {
        public MainController MainCtrl { get; set; }
        public ScenarioController ScenarioCtrl { get; set; }
        public ConstatController ConstatCtrl { get; set; }
        public RecapController RecapCtrl { get; set; }
        public TestingController(IConfiguration config, 
            ILogger<TestingController> _logger, 
            IWebHostEnvironment _environment, 
            IMemoryCache memoryCache, 
            DataService _dataService,
            MainController _mainCtrl,
            ScenarioController _scenarioCtrl,
            ConstatController _constatCtrl,
            RecapController _recapCtrl) : base(config, _logger, _environment, memoryCache, _dataService)
        {
            MainCtrl = _mainCtrl;
            ScenarioCtrl = _scenarioCtrl;
            ConstatCtrl = _constatCtrl;
            RecapCtrl = _recapCtrl;
        }
        [HttpGet]
        public IActionResult TestSimple()
        {
            return Json(JsonConvert.SerializeObject(new { result = "EmptyDbDone" }));
        }

        [HttpGet]
        public IActionResult EmptyDb()
        {
            var allRecap = Recapitulatif.FindAll(dbContext.CRecapitulatif);
            var allScen = Scenario.FindAll(dbContext.CScenario);
            var allCt = Constat.FindAll(dbContext.CConstat);

            foreach (var recap in allRecap)
            {
                RecapCtrl.DeleteRecap(recap.Name);
            }
            foreach (var scen in allScen)
            {
                ScenarioCtrl.Supprimer(scen.Id, null, "Scenario");
            }
            foreach (var ct in allCt)
            {
                ConstatCtrl.Supprimer(ct.Id, null, "Constat");
            }

            return Json(JsonConvert.SerializeObject(new { result = "EmptyDbDone" }));
        }
        [HttpGet]
        public IActionResult  TestExport()
        {
            string id = "6308d8adc40034e430e1367a";
            string degre = "Diplome";
            string vars = "DIP_M_N5_J";
            //ScenarioCtrl.ExportScenarioCSV(id, degre, vars);
            //vars = "P_ACA_L_JA";
            //degre = "Academie";
            //vars = "EFF_TOT_FIL";
            ScenarioCtrl.ExportScenarioCSV(id, degre, vars);
            return Json(JsonConvert.SerializeObject(new { result = "TestExportDone" }));
        }

        [HttpGet]
        public IActionResult TestGenerateAll(string userId = "615c1b8dde38e583f951ed35", string acaId = "62e271d189c840d1300b4c0c") // userId = SSR70, acaId = 70 (Ensemble)
        {
            dbContext.InitRecapitulatif();
            dbContext.InitScenario();
            dbContext.InitConstat();

            var today = DateTime.Now;
            string ctName = "ct-" + today.ToString();
            ctName = ctName.Replace(":", "_").Replace(" ", "_").Replace("/", "_");

            // Appel de création constat
            string years = "2010_2021";
            int lastYear = Int32.Parse(years.Split("_")[1]);
            ConstatCtrl.GetConstat("newId0", ctName, years, true, userId, acaId);
            string idConstat = Constat.FindByName(dbContext.CConstat, ctName, userId).Id;
            //Appel de création scénario
            string sName = "s-" + ctName;
            bool isEasy = true;
            ScenarioCtrl.GetFirstTreeScenario("newId3", sName, String.Format("{0}_{1}", lastYear + 1, lastYear + 2), true, idConstat, "J900", null, isEasy, false);
            string idScenario = Scenario.FindByName(dbContext.CScenario, sName, userId).Id;

            string[] degres = new string[] { "Entrant", "1", "2", "3", "4", "5", "6", "Diplome", "Academie" };
            int newDeg = 1;
            foreach (string degre in degres)
            {
                ScenarioCtrl.ReconduireVariables(idScenario, lastYear, degre);
                ScenarioCtrl.CalculContexte(idScenario, degre, newDeg);
                newDeg++;
            }
            // Appel de création récapitulatif
            string rName = "rt-" + sName;
            RecapCtrl.CreateRecap(rName, userId, acaId, idScenario);

            return Json(JsonConvert.SerializeObject(new { result = "TestGenerateAllDone" }));
        }

        [HttpGet]
        public IActionResult TestImportAll()
        {
            for(int i = 2010; i <= 2017; i++)
            {
                ImportData imp = new ImportData();
                Boolean isSuccess = imp.ImportYearData(dbContext.CAcademy, dbContext.CAcademyDatas, dbContext.CImportedYear, "D:\\Projets\\matrices_prevsup\\Data2010-2021\\D" + i);
            }
            for (int i = 2018; i <= 2021; i++)
            {
                ImportData imp = new ImportData();
                Boolean isSuccess = imp.ImportYearData(dbContext.CAcademy, dbContext.CAcademyDatas, dbContext.CImportedYear, "D:\\Projets\\matrices_prevsup\\Data2010-2021\\Data" + i);
            }
            return Json(JsonConvert.SerializeObject(new { result = "TestImportAllDone" }));
          
        }
    }
}