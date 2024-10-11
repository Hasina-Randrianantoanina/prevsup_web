using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
using prevsup.Models;
using prevsup.Utils;
using prevsup.ViewModel;
using SharpCompress.Common;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Xml;

namespace prevsup.Controllers
{
    [ImportActionFilter]
    public class BaseController : Controller
    {
        #region properties
        public IConfiguration ConfigRoot;
        public ILogger<BaseController> Logger { get; set; }
        public IWebHostEnvironment Environment { get; set; }
        public IMemoryCache MemCache { get; set; }
        public JsonSerializerSettings Settings = new JsonSerializerSettings
        {
            TypeNameHandling = TypeNameHandling.Auto,
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
        };
        

        protected static object LockCalcul = new object();
        protected static object LockCalculMere = new object();
        protected static object LockChangeDegre = new object();


        protected readonly DataService _dataService;
        private static HashSet<Aide> AllAides = new HashSet<Aide>();
        static List<Filiere> detailFiliere = new List<Filiere>();
        static List<Formule> ListFormule = new List<Formule>();

        #endregion properties


        public BaseController(IConfiguration config, ILogger<BaseController> _logger, IWebHostEnvironment _environment, IMemoryCache _memoryCache, DataService dataService)
        {
            Logger = _logger;
            Environment = _environment;
            MemCache = _memoryCache;
            ConfigRoot = config;
            Logger.LogDebug(1, "NLog injected into Login");
            _dataService = dataService;
        }





        public IActionResult GetAllData()
        {
            return Json(JsonConvert.SerializeObject(new object[] { _dataService.detailFiliere, _dataService.variablesName, _dataService.ListFormule }, Settings));
        }

        public IActionResult GetAllDataProperties()
        {
            XmlDocument docAide = DOMUtili.getDocumentFromResourcePath(Path.Combine(Environment.WebRootPath, "Dictionnaire", "Aide.xml"), true);
            AllAides = new HashSet<Aide>();

            foreach (XmlNode node in docAide.SelectNodes("Aide/Key"))
            {
                string name = node.Attributes["name"].Value;
                string value = node.FirstChild.Attributes["value"].Value;

                string formule = node.ChildNodes.Count > 1 ? node.ChildNodes[2].InnerText : "";
                string link = node.ChildNodes.Count > 3 ? node.ChildNodes[3].Attributes["value"].Value : "";
                Aide nAide = new Aide() { Variable = node.Attributes["name"].Value, Definition = value, Formule = formule, Link = link };
                AllAides.Add(nAide);
            }
            return Json(JsonConvert.SerializeObject(new object[] { detailFiliere, AllAides, ListFormule}, Settings));
        }

        #region actions

