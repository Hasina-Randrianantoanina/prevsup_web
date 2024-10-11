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
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Controllers
{
    public class ConstatController : BaseController
    {

        public ConstatController(IConfiguration config, ILogger<ConstatController> _logger, IWebHostEnvironment _environment, IMemoryCache _memoryCache, DataService _dataService) : base(config, _logger, _environment, _memoryCache, _dataService)
        {
        }


        [HttpPost]
        public IActionResult GetConstat(string id, string name, string newYears, bool isNew, string userId, string academyId)
        {
            try
            {
                Logger.LogInformation("Start GetConstat");
                //dbContext.InitConstat();
                var constat = new ConstatViewModel();
                TreeModelView modelTree = new TreeModelView();
                var copyOrg = new Constat();

                //UXD
                var dAcademy = new AcademyData();
                //UXD

                // INFO: Test Constat
                Constat ct = Constat.FindByName(dbContext.CConstat, name, userId);
                if (ct != null) throw new Exception("Ce nom de constat existe déjà. Veuillez en choisir un autre.");

                if (!id.Contains("newId"))
                {
                    constat = GetConstatById(id).Clone() as ConstatViewModel;
                    if (academyId == "null")
                    {
                        academyId = constat.Academy;
                    }
                }
                else
                {
                    //UXD
                    // Kaky - 16/06/2022 - Utilisation de la nouvelle fonction


                    dAcademy = AcademyData.FindById(dbContext.CAcademyDatas, academyId);

                    // Kaky - 26/07/202 - Start Engine
                    AcademyData test = new AcademyData(); // TODO: This is just to get the imported Years in the database
                    List<int> years = new List<int>();
                    foreach (string year in test.Year) years.Add(Int32.Parse(year));

                    Utils.Engine.VarData varData = new Utils.Engine.VarData(years, years[years.Count - 1]);
                    varData.IsConstat = true; // IMPORTANT TO SET THIS
                    varData.HtData = GenUtils.SerieToDico(dAcademy.Series);

                    Utils.Engine.Engine engine = new Utils.Engine.Engine(varData);
                    string rootPath = Environment.WebRootPath + "/Calcule/";
                    string summaryRootPath = Environment.WebRootPath + "/Summary/";

                    string constatFolder = "Constat";
                    if (dAcademy.Aca.Contains("70")) constatFolder = "ConstatNat";

                    XmlDocument constatHypo = DomUtils.getDocumentFromResourcePath(rootPath + String.Format("/{0}/hypo.xml", constatFolder));
                    XmlDocument constatModel = DomUtils.getDocumentFromResourcePath(rootPath + String.Format("/{0}/model.xml", constatFolder));

                    Utils.Engine.VarData.NbYears = 30; // TODO: put it somewhere else

                    for (int kk = 0; kk < 2; kk++)
                    {
                        varData.IsConstat = true;
                        varData.IsTabRecap = false;
                        engine.RtCompute(constatHypo.DocumentElement);
                        engine.StaticCompute(constatModel.DocumentElement);
                        engine.RtCompute(constatHypo.DocumentElement);
                    }

                    dAcademy.Series = GenUtils.DicoToSerie(varData.HtData);
                    varData.HtData = null;
                    // End Engine

                    constat.First_year = int.Parse(dAcademy.Year.FirstOrDefault());
                    constat.Last_year = int.Parse(dAcademy.Year.LastOrDefault());

                }
                Logger.LogInformation("End GetDB");

                if (isNew && string.IsNullOrEmpty(newYears))
                {
                    Constat newCon = new Constat();
                    newCon.First_year = constat.First_year;
                    newCon.Last_year = constat.Last_year;

                    newCon.Seq = ConstatUtils.GetLastSeq();
                    newCon.user = userId;
                    newCon.academy = academyId;
                    newCon.Is_calculed = false;
                    newCon.Name = name;
                    newCon.series = constat.series.ToList();
                    newCon.Id = ObjectId.GenerateNewId().ToString();

                    newCon.isEasy = false;

                    newCon.isAcademy = _dataService.Academies.Where(x => x.Id == academyId).Select(x => !x.Is_Whole).FirstOrDefault();
                    newCon.isNational = !newCon.isAcademy;

                    //await dbContext.CConstat.InsertOneAsync(newCon);
                    Constat.InsertOrUpdate(dbContext.CConstat, constat.series.ToList(), newCon);
                    UpdateCacheConstat(newCon.Id);

                    var model = new CreateIndexModel<Constat>(
                         Builders<Constat>.IndexKeys.Ascending("series.Variable"));

                    dbContext.CConstat.Indexes.CreateOne(model);

                    List<Serie> ser = new List<Serie>();
                    ConstatViewModel constatModel = null;
                    if (!MemCache.TryGetValue(newCon.Id, out constatModel))
                    {
                        constatModel = newCon.CopyToViewModel();
                        MemCache.Set(constatModel.Id, constatModel);
                    }

                    string degre = "Constat";
                    modelTree = ModelTree(degre, newCon.isEasy, newCon.isNational, newCon.isAcademy);

                    //count 
                    var parenttree = modelTree.model.Where(a => a.ParentId == "Constat");

                    var mas = parenttree.GroupJoin(modelTree.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, first.Type, first.Display, Child = second.Count() }).ToList();

                    var kp = mas.Join(
                        constatModel.series,
                        arg => arg.Idm,
                        arg2 => arg2.Variable,
                        (second, first) => new Row
                        {
                            Parent = second.ParentId,
                            Name = first.Variable,
                            RealName = second.DisplayLabel,
                            serie = first.Values,
                            Id = second.Idm,
                            Level = 0,
                            child = second.Child,
                            type = second.Type,
                            display = second.Display
                        }).ToList();

                    List<int> years = new List<int>();
                    for (int i = constatModel.First_year; i <= constatModel.Last_year; i++)
                    {
                        years.Add(i);
                    }
                    var result = new { YearsCount = years, Datas = kp, Id = newCon.Id };
                    return Json(JsonConvert.SerializeObject(result, Settings));

                }
                else

                if (!String.IsNullOrEmpty(newYears) && newYears.Contains("_"))
                {
                    Constat newCon = new Constat();

                    newCon.Seq = ConstatUtils.GetLastSeq();
                    newCon.user = userId;
                    newCon.academy = academyId;
                    newCon.Is_calculed = false;
                    newCon.Name = name;

                    List<Serie> serLis = dAcademy.Series.Select(c => new Serie { Variable = c.Variable, Values = c.Values.ToList() }).ToList();

                    newCon.Id = ObjectId.GenerateNewId().ToString();
                    string[] years = newYears.Split("_");
                    int first_years = int.Parse(years[0]);
                    int last_years = int.Parse(years[1]);

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
                        /*else
                        {
                            nSer = serLis;
                        }*/
                    }

                    //Check the last row
                    newCon.series = null;
                    //var bytes = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(nSer));
                    //using (var msi = new MemoryStream(bytes))
                    //using (var mso = new MemoryStream())
                    //{
                    //    using (var gs = new GZipStream(mso, CompressionMode.Compress))
                    //    {
                    //        msi.CopyTo(gs);
                    //        // CopyTo(msi, gs);
                    //    }
                    //    newCon.series2 = mso.ToArray();
                    //}

                    try
                    {
                        Models.Constat.InsertOrUpdate(dbContext.CConstat, nSer, newCon);
                        UpdateCacheConstat(newCon.Id);
                    }
                    catch (Exception ex)
                    {
                        Logger.LogError(ex, ex.Message, null);
                        return Json("limit");
                    }
                    newCon.series2 = null;
                    newCon.series = nSer;
                    var model = new CreateIndexModel<Constat>(
                         Builders<Constat>.IndexKeys.Ascending("series.Variable"));

                    dbContext.CConstat.Indexes.CreateOne(model);

                    List<Serie> ser = new List<Serie>();
                    ConstatViewModel constatModel = null;
                    if (!MemCache.TryGetValue(newCon.Id, out constatModel))
                    {
                        constatModel = newCon.CopyToViewModel();
                        MemCache.Set(constatModel.Id, constatModel);
                    }

                    modelTree = ModelTree("Constat", newCon.isEasy, newCon.isNational, newCon.isAcademy);

                    //count 
                    var parenttree = modelTree.model.Where(a => a.ParentId == "Constat");

                    var mas = parenttree.GroupJoin(modelTree.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, first.Type, first.Display, Child = second.Count() }).ToList();
                    var kp = mas.Join(
                        constatModel.series,
                        arg => arg.Idm,
                        arg2 => arg2.Variable,
                        (second, first) => new Row
                        {
                            Parent = second.ParentId,
                            Name = first.Variable,
                            RealName = second.DisplayLabel,
                            serie = first.Values,
                            Id = second.Idm,
                            Level = 0,
                            child = second.Child,
                            type = second.Type,
                            display = second.Display
                        }).ToList();

                    List<int> yearsz = new List<int>();
                    for (int i = constatModel.First_year; i <= constatModel.Last_year; i++)
                    {
                        yearsz.Add(i);
                    }
                    var result = new { YearsCount = yearsz, Datas = kp, Id = newCon.Id };
                    return Json(JsonConvert.SerializeObject(result, Settings));

                }
                Logger.LogInformation("End GetConstat");
                return Json(JsonConvert.SerializeObject(constat, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult InitTreeConstat(string table, string id, string name)
        {
            try
            {
                Logger.LogInformation("Start InitTreeConstat");
                var constat = JsonConvert.DeserializeObject<Constat>(table);
                Logger.LogInformation("End InitTreeConstat");
                return CreateTree(constat.series, _dataService.datas.Model_Trees.model, new int[] { constat.First_year, constat.Last_year });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        public JsonResult CreateTree(List<Serie> series, List<model> models, int[] year)
        {

            Logger.LogInformation("Start CreateTree");
            List<NodeT> node = new List<NodeT>();
            string RootName = models.First().Idm;
            int iz = series.FirstOrDefault().Values.Count();


            int iter = 0;
            foreach (model bv in models)
            {
                iter++;
                bv.Id = iter;
            }
            var res = series.Join(models, arg => arg.Variable, arg2 => arg2.Idm, (first, second) => new { Parent = second.ParentId, Name = first.Variable, RealName = second.DisplayLabel, Data = first.Values, Id = second.Id }).ToList();

            foreach (var sr in res)
            {
                string parent = "" + sr.Parent;
                string var = sr.Name;
                string[] ser = new string[iz];
                for (int i = 0; i < iz; i++)
                {
                    if (var.StartsWith("P_") || var.StartsWith("T_"))
                    {
                        try
                        {
                            ser[i] = "" + decimal.Round(Convert.ToDecimal(sr.Data[i].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 2);
                        }
                        catch
                        {
                            float s = float.Parse(sr.Data[i].ToString().Replace(".", ","), new CultureInfo("fr-FR"));
                            decimal d = decimal.Round((decimal)s, 2);
                            ser[i] = d.ToString();
                        }
                    }
                    else
                    {
                        try
                        {
                            ser[i] = "" + decimal.Round(decimal.Parse(sr.Data[i].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 2);
                        }
                        catch
                        {
                            float s = float.Parse(sr.Data[i].ToString().Replace(".", ","), new CultureInfo("fr-FR"));
                            decimal d = decimal.Round((decimal)s, 2);
                            ser[i] = d.ToString();
                        }
                    }


                }

                node.Add(new NodeT() { Parent = parent, data = ser, Name = var, RealName = sr.RealName, level = 0, Id = sr.Id });
            }
            var b = FlatToHierarchy(node.OrderBy(c => c.Id).ToList(), RootName).ToList();

            List<NodeT> pl = new List<NodeT>();
            foreach (NodeT kss in b)
            {
                foreach (NodeT pls in kss.Traverse())
                {
                    pl.Insert(0, pls);
                    //pl.Add(pls);
                }

            }
            var data = new List<Models.Data>();

            foreach (NodeT nod in pl)
            {
                Models.Data dt = new Models.Data();
                dt.Id = nod.Id;
                dt.IdParent = nod.IdParent;
                dt.Label = nod.Name;
                dt.RealName = nod.RealName;
                dt.Childs = nod.Childs;
                dt.level = nod.level;
                dt.ChildCount = nod.ChildCount;
                dt.Baccs = new List<object>();
                foreach (var s in nod.data)
                {
                    dt.Baccs.Add(s);
                }
                data.Add(dt);
            }

            //data = data.OrderBy(x => x.Label).ToList();
            var data2 = data.Where(x => x.IdParent == 0).Reverse().ToList();

            Logger.LogInformation("Start CreateTree");
            return Json(JsonConvert.SerializeObject(new object[] { data, data2, year[0], year[1] }, Settings));
        }

        [HttpPost]
        public IActionResult SaveTreeConstat(string id, string serie, bool save)
        {
            try
            {
                Logger.LogInformation("Start SaveTreeConstat");
                var Lserie = JsonConvert.DeserializeObject<List<Serie>>(serie);
                // Kaky - 28/06/2022 - Obtenir le constat dans la base, pas d'utilisation de cache
                var constatVM = Constat.FindVMById(dbContext.CConstat, id);

                foreach (Serie s in Lserie)
                {
                    constatVM.series.Where(x => x.Variable.StartsWith(s.Variable)).FirstOrDefault().Values = s.Values;
                }
                if (save)
                {
                    // Kaky - 28/06/2022 - Utilisation de GridFS pour stocker :constat.series
                    Constat newCon = Constat.CastToConstat(constatVM);
                    Constat.InsertOrUpdate(dbContext.CConstat, constatVM.series, newCon);
                    UpdateCacheConstat(newCon.Id);

                    Logger.LogInformation("End SaveTreeConstat");
                    return Json(JsonConvert.SerializeObject(new { msg = "Constat [" + constatVM.Name + "] enregistré" }, Settings));
                }
                else
                {
                    Logger.LogInformation("End SaveTreeConstat");
                    return Json(JsonConvert.SerializeObject("", Settings));
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> SaveTreeConstat1(string id, string serie)
        {
            try
            {
                Logger.LogInformation("Start SaveTreeConstat1");
                var Lserie = JsonConvert.DeserializeObject<List<Serie>>(serie);
                var b = GetConstatById(id);
                if (b != null)
                {
                    foreach (Serie s in Lserie)
                    {
                        var ser = b.series.FirstOrDefault(c => c.Variable == s.Variable);
                        if (ser != null)
                            ser.Values = s.Values;
                    }
                }

                var filterBuilder = Builders<Constat>.Filter;
                var filter = filterBuilder.Eq(x => x.Id, id);

                var updateBuilder = Builders<Constat>.Update;
                var update = updateBuilder.Set(doc => doc.series, b.series);


                var result = await dbContext.CConstat.UpdateOneAsync(filter, update);


                var bb = result.IsAcknowledged
                    && result.ModifiedCount > 0;

                Logger.LogInformation("End SaveTreeConstat1");
                return Json(JsonConvert.SerializeObject("Constat [" + b.Name + "] enregistré", Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult CalculMeresConstat(string id, int year, string valStr, string variable, string parent)
        {
            try
            {
                Logger.LogInformation("Start CalculMeresConstat");
                // Kaky - 28/06/2022 - Obtenir les données de la base
                var tree = GetConstatById(id);

                var index = year - tree.First_year;

                string degre = "Constat";


                TreeModelView modelTree = ModelTree(degre, tree.isEasy, tree.isNational, tree.isAcademy);

                //double.TryParse(valStr, out double val);
                double val = double.Parse(valStr.Replace(".", ","), new CultureInfo("fr-FR"));
                var serie = tree.series.Where(x => x.Variable == variable).FirstOrDefault();
                var splt = variable.Split("_");
                if (splt[0] == "T" || splt[0] == "P" /*|| splt[0].StartsWith("ANC")*/) serie.Values[index] = double.Parse(val.ToString().Replace(".", ","), new CultureInfo("fr-FR")) / 100;
                else serie.Values[index] = val;

                var p = modelTree.model.Where(x => x.Idm == parent).FirstOrDefault();

                List<OneSerie> newSeries = new List<OneSerie>();

                var niv = Tools.GetNiveauDeg(variable);

                var myVar = Tools.GetVariableIJ(variable);

                List<Ponderation> FPonderation = new List<Ponderation>();

                if (tree.isAcademy) FPonderation = _dataService.PonderationsAca;
                else FPonderation = _dataService.Ponderations;

                if (niv.Length > 2) niv = niv[0].ToString() + niv[1].ToString();

                do
                {
                    var allVar = modelTree.model.Where(x => x.ParentId == p.Idm).ToList();

                    serie = tree.series.Where(x => x.Variable == p.Idm).FirstOrDefault();

                    var pmodel = modelTree.model.Where(x => x.ParentId == p.ParentId).FirstOrDefault();


                    double res = 0;

                    if (splt[0] == "T" || splt[0] == "P" || splt[0].StartsWith("ANC"))
                    {
                        var pondVar = FPonderation.Where(x => x.Variable.StartsWith(myVar)).FirstOrDefault();
                        if (pondVar == null) return Json("error|Variable pondération pas dans la Base de données (" + myVar + ")");
                        string[] pondIJ;
                        string ponderation, IJPond, IJ, endIndex;
                        int idx = 0;
                        foreach (var item in allVar) //allVar = tt les variables fille pour faire le calcul de la mere
                        {
                            var childSerie = tree.series.Where(x => x.Variable == item.Idm || x.Variable == item.DisplayLabel).FirstOrDefault();

                            if (childSerie != null)
                            {
                                pondIJ = childSerie.Variable.Split('_');

                                ponderation = pondVar.ponderation;
                                idx = index;
                                if (ponderation.Contains("+"))
                                {
                                    endIndex = pondIJ[pondIJ.Length - 1];
                                    endIndex = "_" + endIndex;
                                    var sp = ponderation.Split('+');

                                    var pondSerie = tree.series.Where(x => x.Variable.StartsWith(sp[0]) && x.Variable.EndsWith(endIndex)).FirstOrDefault();
                                    var pondSerie1 = tree.series.Where(x => x.Variable.StartsWith(sp[1]) && x.Variable.EndsWith(endIndex)).FirstOrDefault();

                                    if (pondSerie != null && pondSerie1 != null)
                                    {
                                        double res1 = double.Parse(pondSerie.Values[idx].ToString().Replace(".", ","), new CultureInfo("fr-FR")) +
                                            double.Parse(pondSerie1.Values[idx].ToString().Replace(".", ","), new CultureInfo("fr-FR"));

                                        res += double.Parse(childSerie.Values[index].ToString().Replace(".", ","), new CultureInfo("fr-FR")) * res1;
                                    }

                                }
                                else
                                {
                                    if (ponderation.Contains("[an-1]"))
                                    {
                                        idx = (index - 1) < 0 ? 0 : index - 1;
                                        ponderation = ponderation.Replace("[an-1]", "");
                                    }

                                    IJPond = Tools.GetIJ(ponderation, 0);
                                    IJ = Tools.GetIJ(variable, 1);

                                    endIndex = pondIJ[pondIJ.Length - 1];
                                    if (IJPond == "I" && IJ == "IJ")
                                    {
                                        if (endIndex.Contains(",")) endIndex = endIndex.Split(',')[0];
                                    }
                                    else if (IJPond == "I200" || IJPond == "I300" || IJPond == "I400")
                                    {
                                        var ind = IJPond.Substring(1);
                                        ponderation = ponderation.Replace(IJPond, "IJ");
                                        endIndex = "1:9," + ind;
                                    }
                                    endIndex = "_" + endIndex;

                                    var pondSerie = tree.series.Where(x => x.Variable.StartsWith(ponderation) && x.Variable.EndsWith(endIndex)).FirstOrDefault();
                                    if (pondSerie != null) res += double.Parse(childSerie.Values[index].ToString().Replace(".", ","), new CultureInfo("fr-FR")) *
                                                double.Parse(pondSerie.Values[idx].ToString().Replace(".", ","), new CultureInfo("fr-FR"));

                                }
                            }
                        }

                        pondIJ = serie.Variable.Split('_');
                        ponderation = pondVar.ponderation;
                        idx = index;

                        if (ponderation.Contains("+"))
                        {
                            endIndex = pondIJ[pondIJ.Length - 1];
                            endIndex = "_" + endIndex;
                            var sp = ponderation.Split('+');

                            var pondSerie = tree.series.Where(x => x.Variable.StartsWith(sp[0]) && x.Variable.EndsWith(endIndex)).FirstOrDefault();
                            var pondSerie1 = tree.series.Where(x => x.Variable.StartsWith(sp[1]) && x.Variable.EndsWith(endIndex)).FirstOrDefault();

                            if (pondSerie != null && pondSerie1 != null)
                            {
                                double res1 = double.Parse(pondSerie.Values[idx].ToString().Replace(".", ","), new CultureInfo("fr-FR")) +
                                    double.Parse(pondSerie1.Values[idx].ToString().Replace(".", ","), new CultureInfo("fr-FR"));

                                res /= res1;
                            }

                            var pondParent = tree.series.Where(x => x.Variable.StartsWith(ponderation) && x.Variable.EndsWith(endIndex)).FirstOrDefault();
                            if (pondParent != null) res /= double.Parse(pondParent.Values[idx].ToString().Replace(".", ","), new CultureInfo("fr-FR"));

                        }
                        else
                        {
                            if (ponderation.Contains("[an-1]"))
                            {
                                idx = (index - 1) < 0 ? 0 : index - 1;
                                ponderation = ponderation.Replace("[an-1]", "");
                            }

                            IJPond = Tools.GetIJ(ponderation, 0);
                            IJ = Tools.GetIJ(variable, 1);

                            endIndex = pondIJ[pondIJ.Length - 1];
                            if (IJPond == "I" && IJ == "IJ")
                            {
                                if (endIndex.Contains(",")) endIndex = endIndex.Split(',')[0];
                            }
                            else if (IJPond == "I200" || IJPond == "I300" || IJPond == "I400")
                            {
                                var ind = IJPond.Substring(1);
                                ponderation = ponderation.Replace(IJPond, "IJ");
                                endIndex = "1:9," + ind;
                            }

                            var pondParent = tree.series.Where(x => x.Variable.StartsWith(ponderation) && x.Variable.EndsWith(endIndex)).FirstOrDefault();
                            if (pondParent != null) res /= double.Parse(pondParent.Values[idx].ToString().Replace(".", ","), new CultureInfo("fr-FR"));
                        }

                    }
                    else
                    {
                        foreach (var item in allVar)
                        {
                            var childSerie = tree.series.Where(x => x.Variable == item.Idm || x.Variable == item.DisplayLabel).FirstOrDefault();
                            if (childSerie != null) res += double.Parse(childSerie.Values[index].ToString().Replace(".", ","), new CultureInfo("fr-FR"));
                        }
                    }

                    if (double.IsNaN(res) || double.IsInfinity(res)) res = 0;
                    serie.Values[index] = res;

                    if (splt[0] == "T" || splt[0] == "P" /*|| splt[0].StartsWith("ANC")*/) res *= 100;
                    newSeries.Add(new OneSerie() { Variable = p.Idm, Value = res });

                    p = modelTree.model.Where(x => x.Idm == pmodel.ParentId).FirstOrDefault();
                } while (p.Idm != "Constat");

                // Kaky - 28/06/2022 - Mettre à jour les données dans la base
                Constat newCon = Constat.CastToConstat(tree);
                Constat.InsertOrUpdate(dbContext.CConstat, tree.series, newCon);
                UpdateCacheConstat(newCon.Id);

                Logger.LogInformation("End CalculMeresConstat");
                return Json(JsonConvert.SerializeObject(newSeries, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult ExportConstatCSV(string id, string degre, string vars)
        {
            try
            {
                Logger.LogInformation("Start ExportConstatCSV");

                var constat = GetConstatById(id);
                degre = "Constat";
                TreeModelView modelTree = ModelTree(degre, constat.isEasy, constat.isNational, constat.isAcademy);
                var trees = modelTree.model.GroupJoin(modelTree.model, arg => arg.Idm, arg2 => arg2.ParentId,
                    (first, second) => new RowTree
                    {
                        Idm = first.Idm,
                        ParentId = first.ParentId,
                        DisplayLabel = first.DisplayLabel,
                        Child = second.Count()
                    }).ToList();

                ExportVars export = new ExportVars(Environment.WebRootPath, constat.Name, degre, constat.First_year, constat.Last_year, true);
                string fileNameClient = export.WriteToCSV(constat.series, trees, vars);
                string fileName = export.FileName;

                Logger.LogInformation("End ExportConstatCSV");
                var result = new { Path = fileName, Filename = fileNameClient };
                return Json(JsonConvert.SerializeObject(result, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult Supprimer(string id, string name, string type)
        {
            try
            {
                Logger.LogInformation("Start Supprimer constat");
                // if (type == "Constat")
                // {
                var constat = GetConstatById(id);

                if (Constat.Delete(dbContext.CConstat, dbContext.CScenario, id, constat.Seq) == false)
                {

                    return Json("false");
                }
                DeleteCacheConstat(id);
                // }
                //_cache.Remove(id);

                Logger.LogInformation("End Supprimer constat");
                return Json("true");
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

        }

        [HttpPost]
        public async Task<IActionResult> DepliageConstat(string id, string name)
        {
            try
            {
                Logger.LogInformation("Start DepliageConstat");
                ConstatViewModel constatModel = GetConstatById(name);

                TreeModelView modelTree = ModelTree("Constat", constatModel.isEasy, constatModel.isNational, constatModel.isAcademy);

                var model = new CreateIndexModel<Constat>(
                    Builders<Constat>.IndexKeys.Ascending("series.Variable"));

                await dbContext.CConstat.Indexes.CreateOneAsync(model).ConfigureAwait(false);

                List<model> m = new List<model>();
                int[] level = new int[1];
                level[0] = 1;
                GetAllChild(modelTree, id, m, level);

                var parenttree = modelTree.model.Where(a => a.ParentId == id);
                var mas = m.GroupJoin(modelTree.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, first.Level, first.Type, first.Display, Child = second.Count() }).ToList();

                var kp = mas.Join(
                    constatModel.series,
                    arg => arg.Idm,
                    arg2 => arg2.Variable,
                    (second, first) => new Row
                    {
                        Parent = second.ParentId,
                        Name = first.Variable,
                        RealName = second.DisplayLabel,
                        serie = first.Values,
                        Id = second.Idm,
                        Level = second.Level,
                        child = second.Child,
                        type = second.Type,
                        display = second.Display
                    }).ToList();

                List<int> years = new List<int>();
                for (int i = constatModel.First_year; i <= constatModel.Last_year; i++)
                {
                    years.Add(i);
                }

                Logger.LogInformation("End DepliageConstat");
                var result = new { YearsCount = years, Datas = kp };
                return Json(JsonConvert.SerializeObject(result, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

        }

        [HttpPost]
        public IActionResult ListConstat(string userId, string academyId)
        {
            try
            {
                var datas1 = new Datas();
                //Données Académiques
                Logger.LogInformation("Start ListConstat");
                //Constats
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
                        isAcademy = x.isAcademy,
                    }).ToList();
                //datas1.Constats = dbContext.CConstat.Find(x => x.user == userId && x.academy == academyId).ToList();

                //Scenario
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
                        Is_pepcs = x.Is_pepcs,

                        isEasy = x.isEasy,
                        isNational = x.isNational,
                        isAcademy = x.isAcademy,
                    }).ToList();
                Logger.LogInformation("End ListConstat");

                //tab recap
                return Json(JsonConvert.SerializeObject(datas1, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetFirstTreeConstat(string id, string name, string newYears, bool isNew)
        {
            try
            {
                Logger.LogInformation("Start GetFirstTreeConstat");
                var model = new CreateIndexModel<Constat>(
                         Builders<Constat>.IndexKeys.Ascending("series.Variable"));

                await dbContext.CConstat.Indexes.CreateOneAsync(model).ConfigureAwait(false);
                List<Serie> ser = new List<Serie>();

                ConstatViewModel constatModel = GetConstatById(id);

                var modelTree = ModelTree("Constat", constatModel.isEasy, constatModel.isNational, constatModel.isAcademy);

                //count 
                var parenttree = modelTree.model.Where(a => a.ParentId == "Constat");

                var mas = parenttree.GroupJoin(modelTree.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, first.Type, first.Display, Child = second.Count() }).ToList();
                var kp = mas.Join(
                    constatModel.series,
                    arg => arg.Idm,
                    arg2 => arg2.Variable,
                    (second, first) => new Row
                    {
                        Parent = second.ParentId,
                        Name = first.Variable,
                        RealName = second.DisplayLabel,
                        serie = first.Values,
                        Id = second.Idm,
                        Level = 0,
                        child = second.Child,
                        type = second.Type,
                        display = second.Display
                    }).ToList();
                List<int> years = new List<int>();
                for (int i = constatModel.First_year; i <= constatModel.Last_year; i++)
                {
                    years.Add(i);
                }
                var result = new { constatName = constatModel.Name, YearsCount = years, Datas = kp };
                Logger.LogInformation("End GetFirstTreeConstat");
                return Json(JsonConvert.SerializeObject(result, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> OpenRowChildConstat(string id, string name)
        {
            try
            {
                Logger.LogInformation("Start OpenRowChildConstat");
                ConstatViewModel constatModel = GetConstatById(name);

                TreeModelView modelTree = ModelTree("Constat", constatModel.isEasy, constatModel.isNational, constatModel.isAcademy);

                var model = new CreateIndexModel<Constat>(
                    Builders<Constat>.IndexKeys.Ascending("series.Variable"));

                await dbContext.CConstat.Indexes.CreateOneAsync(model).ConfigureAwait(false);

                var parenttree = modelTree.model.Where(a => a.ParentId == id);
                var mas = parenttree.GroupJoin(modelTree.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, first.Type, first.Display, Child = second.Count() }).ToList();

                var kp = mas.Join(
                    constatModel.series,
                    arg => arg.Idm,
                    arg2 => arg2.Variable,
                    (second, first) => new Row
                    {
                        Parent = second.ParentId,
                        Name = first.Variable,
                        RealName = second.DisplayLabel,
                        serie = first.Values,
                        Id = second.Idm,
                        Level = 0,
                        child = second.Child,
                        type = second.Type,
                        display = second.Display
                    }).ToList();

                List<int> years = new List<int>();
                for (int i = constatModel.First_year; i <= constatModel.Last_year; i++)
                {
                    years.Add(i);
                }
                Logger.LogInformation("End OpenRowChildConstat");
                var result = new { YearsCount = years, Datas = kp };
                return Json(JsonConvert.SerializeObject(result, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult GetConstatArchive(string id, string name, string type, string user, string academy)
        {
            var model = new Archive();
            model.Id = id;
            model.Name = name;
            if (academy == null || (academy != null && academy == "null")) academy = ObjectId.Empty.ToString();
            model.Type = "Constat";
            dbContext.InitConstat();

            string[] academies = academy.Split(",");
            List<ArchiveItem> archives = new List<ArchiveItem>();
            foreach(var acad in academies)
            {
                var archive = dbContext.CConstat.AsQueryable().Where(x => x.user == user && x.academy == acad).Select(
                    c => new ArchiveItem() { Id = c.Id, Name = c.Name, Is_archive = c.Is_archive }
                ).OrderBy(c => c.Name).ToList();
                archives.AddRange(archive);
            }

            
            model.archives = archives;
            return Json(JsonConvert.SerializeObject(model, Settings));
        }

    }
}