        [HttpPost]
        public IActionResult InitData(string userId, string academyId)
        {
            try
            {
                Logger.LogInformation("Start InitData");

                var datas1 = new Datas();
                //Donn�es Acad�miques
                // Constats
                dbContext.InitConstat();
                datas1.Constats = dbContext.CConstat.AsQueryable().Where(x => x.user == userId /* && x.academy == academyId */ && !x.Is_archive)
                    .Select(x => new Constat()
                    {
                        Id = x.Id,
                        Name = x.Name,
                        First_year = x.First_year,
                        Last_year = x.Last_year,
                        user = x.user,
                        academy = x.academy,
                        Seq = x.Seq,
                        Documentation = x.Documentation,
                        Is_calculed = x.Is_calculed,
                        isEasy = x.isEasy,
                        isNational = x.isNational,
                        isAcademy = x.isAcademy
                    }).ToList();
                //datas1.Constats = dbContext.CConstat.Find(x => x.user == userId && x.academy == academyId).ToList();

                // Scenarios
                dbContext.InitScenario();
                datas1.Scenarios = dbContext.CScenario.AsQueryable().Where(x => x.user == userId /* && x.academy == academyId */ && !x.Is_archive)
                    .Select(x => new Scenario()
                    {
                        Id = x.Id,
                        Name = x.Name,
                        Observation = x.Observation,
                        Last_year = x.Last_year,
                        user = x.user,
                        academy = x.academy,
                        Seq = x.Seq,
                        Documentation = x.Documentation,
                        isEasy = x.isEasy,
                        Is_pepcs = x.Is_pepcs,
                        isNational = x.isNational,
                        isAcademy = x.isAcademy
                    }).ToList();

                // Users
                dbContext.InitUser();
                datas1.Utilisateurs = prevsup.Models.User.FindAll(dbContext.CUser);

                // Academies
                dbContext.InitAcademy();

                if (AcademyData.FindAll(dbContext.CAcademyDatas).Count == 0)
                {
                    datas1.Academies = Academy.FindAll(dbContext.CAcademy);
                }
                else
                {
                    datas1.Academies = AcademyData.FindAllAca(dbContext.CAcademyDatas, dbContext.CAcademy);
                }

                // Imported years
                dbContext.InitImportedYear();
                //datas1.ImportedYears = ImportedYear.FindAllImportedYears(dbContext.CImportedYear);
                //ImportedYears in List string type
                datas1.ImportedYearsString = ImportedYear.FindAll(dbContext.CImportedYear);

                Logger.LogInformation("End InitData");
                return Json(JsonConvert.SerializeObject(datas1, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

        }
        #endregion actions


        #region initialization

        #endregion initialization
  

        public IActionResult DownloadFileClient(string file, string filename)
        {
            try
            {
                Logger.LogInformation("Start DownloadFileClient");
                string path = Environment.WebRootPath + "/FileCSV/" + file;
                var fs = new FileStream(path, FileMode.Open);
                Logger.LogInformation("End DownloadFileClient");
                return File(fs, "application/CSV", filename);
                
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        public IEnumerable<NodeT> FlatToHierarchy(List<NodeT> list, string rootName)
        {
            try
            {
                Logger.LogInformation("Start FlatToHierarchy");
                // hashtable lookup that allows us to grab references to containers based on id
                var lookup = new Dictionary<string, NodeT>();
                var level = new Dictionary<string, int>();
                // actual nested collection to return
                var nested = new List<NodeT>();

                foreach (NodeT item in list)
                {
                    if (lookup.ContainsKey(item.Parent))
                    {
                        // add to the parent's child list 
                        item.level = level[item.Parent] + 1;
                        level[item.Name] = item.level;
                        lookup[item.Parent].Childs += "" + item.Id + "#";
                        item.IdParent = (lookup[item.Parent].Id);
                        lookup[item.Parent].ChildCount = 1;
                        lookup[item.Parent].Children.Add(item);
                    }
                    else
                    {
                        // no parent added yet (or this is the first time)
                        if (item.Parent == rootName)
                        {
                            item.level = 1;
                            item.IdParent = 0;
                            nested.Add(item);
                        }
                    }
                    if (!lookup.ContainsKey(item.Name))
                    {
                        lookup.Add(item.Name, item);
                    }
                    if (!level.ContainsKey(item.Name))
                        level.Add(item.Name, 1);
                }
                Logger.LogInformation("End FlatToHierarchy");
                return nested;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return null;
            }
        }

        protected void GetAllChild(TreeModelView treeView, string id, List<model> model, int[] level)
        {
            var list = treeView.model.Where(a => a.ParentId == id);
            if (list == null)
            {
                var l = treeView.model.Where(a => a.Idm == id);
                return;
            }
            foreach (var item in list)
            {
                item.Level = level[0];
                model.Add(item);
                int[] newLevel = new int[1];
                newLevel[0] = level[0] + 1;
                GetAllChild(treeView, item.Idm, model, newLevel);
            }
        }


        #region usingcache
        protected void UpdateCacheConstat(string id)
        {
            DeleteCacheConstat(id);

            GetConstatById(id);
        }

        protected void DeleteCacheConstat(string id)
        {
            ScenarioViewModel res = null;
            MemCache.TryGetValue(id, out res);
            if (res != null)
            {
                MemCache.Remove(id);
            }
        }
        protected ScenarioViewModel GetScenarioById(string id)
        {

            ScenarioViewModel res;
            MemCache.TryGetValue(id, out res);

            if (res == null)
            {
                // Set cache options.
                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    // Keep in cache for this time, reset time if accessed.
                    .SetSlidingExpiration(TimeSpan.FromDays(7));
                res = Scenario.FindVMById(dbContext.CScenario, dbContext.CConstat, id);
                MemCache.Set(id, res, cacheEntryOptions);
            }


            return res;
        }

        protected ConstatViewModel GetConstatById(string id)
        {

            ConstatViewModel res = null;
            MemCache.TryGetValue(id, out res);
            if (res == null)
            {
                // Set cache options.
                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    // Keep in cache for this time, reset time if accessed.
                    .SetSlidingExpiration(TimeSpan.FromDays(7));
                res = Constat.FindVMById(dbContext.CConstat, id);
                MemCache.Set(id, res, cacheEntryOptions);
            }

            return res;
        }

        protected void DeleteCacheScenario(string id)
        {
            ScenarioViewModel res = null;
            MemCache.TryGetValue(id, out res);
            if (res != null)
            {
                MemCache.Remove(id);
            }
        }

        protected void UpdateCacheScenario(string id, string newName)
        {
            ScenarioViewModel res;
            MemCache.TryGetValue(id, out res);

            if (res == null)
            {
                res = Scenario.FindVMById(dbContext.CScenario, dbContext.CConstat, id);
            }
            else
            {
                res.Name = newName.Trim();
            }

            var cacheEntryOptions = new MemoryCacheEntryOptions()
                    // Keep in cache for this time, reset time if accessed.
                    .SetSlidingExpiration(TimeSpan.FromDays(7));
            MemCache.Set(id, res, cacheEntryOptions);
        }


        protected void UpdateCacheScenario(string id, ScenarioViewModel scen, List<Serie> series, bool[] degres_modifies = null)
        {
            ScenarioViewModel res;
            MemCache.TryGetValue(id, out res);
            if (res == null) return;

            var cacheEntryOptions = new MemoryCacheEntryOptions()
                    // Keep in cache for this time, reset time if accessed.
                    .SetSlidingExpiration(TimeSpan.FromDays(7));
            if(series != null) scen.ht_data = series;
            if(degres_modifies != null) scen.degres_modifies = degres_modifies;
            MemCache.Set(id, scen, cacheEntryOptions);
        }

        protected void UpdateCacheScenario(string id, List<Serie> series, int lastDegree = -1, bool[] degres_modifies = null)
        {
            ScenarioViewModel res;
            MemCache.TryGetValue(id, out res);

            if (res == null) return;

            var cacheEntryOptions = new MemoryCacheEntryOptions()
                    // Keep in cache for this time, reset time if accessed.
                    .SetSlidingExpiration(TimeSpan.FromDays(7));
            if(series != null) res.ht_data = series;
            if (lastDegree != -1) res.Last_Degree = lastDegree;
            if (degres_modifies != null) res.degres_modifies = degres_modifies;
            
            MemCache.Set(id, res, cacheEntryOptions);
        }
        #endregion usingcache
        public TreeModelView ModelTree(string name, bool is_easy, bool isnat, bool isAcad)
        {
            string[] listNoNat = new string[] { "Diplome", "Academie" };
            string[] listNoEasy = new string[] { "Entrant", "1", "Diplome", "Academie" };
            if (name != null && name.Equals("Academy")) name = "Academie";
            if (name == null) name = "Entrant"; // TODO: Can this be equal to "Constat"?

            if (listNoEasy.Contains(name)) is_easy = false;
            if (listNoNat.Contains(name)) isnat = false;

            TreeModelView cacheEntry = null;
          
            // Look for cache key.
            string idModel = name + "µ" + is_easy + "µ" + isnat + "µ" + isAcad;
            if (!MemCache.TryGetValue(idModel, out cacheEntry))
            {
                // Tree not in cache, so get data.
                var res = dbContext.CModelTree
                        .Aggregate()
                        .Match(c => c.Degres == name && c.Is_Easy == is_easy && c.Is_National == isnat)
                        .Project(c => new
                        TreeModelView
                        {
                            Id = c.Id,
                            model = c.model

                        })
                        .FirstOrDefault();
                res.IsEasy = is_easy;
                cacheEntry = res;
                res.GetHypoModels();
                res.GetResModels();

                // Set cache options.
                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    // Keep in cache for this time, reset time if accessed.
                    .SetSlidingExpiration(TimeSpan.FromDays(7));

                // Save data in cache.
                MemCache.Set(idModel, cacheEntry, cacheEntryOptions);
            }
            return cacheEntry;
        }

        // INFO: Constat Calcul contexte
        protected List<Serie> calculConstatContexte(string name, string academyId, string userId, int firstYear, int lastYear)
        {
            var constat = new ConstatViewModel();

            var dAcademy = new AcademyData();
            dAcademy = AcademyData.FindById(dbContext.CAcademyDatas, academyId);

            AcademyData test = new AcademyData();
            List<int> yearso = new List<int>();
            foreach (string year in test.Year) yearso.Add(Int32.Parse(year));

            Utils.Engine.VarData varData = new Utils.Engine.VarData(yearso, yearso[yearso.Count - 1]);
            varData.IsConstat = true; // IMPORTANT TO SET THIS
            varData.HtData = GenUtils.SerieToDico(dAcademy.Series);

            Utils.Engine.Engine engine = new Utils.Engine.Engine(varData);
            string rootPath = Environment.WebRootPath + "/Calcule/";
            string summaryRootPath = Environment.WebRootPath + "/Summary/";

            string constatFolder = "Constat";
            if (dAcademy.Aca.Contains("70")) constatFolder = "ConstatNat";

            XmlDocument constatHypo = DomUtils.getDocumentFromResourcePath(rootPath + String.Format("/{0}/hypo.xml", constatFolder));
            XmlDocument constatModelXML = DomUtils.getDocumentFromResourcePath(rootPath + String.Format("/{0}/model.xml", constatFolder));

            Utils.Engine.VarData.NbYears = 30;

            for (int kk = 0; kk < 2; kk++)
            {
                varData.IsConstat = true;
                varData.IsTabRecap = false;
                engine.RtCompute(constatHypo.DocumentElement);
                engine.StaticCompute(constatModelXML.DocumentElement);
                engine.RtCompute(constatHypo.DocumentElement);
            }

            dAcademy.Series = GenUtils.DicoToSerie(varData.HtData);
            varData.HtData = null;
            // End Engine

            constat.First_year = int.Parse(dAcademy.Year.FirstOrDefault());
            constat.Last_year = int.Parse(dAcademy.Year.LastOrDefault());


            Constat newCon = new Constat();

            newCon.Seq = ConstatUtils.GetLastSeq();
            newCon.user = userId;
            newCon.academy = academyId;
            newCon.Is_calculed = false;
            newCon.Name = name;

            List<Serie> serLis = dAcademy.Series.Select(c => new Serie { Variable = c.Variable, Values = c.Values.ToList() }).ToList();

            newCon.Id = ObjectId.GenerateNewId().ToString();

            int first_years = firstYear;
            int last_years = lastYear;

            AcademyData acaCheckLastImport = AcademyData.FindAll(dbContext.CAcademyDatas).FirstOrDefault();
            if (acaCheckLastImport != null)
            {
                if (acaCheckLastImport.Year != null && acaCheckLastImport.Year.Count > 0)
                {
                    if (int.Parse(acaCheckLastImport.Year[acaCheckLastImport.Year.Count - 1]) < last_years) throw new Exception("L'année fin de constat " + last_years + " n'a pas été encore importée.");
                }
            }

            newCon.First_year = first_years;
            newCon.Last_year = last_years;

            newCon.isEasy = false;
            var acaIsWhole = _dataService.Academies.Where(x => x.Id.Equals(academyId)).FirstOrDefault();
            newCon.isNational = acaIsWhole.Is_Whole;
            newCon.isAcademy = false;

            int last, first;

            List<double> newValues = new List<double>();

            last = last_years - constat.Last_year;
            first = first_years - constat.First_year;
            TreeModelView modelTree = new TreeModelView();

            modelTree = ModelTree("Constat", newCon.isEasy, newCon.isNational, newCon.isAcademy);

            List<Serie> nSer = new List<Serie>();
            var mats = serLis.GroupJoin(modelTree.model, arg => arg.Variable, arg2 => arg2.ParentId, (first, second) => new { first.Variable, first.Values, Child = second.Count() }).ToList();

            if (first_years > constat.Last_year)
            {
                last = last_years - first_years;
                first = 0;

                foreach (var serie in mats)
                {
                    newValues = new List<double>();
                    for (int i = 0; i <= last; i++) newValues.Add(0);
                    nSer.Add(new Serie() { Variable = serie.Variable, Values = newValues });
                }

            }
            else
            {
                if (last > 0)
                {
                    foreach (var serie in mats)
                    {
                        newValues = new List<double>();

                        if (first < 0) for (int i = 0; i < Math.Abs(first); i++) newValues.Add(0);
                        for (int i = first; i < serie.Values.Count(); i++)
                        {
                            newValues.Add(serie.Values[i]);
                        }
                        for (int i = 0; i < last; i++) newValues.Add(0);

                        nSer.Add(new Serie() { Variable = serie.Variable, Values = newValues });
                    }
                }
                else if (last <= 0)
                {
                    try
                    {
                        foreach (var serie in mats)
                        {

                            newValues = new List<double>();

                            if (first < 0) for (int i = 0; i < Math.Abs(first); i++) newValues.Add(0);
                            for (int i = first; i < last_years - constat.First_year + 1; i++)
                            {
                                newValues.Add(serie.Values[i]);
                            }
                            nSer.Add(new Serie() { Variable = serie.Variable, Values = newValues });
                        }

                    }
                    catch (ArgumentOutOfRangeException ex)
                    {
                        throw new Exception("Veuillez vérifier l'année fin de constat");

                    }
                }
            }

            newCon.series = null;

            newCon.series2 = null;
            newCon.series = nSer;

            return nSer;
        }


    }
}