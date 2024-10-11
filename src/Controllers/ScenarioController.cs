using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
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
    public class ScenarioController : BaseController
    {
        public ScenarioController(IConfiguration config, ILogger<ScenarioController> _logger, IWebHostEnvironment _environment, IMemoryCache memoryCache, DataService _dataService) : base(config, _logger, _environment, memoryCache, _dataService)
        {
        }

        #region actions

        [HttpPost]
        public IActionResult ListScen(string userId, string academyId)
        {

            var datas1 = new Datas();
            try
            {
                //Données Académiques
                Logger.LogInformation("Start ListScen");
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
                        Is_calculed = x.Is_calculed
                    }).ToList();

                //Scenario
                dbContext.InitScenario();
                datas1.Scenarios = dbContext.CScenario.AsQueryable().Where(x => x.user == userId /* && x.academy == academyId */ && !x.Is_archive)
                    .Select(x => new Scenario()
                    {
                        Id = x.Id,
                        Name = x.Name,
                        Observation = x.Observation,
                        Last_year = x.Last_year,
                        First_year=x.First_year,
                        user = x.user,
                        academy = x.academy,
                        Seq = x.Seq,
                        Documentation = x.Documentation,
                        isEasy = x.isEasy,
                        Is_pepcs = x.Is_pepcs
                    }).ToList();
                Logger.LogInformation("End ListScen");
                return Json(JsonConvert.SerializeObject(datas1, Settings));

            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }


        [HttpPost]
        public IActionResult GetFirstTreeScenario(string id, string name, string newYears, bool isNew, string idConstat, string parent, string degre, bool isEasy, bool filtre, string hypoVars = "", string resVars = "")
        {
            try
            {
                Logger.LogInformation("Start GetFirstTreeScenario");
                //dbContext.InitScenario();
                ScenarioViewModel scenario = null;

                if (degre != null && degre.Equals("Academy")) degre = "Academie";
                if (!id.Contains("newId"))
                {
                    scenario = GetScenarioById(id);
                }
                else
                {
                    // INFO: Si Création de nouveau scénario
                    var constat = GetConstatById(idConstat).Clone() as ConstatViewModel;
                                        
                    Scenario ct = Scenario.FindByName(dbContext.CScenario, name, constat.User);
                    if (ct != null) throw new Exception("Ce nom de scénario existe déjà. Veuillez en choisir un autre.");


                    scenario = new ScenarioViewModel();
                    scenario.observation = constat.Seq;
                    scenario.firstYears = constat.First_year;
                    scenario.Academy = constat.Academy;
                    scenario.lastYearsConstat = constat.Last_year;
                    scenario.User = constat.User;
                    scenario.lastYears = int.Parse(newYears.Split("_")[1]);
                    scenario.Last_Degree = 0;
                    var res = new List<Serie>(constat.series);
                    scenario.ht_data = new List<Serie>();
                    scenario.ht_data = res.Select(c => new Serie { Variable = c.Variable, Values = c.Values.ToList() }).ToList(); // TODO: This may be performance issue
                    foreach (var serie in scenario.ht_data)
                    {
                        var x = new List<double>();
                        for (int i = constat.Last_year; i < scenario.lastYears; i++)
                        {
                            x.Add(0);
                        }
                        serie.Values.AddRange(x);
                    }

                    scenario.isEasy = isEasy;
                    var acaIsWhole = _dataService.Academies.Where(x => x.Id.Equals(scenario.Academy)).FirstOrDefault();
                    if (acaIsWhole == null) throw new Exception("Cette académie n'existe plus. Veuillez contacter l'administrateur pour vous assignez un nouvel académie.");
                    scenario.isNational = acaIsWhole.Is_Whole;
                }
                if (isNew)
                {
                    scenario.Name = name;
                    scenario.seq = 0;
                    Scenario scNew = Scenario.CastToScenario(scenario);
                    scenario.Id = scNew.Id;

                    // Kaky - 28/06/2022 - Utilisation de GridFS pour insérer le scénario
                    Scenario.InsertOrUpdate(dbContext.CScenario, scNew, scenario.ht_data);
                    UpdateCacheScenario(scNew.Id, scenario, scenario.ht_data);
                }
                if (scenario.degres_modifies == null) scenario.degres_modifies = new bool[] { false, false, false, false, false, false, false, false, false };

                string[] last_degree = new string[] { "Entrant", "1", "2", "3", "4", "5", "6", "Diplome", "Academie" };
                if (scenario.Last_Degree >= last_degree.Length) scenario.Last_Degree = last_degree.Length - 1;
                if (!filtre) degre = last_degree[scenario.Last_Degree];
                if (degre == null) degre = "Entrant";

                //Recupération Tree

                bool easy = false;
                string[] listnoEasy = new string[] { "Entrant", "1", "Diplome", "Academie" };

                if (listnoEasy.Contains(degre)) easy = false;
                else easy = scenario.isEasy;

                TreeModelView mt1 = ModelTree(degre, scenario.isEasy, scenario.isNational, scenario.isAcademy);

                var newMtree = _dataService.Mtrees.Where(x => x.Degres == degre && x.Is_Easy == easy && x.Is_National == scenario.isNational && x.Is_Academy == scenario.isAcademy).Select(x => x.Order_Hyp).FirstOrDefault();

                //count 
                return SendTree(parent, mt1, scenario, degre, hypoVars, resVars, newMtree
                    , true);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // INFO: I copy-paste this from ConstatController.GetConstat and made some changes


        [HttpPost]
        public IActionResult ReconduireVariable(string id, string name, int vcopie, string degre,string parent="J900")
        {
            try
            {
                Logger.LogInformation("Start ReconduireVariable");
                var scen = GetScenarioById(id);
                var idc = Constat.GetIdByObs(dbContext.CConstat, scen.observation, scen.Name);
                var constat = GetConstatById(idc);





                int index = (vcopie - constat.First_year);
                int CountSCenar = scen.lastYears - scen.lastYearsConstat;
                //int lastindex = name.LastIndexOf('N') + 1;

                var splitName = name.Split('_');

                string newname = "";
                for (int i = 0; i < splitName.Length - 2; i++)
                {
                    if (i == splitName.Length - 3) newname += splitName[i];
                    else newname += splitName[i] + "_";
                }

                if (degre == null) degre = "Entrant";

                bool easy = false;
                string[] listnoEasy = new string[] { "Entrant", "1", "Diplome", "Academie" };

                if (listnoEasy.Contains(degre)) easy = false;
                else easy = scen.isEasy;

                TreeModelView mt1 = ModelTree(degre, easy, scen.isNational, scen.isAcademy);
                List<FiliereTreeModel> filieres = GetFilieresTree();
                int level = -1;
                foreach (var filiere in filieres)
                {
                    if (filiere.nom.Equals(parent))
                    {
                        level = filiere.Level + 1;
                        break;
                    }
                }
                parent = parent.Replace("J", "");
                IEnumerable<model> parent1 = new List<model>();
                IEnumerable<model> parent2 = new List<model>();
                if (parent.Equals("900"))
                {
                    parent1 = mt1.model.Where(a => a.ParentId == "Hypotheses");
                    parent2 = mt1.model.Where(a => a.ParentId == "Resultats");
                }
                else
                {
                    parent1 = mt1.HypoChildren.Where(a => a.Idm.Contains(parent) && a.LevelXML == level);
                    parent2 = mt1.ResChildren.Where(a => a.Idm.Contains(parent) && a.LevelXML == level);
                }

                //var Hypo = _dataService.Mtrees.Where(x => x.Degres == degre && x.Is_Easy == easy && x.Is_National == scen.isNational && x.Is_Academy == scen.isAcademy).FirstOrDefault().Order_Hyp;

                bool test = false;
                //if (Hypo == null) goto nothingToDo;
                foreach (var item in parent1)
                {
                    if (item.Idm.StartsWith(newname))
                    {
                        test = true;
                        break;
                    }
                }
                if (degre != "Entrant" && (name.StartsWith("EFF_") || name.StartsWith("ENT_") || name.StartsWith("DIP_"))) test = false;



                if (!String.IsNullOrEmpty(newname) && test)
                {
                    //string Name = (name.Substring(0, name.LastIndexOf('N') + 1));
                    foreach (Serie s in scen.ht_data.Where(c => c.Variable.StartsWith(newname)))
                    {
                        //Serie sce = scen.ht_data.FirstOrDefault(c => c.Variable == s.Variable);
                        //if (sce != null)
                        //{
                            int sccou = s.Values.Count - 1;
                            if (s != null)
                            {
                                for (int i = 0; i < CountSCenar; i++)
                                {
                                    s.Values[sccou - i] = s.Values[index];
                                }
                            }
                        //}
                    }
                }

                // Sauvegarde dans la base
                Scenario.Update(dbContext.CScenario, scen.Id, scen.ht_data);
                UpdateCacheScenario(scen.Id, scen.ht_data);

            nothingToDo: // TODO: What that means



                //count 

                //var parent1 = mt1.model.Where(a => a.Idm.EndsWith(parent.Replace("J", "")));
                //var parent2 = mt2.model.Where(a => a.Idm.EndsWith(parent.Replace("J", "")));

                
                var tree1 = parent1.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, Child = second.Count() }).ToList();
                var tree2 = parent2.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, Child = second.Count() }).ToList();


                var scen1 = tree1.Join(
                scen.ht_data,
                arg => arg.Idm,
                arg2 => arg2.Variable,
                (second, first) => new
                {
                    Parent = second.ParentId,
                    Name = first.Variable,
                    RealName = second.DisplayLabel,
                    serie = first.Values,
                    Id = second.Idm,
                    Level = 0,
                    child = second.Child
                }).ToList();
                var scen2 = tree2.Join(
                scen.ht_data,
                arg => arg.Idm,
                arg2 => arg2.Variable,
                (second, first) => new
                {
                    Parent = second.ParentId,
                    Name = first.Variable,
                    RealName = second.DisplayLabel,
                    serie = first.Values,
                    Id = second.Idm,
                    Level = 0,
                    child = second.Child
                }).ToList();
                //var scen1 = scen.ht_data.Join(tree1, arg => arg.Variable, arg2 => arg2.Idm, (first, second) => new { Parent = second.ParentId, Name = first.Variable, RealName = second.DisplayLabel, serie = first.Values, Id = second.Idm, Level = 0, child = second.Child }).ToList(); ;
                //var scen2 = scen.ht_data.Join(tree2, arg => arg.Variable, arg2 => arg2.Idm, (first, second) => new { Parent = second.ParentId, Name = first.Variable, RealName = second.DisplayLabel, serie = first.Values, Id = second.Idm, Level = 0, child = second.Child }).ToList(); ;
                List<int> years = new List<int>();
                for (int i = scen.firstYears; i <= scen.lastYears; i++)
                {
                    years.Add(i);
                }
                var result = new
                {
                    Id = scen.Id,
                    YearsCount = years,
                    scen1 = scen1,
                    scen2 = scen2,
                    Type1 = degre + "µ" + scen.isEasy + "µ" + scen.isNational + "µ" + scen.isAcademy,
                    Type2 = degre + "µ" + scen.isEasy + "µ" + scen.isNational + "µ" + scen.isAcademy,
                    LastYear = years.IndexOf(scen.lastYearsConstat)
                };


                Logger.LogInformation("End ReconduireVariable");
                return Json(JsonConvert.SerializeObject(result, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult ReconduireVariables(string id, int vcopie, string degre, string parent="J900")
        {
            try
            {
                Logger.LogInformation("Start ReconduireVariables");
                var scen = GetScenarioById(id);
                var idc = Constat.GetIdByObs(dbContext.CConstat, scen.observation, scen.Name);
                var constat = GetConstatById(idc);
                int index = (vcopie - constat.First_year);
                int CountSCenar = scen.lastYears - scen.lastYearsConstat;


                if (degre == null) degre = "Entrant";
                bool easy = false;
                string[] listnoEasy = new string[] { "Entrant", "1", "Diplome", "Academie" };

                if (listnoEasy.Contains(degre)) easy = false;
                else easy = scen.isEasy;

                Boolean isNat = false;

                if (degre.Equals("Diplome") || degre.Equals("Academie")) isNat = false;
                else isNat = scen.isNational;

                TreeModelView mt1 = ModelTree(degre, easy, isNat, scen.isAcademy);
                //var newMtree = Mtrees.Where(x => x.Degres == degre && x.Is_Easy == easy && x.Is_National == scen.isNational && x.Is_Academy == scen.isAcademy).FirstOrDefault();
                List<FiliereTreeModel> filieres = GetFilieresTree();
                int level = -1;
                foreach (var filiere in filieres)
                {
                    if (filiere.nom.Equals(parent))
                    {
                        level = filiere.Level + 1;
                        break;
                    }
                }
                parent = parent.Replace("J", "");
                IEnumerable<model> parent1 = new List<model>();
                IEnumerable<model> parent2 = new List<model>();
                if (parent.Equals("900"))
                {
                    parent1 = mt1.model.Where(a => a.ParentId == "Hypotheses");
                    parent2 = mt1.model.Where(a => a.ParentId == "Resultats");
                }
                else
                {
                    parent1 = mt1.HypoChildren.Where(a => a.Idm.Contains(parent) && a.LevelXML == level);
                    parent2 = mt1.ResChildren.Where(a => a.Idm.Contains(parent) && a.LevelXML == level);
                }
                //count 
                
                var tree1 = parent1.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, Child = second.Count() }).ToList();
                var tree2 = parent2.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, Child = second.Count() }).ToList();


                List<Ponderation> FPonderation = new List<Ponderation>();

                if (scen.isAcademy) FPonderation = _dataService.PonderationsAca; // TODO: Verify that isAcademy is correctly set
                else FPonderation = _dataService.Ponderations;

                var seriesToReconduct = scen.ht_data.ToDictionary(keySelector: x => x.Variable, elementSelector: x => x.Values);

                int deb = scen.lastYearsConstat - scen.firstYears + 1;

                foreach (var tr in tree1)
                {
                    var name = tr.DisplayLabel;
                    if (degre != "Entrant" && (name.StartsWith("EFF_") || name.StartsWith("ENT_") || name.StartsWith("DIP_"))) continue;

                    var splitName = name.Split('_');

                    string newname = "";
                    for (int i = 0; i < splitName.Length - 1; i++)
                    {
                        newname += splitName[i] + "_";
                    }

                    if (!String.IsNullOrEmpty(newname))
                    {
                        var pond = FPonderation.Where(x => x.Variable.StartsWith(newname)).FirstOrDefault();
                        bool isPond = false;
                        if (pond != null) isPond = true;



                        if (isPond)
                        {
                            var p1 = mt1.model.Where(a => a.Idm.StartsWith(newname));
                            var t1 = p1.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, Child = second.Count() }).ToList();
                            var s1 = t1.Join(
                                scen.ht_data,
                                arg => arg.Idm,
                                arg2 => arg2.Variable,
                                (second, first) => new TreeClass()
                                {
                                    Parent = second.ParentId,
                                    Name = first.Variable,
                                    RealName = second.DisplayLabel,
                                    Serie = first.Values,
                                    Id = second.Idm,
                                    Level = 0,
                                    Child = second.Child
                                }
                            ).ToList();

                            var childs = s1.Where(x => x.Child == 0).ToList();

                            foreach (var item in childs)
                            {
                                if (seriesToReconduct.ContainsKey(item.Id))
                                {
                                    for (int i = deb; i < seriesToReconduct[item.Id].Count; i++)
                                    {
                                        seriesToReconduct[item.Id][i] = seriesToReconduct[item.Id][index];
                                    }
                                }
                            }
                        }
                        else
                        {
                            var serie = seriesToReconduct.Where(x => x.Key.StartsWith(newname)).ToList();

                            foreach (var item in serie)
                            {
                                for (int i = deb; i < item.Value.Count; i++)
                                {
                                    item.Value[i] = item.Value[index];
                                }
                            }
                            /*List<Serie> serie = scen.ht_data.Where(x => x.Variable.StartsWith(newname)).ToList();
                            foreach (var item in serie)
                            {
                                for (int i = deb; i < item.Values.Count; i++)
                                {
                                    item.Values[i] = item.Values[i - 1];
                                }
                            }*/
                        }
                    }
                }

                Dictionary<string, List<double>> htData = GenUtils.SerieToDico(scen.ht_data);

                foreach (var value in htData)
                {
                    if (seriesToReconduct.ContainsKey(value.Key) == false)
                    {
                        seriesToReconduct[value.Key] = value.Value;
                    }
                }
                scen.ht_data = GenUtils.DicoToSerie(seriesToReconduct);
                // Sauvegarde dans la base
                Scenario.Update(dbContext.CScenario, scen.Id, scen.ht_data, scen.Last_Degree);
                UpdateCacheScenario(scen.Id, scen.ht_data, scen.Last_Degree);


                //Recupération Tree





                var scen1 = tree1.Join(
                scen.ht_data,
                arg => arg.Idm,
                arg2 => arg2.Variable,
                (second, first) => new
                {
                    Parent = second.ParentId,
                    Name = first.Variable,
                    RealName = second.DisplayLabel,
                    serie = first.Values,
                    Id = second.Idm,
                    Level = 0,
                    child = second.Child
                }).ToList();
                var scen2 = tree2.Join(
                scen.ht_data,
                arg => arg.Idm,
                arg2 => arg2.Variable,
                (second, first) => new
                {
                    Parent = second.ParentId,
                    Name = first.Variable,
                    RealName = second.DisplayLabel,
                    serie = first.Values,
                    Id = second.Idm,
                    Level = 0,
                    child = second.Child
                }).ToList();

                List<int> years = new List<int>();
                for (int i = scen.firstYears; i <= scen.lastYears; i++)
                {
                    years.Add(i);
                }
                var result = new
                {
                    Id = scen.Id,
                    YearsCount = years,
                    scen1 = scen1,
                    scen2 = scen2,
                    Type1 = degre + "µ" + scen.isEasy + "µ" + scen.isNational + "µ" + scen.isAcademy,
                    Type2 = degre + "µ" + scen.isEasy + "µ" + scen.isNational + "µ" + scen.isAcademy,
                    LastYear = years.IndexOf(scen.lastYearsConstat)
                };


                Logger.LogInformation("End ReconduireVariables");
                return Json(JsonConvert.SerializeObject(result, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }


        [HttpPost]
        public IActionResult GetTreeFiliere()
        {
            
            return Json(JsonConvert.SerializeObject(GetFilieresTree(), Settings));
        }
        
        public List<FiliereTreeModel> GetFilieresTree()
        {
            FiliereUtils fil = new FiliereUtils();
            fil.GetTreeFiliere("J900", 0, 6, 0);
            FiliereTreeModel j600 = fil.treeFiliere[1];
            FiliereTreeModel j700 = fil.treeFiliere[2];
            FiliereTreeModel j810 = fil.treeFiliere[fil.treeFiliere.Count - 1];
            FiliereTreeModel j800 = fil.treeFiliere[fil.treeFiliere.Count - 2];
            FiliereTreeModel j450 = fil.treeFiliere[fil.treeFiliere.Count - 3];
            FiliereTreeModel j500 = fil.treeFiliere[fil.treeFiliere.Count - 8];
            FiliereTreeModel j501 = fil.treeFiliere[fil.treeFiliere.Count - 7];
            FiliereTreeModel j504 = fil.treeFiliere[fil.treeFiliere.Count - 6];
            fil.treeFiliere.Remove(j600);
            fil.treeFiliere.Remove(j700);
            fil.treeFiliere.Remove(j800);
            fil.treeFiliere.Remove(j810);
            fil.treeFiliere.Remove(j450);
            //fil.treeFiliere.Remove(j500);
            //fil.treeFiliere.Remove(j501);
            //fil.treeFiliere.Remove(j504);

            //fil.treeFiliere.Add(j450);
            //fil.treeFiliere.Add(j500);
            //fil.treeFiliere.Add(j501);
            //fil.treeFiliere.Add(j504);

            fil.treeFiliere.Add(j600);
            fil.treeFiliere.Add(j700);
            fil.treeFiliere.Add(j800);
            fil.treeFiliere.Add(j810);
            fil.treeFiliere.Insert(fil.treeFiliere.Count - 7, j450);
            return fil.treeFiliere;
        }



        [HttpPost]
        public ActionResult CalculContexte(string id, string degre, int newdeg, string parent="J900")
        {
            lock (LockCalcul)
            {
                try
                {
                    Logger.LogInformation("Start CalculContexte");
                    if (degre == null) degre = "Entrant";

                    var scenario = GetScenarioById(id);

                    AcademyData acaYear = new AcademyData();
                    List<int> years = new List<int>();
                    foreach (string year in acaYear.Year) years.Add(Int32.Parse(year));

                    string[] listNoEasy = new string[] { "Entrant", "1", "Diplome", "Academie" };
                    string[] listNoNat = new string[] { "Diplome", "Academie" };
                    string[] listNotDegree = new string[] { "Entrant", "Diplome", "Academie" };
                    bool isEasy = false;
                    bool isNational = false;
                    bool isDegree = false;

                    if (listNoEasy.Contains(degre)) isEasy = false;
                    else isEasy = scenario.isEasy;  // TODO: scenario.isEasy seems to be always false, this means scenario.isEasy is not inserted into database

                    if (listNoNat.Contains(degre)) isNational = false;
                    else isNational = scenario.isNational; // TODO: scenario.isNational seems to be always false, this means scenario.isEasy is not inserted into database
                    //isNational = true; // TODO: Test à commenter
                    if (degre.Equals("Diplome") || degre.Equals("Academie")) // TODO: Test à commenter
                    {
                        isNational = false;
                    }

                    if (listNotDegree.Contains(degre)) isDegree = false;
                    else isDegree = true;

                    // Tree for display purpose
                    //if (scenario.isAcademy) scenario.isAcademy = false; // TODO: Why isAcademy should always be false?
                    //if (scenario.isNational == false) scenario.isNational = true; // TODO: Why isNational should always be true?
                    TreeModelView mt1 = ModelTree(degre, isEasy, isNational, scenario.isAcademy); // TODO: This loads the False ModelTree
                    List<FiliereTreeModel> filieres = GetFilieresTree();
                    int level = -1;
                    foreach (var filiere in filieres)
                    {
                        if (filiere.nom.Equals(parent))
                        {
                            level = filiere.Level + 1;
                            break;
                        }
                    }
                    parent = parent.Replace("J", "");
                    IEnumerable<model> parentHypo = new List<model>();
                    IEnumerable<model> parentRes = new List<model>();
                    if (parent.Equals("900"))
                    {
                        parentHypo = mt1.model.Where(a => a.ParentId == "Hypotheses");
                        parentRes = mt1.model.Where(a => a.ParentId == "Resultats");
                    }
                    else
                    {
                        parentHypo = mt1.HypoChildren.Where(a => a.Idm.Contains(parent) && a.LevelXML == level);
                        parentRes = mt1.ResChildren.Where(a => a.Idm.Contains(parent) && a.LevelXML == level);
                    }
                    //var parentHypo = mt1.model.Where(a => a.ParentId == "Hypotheses");
                    //var parentRes = mt1.model.Where(a => a.ParentId == "Resultats");
                    var treeHypo = parentHypo.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, Child = second.Count() }).ToList();
                    var treeRes = parentRes.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, Child = second.Count() }).ToList();

                    // Setup For Calcul contexte
                    int lastYearIndex = years[years.Count - 1];
                    lastYearIndex = scenario.lastYearsConstat; // TODO: Enlenver ce code statique
                    Utils.Engine.VarData varData = new Utils.Engine.VarData(years, lastYearIndex);
                    varData.IsConstat = false;
                    varData.IsTabRecap = false;

                    Utils.Engine.Engine engine = new Utils.Engine.Engine(varData);
                    string rootPath = Environment.WebRootPath + "/Calcule/";

                    // Find The folderName to get the hypo, model and res xml
                    string folderName = "Ctx";
                    if (isDegree) folderName += "Degre" + degre;
                    else folderName += degre;

                    if (isNational && isEasy) folderName += "SimplNat";
                    else if (isNational) folderName += "Nat";
                    else if (isEasy) folderName += "Simpl";


                    XmlDocument model = DomUtils.getDocumentFromResourcePath(rootPath + String.Format("/{0}/model.xml", folderName));
                    XmlDocument hypo = DomUtils.getDocumentFromResourcePath(rootPath + String.Format("/{0}/hypo.xml", folderName));
                    XmlDocument res = DomUtils.getDocumentFromResourcePath(rootPath + String.Format("/{0}/res.xml", folderName));

                    // Set size of NbYears
                    Utils.Engine.VarData.NbYears = scenario.ht_data[0].Values.Count; // Concurrent access solved by using lock object

                    varData.HtData = GenUtils.SerieToDico(scenario.ht_data);

                    //if(folderName.Contains("6"))
                    //    varData.HtData["EFF"] = varData.HtData["EFF_J_900"]; // TODO: This should be in the XML

                    // Compute values
                    // TODO: Execute this in a loop
                    for (int iE = -2; iE < acaYear.Year.Count; iE++)
                    {
                        engine.StaticCompute(model.DocumentElement);
                        engine.RtCompute(hypo.DocumentElement);
                        engine.RtCompute(res.DocumentElement);
                    }


                    Utils.Engine.VarData.NbYears = 30;

                    // Update scenario.ht_data with the new values
                    scenario.ht_data = GenUtils.DicoToSerie(varData.HtData);

                    // Set last modified degree
                    scenario.degres_modifies[newdeg - 1] = false;
                    if (scenario.isAcademy && newdeg == 8) newdeg = 7;
                    if (newdeg > scenario.Last_Degree)
                    {
                        scenario.Last_Degree = newdeg;
                    }

                    scenario.ht_data = GenUtils.DicoToSerie(GenUtils.SerieToDico(scenario.ht_data)); // Info: This removes the duplicate keys

                    // Save to Database and Cache
                    Scenario.Update(dbContext.CScenario, scenario.Id, scenario.ht_data, scenario.Last_Degree, scenario.degres_modifies);
                    UpdateCacheScenario(scenario.Id, scenario.ht_data, scenario.Last_Degree, scenario.degres_modifies);

                    // Get the new calculed scenario.ht_data
                    var scenHypoTree = treeHypo.Join(
                        scenario.ht_data,
                        arg => arg.Idm,
                        arg2 => arg2.Variable,
                        (second, first) => new
                        {
                            Parent = second.ParentId,
                            Name = first.Variable,
                            RealName = second.DisplayLabel,
                            serie = first.Values,
                            Id = second.Idm,
                            Level = 0,
                            child = second.Child
                        }).ToList();

                    var scenResTree = treeRes.Join(
                        scenario.ht_data,
                        arg => arg.Idm,
                        arg2 => arg2.Variable,
                        (second, first) => new
                        {
                            Parent = second.ParentId,
                            Name = first.Variable,
                            RealName = second.DisplayLabel,
                            serie = first.Values,
                            Id = second.Idm,
                            Level = 0,
                            child = second.Child
                        }).ToList();

                    // yearsCount is for display in the front-end
                    List<int> yearsCount = new List<int>();
                    for (int i = scenario.firstYears; i <= scenario.lastYears; i++)
                    {
                        yearsCount.Add(i);
                    }

                    var result = new
                    {
                        Id = scenario.Id,
                        YearsCount = yearsCount,
                        scen1 = scenHypoTree,
                        scen2 = scenResTree,
                        Type1 = degre + "µ" +
                            scenario.isEasy + "µ" +
                            scenario.isNational + "µ" +
                            scenario.isAcademy,
                        Type2 = degre + "µ" +
                            scenario.isEasy + "µ" +
                            scenario.isNational + "µ" +
                            scenario.isAcademy,
                        LastYear = years.IndexOf(scenario.lastYearsConstat),
                        degres_modifies = scenario.degres_modifies
                    };

                    Logger.LogInformation("End CalculContexte");
                    return Json(JsonConvert.SerializeObject(result, Settings));
                }
                catch (Exception ex)
                {
                    Logger.LogError(ex, ex.Message, null);
                    return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
                }
            }

        }


        [HttpPost]
        public ActionResult ChangeDegre(string id, string degre)
        {
            lock(LockChangeDegre) {
                try
                {
                    Logger.LogInformation("Start ChangeDegre");
                    var scenario = GetScenarioById(id);
                    if (degre == null) degre = "Entrant";


                    // Setup For Calcul contexte
                    AcademyData acaYear = new AcademyData();
                    List<int> yearsAca = new List<int>();
                    foreach (string year in acaYear.Year) yearsAca.Add(Int32.Parse(year));
                    int lastYearIndex = yearsAca[yearsAca.Count - 1];
                    lastYearIndex = scenario.lastYearsConstat;
                    Utils.Engine.VarData varData = new Utils.Engine.VarData(yearsAca, lastYearIndex);
                    varData.IsConstat = false;
                    varData.IsTabRecap = false;

                    Utils.Engine.Engine engine = new Utils.Engine.Engine(varData);

                    // Find the folder Name
                    string[] listNoEasy = new string[] { "Entrant", "1", "Diplome", "Academie" };
                    string[] listNoNat = new string[] { "Diplome", "Academie" };
                    string[] listNotDegree = new string[] { "Entrant", "Diplome", "Academie" };
                    bool isEasy = false;
                    bool isNational = false;
                    bool isDegree = false;

                    if (listNoEasy.Contains(degre)) isEasy = false;
                    else isEasy = scenario.isEasy;  // TODO: scenario.isEasy seems to be always false, this means scenario.isEasy is not inserted into database

                    if (listNoNat.Contains(degre)) isNational = false;
                    else isNational = scenario.isNational; // TODO: scenario.isNational seems to be always false, this means scenario.isEasy is not inserted into database
                    //isNational = true; // TODO: Test à commenter   
                    if (degre.Equals("Diplome") || degre.Equals("Academie")) // TODO: Test à commenter// TODO: Test à commenter
                    {
                        isNational = false;

                    }

                    if (listNotDegree.Contains(degre)) isDegree = false;
                    else isDegree = true;
                    string folderName = "Ctx";
                    if (isDegree) folderName += "Degre" + degre;
                    else folderName += degre;

                    if (isNational && isEasy) folderName += "SimplNat";
                    else if (isNational) folderName += "Nat";
                    else if (isEasy) folderName += "Simpl";
                    string rootPath = Environment.WebRootPath + "/Calcule/";
                    XmlDocument model = DomUtils.getDocumentFromResourcePath(rootPath + String.Format("/{0}/model.xml", folderName));
                    XmlDocument hypo = DomUtils.getDocumentFromResourcePath(rootPath + String.Format("/{0}/hypo.xml", folderName));
                    XmlDocument res = DomUtils.getDocumentFromResourcePath(rootPath + String.Format("/{0}/res.xml", folderName));

                    // Set size of NbYears
                    Utils.Engine.VarData.NbYears = scenario.lastYears - scenario.firstYears + 1; // TODO: Concurrent Access to static variables?

                    // Execute CalculContexte
                    varData.HtData = GenUtils.SerieToDico(scenario.ht_data);
                    engine.RtCompute(hypo.DocumentElement); // TODO: Is executing engine necessary?
                    engine.RtCompute(res.DocumentElement);

                    //varData.HtData["EFF"] = varData.HtData["EFF_J_900"]; // TODO: This should be in the XML

                    // Update scenario.ht_data with the new values
                    scenario.ht_data = GenUtils.DicoToSerie(varData.HtData);

                    // Reset size of NbYears
                    Utils.Engine.VarData.NbYears = 30;

                    // Save Scenario to Database and Cache
                    Scenario.Update(dbContext.CScenario, scenario.Id, scenario.ht_data);
                    UpdateCacheScenario(scenario.Id, scenario.ht_data);


                    //Recupération Tree
                    bool easy = false;
                    string[] listnoEasy = new string[] { "Entrant", "1", "Diplome", "Academie" };

                    if (listnoEasy.Contains(degre)) easy = false;
                    else easy = scenario.isEasy;

                    TreeModelView mt1 = ModelTree(degre, easy, isNational, scenario.isAcademy);

                    //count 
                    var parent1 = mt1.model.Where(a => a.ParentId == "Hypotheses");
                    var parent2 = mt1.model.Where(a => a.ParentId == "Resultats");
                    var tree1 = parent1.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, first.Type, first.Display, Child = second.Count() }).ToList();
                    var tree2 = parent2.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, first.Type, first.Display, Child = second.Count() }).ToList();

                    var scen1 = tree1.Join(
                        scenario.ht_data,
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
                        }).Where(x => x.Name != " ").ToList();
                    var scen2 = tree2.Join(
                        scenario.ht_data,
                        arg => arg.Idm,
                        arg2 => arg2.Variable,
                        (second, first) => new
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
                        }).Where(x => x.Name != " " ).ToList();

                    //var scen1 = scenario.ht_data.Join(tree1, arg => arg.Variable, arg2 => arg2.Idm, (first, second) => new { Parent = second.ParentId, Name = first.Variable, RealName = second.DisplayLabel, serie = first.Values, Id = second.Idm, Level = 0, child = second.Child }).ToList(); ;
                    //var scen2 = scenario.ht_data.Join(tree2, arg => arg.Variable, arg2 => arg2.Idm, (first, second) => new { Parent = second.ParentId, Name = first.Variable, RealName = second.DisplayLabel, serie = first.Values, Id = second.Idm, Level = 0, child = second.Child }).ToList(); ;
                    List<int> years = new List<int>();
                    for (int i = scenario.firstYears; i <= scenario.lastYears; i++)
                    {
                        years.Add(i);
                    }
                    var result = new { Id = scenario.Id, YearsCount = years, scen1 = scen1, scen2 = scen2, Type1 = degre + "µ" + scenario.isEasy + "µ" + scenario.isNational + "µ" + scenario.isAcademy, Type2 = degre + "µ" + scenario.isEasy + "µ" + scenario.isNational + "µ" + scenario.isAcademy, LastYear = years.IndexOf(scenario.lastYearsConstat) };

                    Logger.LogInformation("End ChangeDegre");
                    return Json(JsonConvert.SerializeObject(result, Settings));
                }
                catch (Exception ex)
                {
                    Logger.LogError(ex, ex.Message, null);
                    return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
                }
            }

        }

        [HttpPost]
        public IActionResult CalculMeresScenario(string id, int year, string valStr, string variable, string parent, string degre)
        {
            lock (LockCalculMere)
            {

                try
                {
                    Logger.LogInformation("Start CalculMeresScenario");

                    var splt = variable.Split("_");
                    var tree = GetScenarioById(id);

                    var index = year - tree.firstYears;

                    bool easy = false;
                    string[] listnoEasy = new string[] { "Entrant", "1", "Diplome", "Academie" };
                                
                    string degre2 = degre;
                    if (degre2 == "Diplome") degre2 = "7";
                    if (degre2 == "Academie") degre2 = "8";
                    int iDeg = 0; int.TryParse(degre2, out iDeg);

                    for (int deg = iDeg; deg <= Math.Min(tree.Last_Degree, tree.degres_modifies.Length-1) ; deg++) tree.degres_modifies[deg] = true;

                    Scenario.Update(dbContext.CScenario, id, tree.degres_modifies);
                    UpdateCacheScenario(id, tree, null , tree.degres_modifies);

                    /*if ( splt[0].StartsWith("ANC")) //splt[0] == "T" || //  splt[0] == "P" ||
                    {
                        return Json(JsonConvert.SerializeObject(null, Settings));
                    }*/

                    if (listnoEasy.Contains(degre)) easy = false;
                    else easy = tree.isEasy;

                    TreeModelView modelTree = ModelTree(degre, easy, tree.isNational, tree.isAcademy);

                    double val = double.Parse(valStr.Replace(".", ","), new CultureInfo("fr-FR"));
                    var serie = tree.ht_data.Where(x => x.Variable == variable).FirstOrDefault();
                    //if (splt[0] == "T" || splt[0] == "P" /*|| splt[0].StartsWith("ANC")*/) serie.Values[index] = double.Parse(val.ToString().Replace(".", ","), new CultureInfo("fr-FR")) / 100;
                    //else serie.Values[index] = val;

                    

                    serie.Values[index] = val;

                    var p = modelTree.model.Where(x => x.Idm == parent).FirstOrDefault();
                    if(degre == "Diplome")
                    {
                        p = modelTree.model.Where(x => x.ParentId == parent).FirstOrDefault();
                    }

                    if (p == null) return Json(JsonConvert.SerializeObject(tree.ht_data, Settings)); // TODO: p is null for diplome when iseasy = false and isnational = true

                    List<OneSerie> newSeries = new List<OneSerie>();

                    if (!variable.Contains("_"))
                    {
                        return Json(JsonConvert.SerializeObject(null, Settings));
                    }

                    var niv = Tools.GetNiveauDeg(variable);

                    var myVar = Tools.GetVariableIJ(variable);



                    if (niv.Length > 2) niv = niv[0].ToString() + niv[1].ToString();

                    do
                    {
                        var allVar = modelTree.model.Where(x => x.ParentId == p.Idm).ToList();

                        serie = tree.ht_data.Where(x => x.Variable == p.Idm).FirstOrDefault();

                        var pmodel = modelTree.model.Where(x => x.ParentId == p.ParentId).FirstOrDefault();


                        double res = 0;

                        if (splt[0] == "T" || splt[0] == "P" || splt[0].StartsWith("ANC"))
                        {
                            var pondVar = _dataService.Ponderations.Where(x => x.Variable.StartsWith(myVar)).FirstOrDefault();
                            if (pondVar == null) break; // ARR return Json(JsonConvert.SerializeObject(new  { error = "Variable pondération pas dans la Base de données (" + myVar + ")" }, settings ));
                            string[] pondIJ;
                            string ponderation, IJPond, IJ, endIndex;
                            int idx = 0;
                            foreach (var item in allVar) //allVar = tt les variables fille pour faire le calcul de la mere
                            {
                                var childSerie = tree.ht_data.Where(x => x.Variable == item.Idm || x.Variable == item.DisplayLabel).FirstOrDefault();

                                if (childSerie != null)
                                {
                                    pondIJ = childSerie.Variable.Split('_');

                                    ponderation = pondVar.ponderation;
                                    idx = index;
                                    if (ponderation.Contains("[an-1]"))
                                    {
                                        idx = (index - 1) < 0 ? 0 : index - 1;
                                        ponderation = ponderation.Replace("[an-1]", "");
                                    }

                                    IJPond = Tools.GetIJ(ponderation, 0);
                                    IJ = Tools.GetIJ(variable, 1);

                                    endIndex = pondIJ[pondIJ.Length - 1];
                                    if (IJPond == "IJ" && IJ == "I")
                                    {
                                        if (endIndex.Contains(",")) endIndex = endIndex.Split(',')[0];
                                    }
                                    else if (IJ == "I200" || IJ == "I300" || IJ == "I400")
                                    {
                                        var ind = IJ.Substring(1);
                                        ponderation.Replace(IJ, "IJ");
                                        if (endIndex.Contains(","))
                                        {

                                            var sp = endIndex.Split(',');
                                            endIndex = sp[0] + "," + ind;
                                        }
                                    }

                                    var pondSerie = tree.ht_data.Where(x => x.Variable.StartsWith(ponderation) && x.Variable.EndsWith(endIndex)).FirstOrDefault();
                                    if (pondSerie != null) res += double.Parse(childSerie.Values[index].ToString().Replace(".", ","), new CultureInfo("fr-FR")) *
                                                double.Parse(pondSerie.Values[idx].ToString().Replace(".", ","), new CultureInfo("fr-FR"));

                                }
                            }

                            pondIJ = serie.Variable.Split('_');
                            ponderation = pondVar.ponderation;
                            idx = index;
                            if (ponderation.Contains("[an-1]"))
                            {
                                idx = (index - 1) < 0 ? 0 : index - 1;
                                ponderation = ponderation.Replace("[an-1]", "");
                            }

                            IJPond = Tools.GetIJ(ponderation, 0);
                            IJ = Tools.GetIJ(variable, 1);

                            endIndex = pondIJ[pondIJ.Length - 1];
                            if (IJPond == "IJ" && IJ == "I")
                            {
                                if (endIndex.Contains(",")) endIndex = endIndex.Split(',')[0];
                            }
                            else if (IJ == "I200" || IJ == "I300" || IJ == "I400")
                            {
                                var ind = IJ.Substring(1);
                                ponderation.Replace(IJ, "IJ");
                                if (endIndex.Contains(","))
                                {

                                    var sp = endIndex.Split(',');
                                    endIndex = sp[0] + "," + ind;
                                }
                            }

                            var pondParent = tree.ht_data.Where(x => x.Variable.StartsWith(ponderation) && x.Variable.EndsWith(endIndex)).FirstOrDefault();
                            if (pondParent != null) res /= double.Parse(pondParent.Values[idx].ToString().Replace(".", ","), new CultureInfo("fr-FR"));

                        }
                        else
                        {
                            foreach (var item in allVar)
                            {
                                var childSerie = tree.ht_data.Where(x => x.Variable == item.Idm || x.Variable == item.DisplayLabel).FirstOrDefault();
                                if (childSerie != null) res += double.Parse(childSerie.Values[index].ToString().Replace(".", ","), new CultureInfo("fr-FR"));
                            }
                        }


                        if (Double.IsNaN(res) || Double.IsInfinity(res)) res = 0;
                        //if (splt[0] == "T" || splt[0] == "P" /*|| splt[0].StartsWith("ANC")*/) res *= 100;
                        serie.Values[index] = res;

                       
                        newSeries.Add(new OneSerie() { Variable = p.Idm, Value = res });

                        p = modelTree.model.Where(x => x.Idm == pmodel.ParentId).FirstOrDefault();
                    } while (p != null && p.Idm != "Hypotheses"); //

                    // Kaky- 30/06/2022 - Mise à jour dans la base
                    Scenario.Update(dbContext.CScenario, id, tree.ht_data);
                    UpdateCacheScenario(id, tree.ht_data);

                    Logger.LogInformation("End CalculMeresScenario");
                    return Json(JsonConvert.SerializeObject( new
                    {
                        newSeries,
                        degres_modifies = tree.degres_modifies
                    }, Settings));
                }
                catch (Exception ex)
                {
                    Logger.LogError(ex, ex.Message, null);
                    return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
                }
            }
        }


        [HttpPost]
        public IActionResult ExportScenarioCSV(string id, string degre, string vars) // TODO: vars contain DisplayLabel but should contain Label
        {
            try
            {
                Logger.LogInformation("Start ExportScenarioCSV");
                var scenario = GetScenarioById(id);

                TreeModelView modelTree = ModelTree(degre, scenario.isEasy, scenario.isNational, scenario.isAcademy);
                var trees = modelTree.model.GroupJoin
                    (modelTree.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new RowTree { Idm = first.Idm, ParentId = first.ParentId, DisplayLabel = first.DisplayLabel, Child = second.Count() })
                    .ToList();

                ExportVars export = new ExportVars(Environment.WebRootPath, scenario.Name, degre, scenario.firstYears, scenario.lastYears, false);
                string fileNameClient = export.WriteToCSV(scenario.ht_data, trees, vars);
                string fileName = export.FileName;

                Logger.LogInformation("End ExportScenarioCSV");
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
        public async Task<IActionResult> OpenRowChildScenario(string id, string name, string detail, string child = "", string hypoVars = "", string resVars = "")
        {
            try
            {
                Logger.LogInformation("Start OpenRowChildScenario");
                string[] Type = detail.Split('µ');
                string degre = "Entrant";
                bool iseas = false, isnat = false, isacad = false;
                ScenarioViewModel scenario = GetScenarioById(name).Clone() as ScenarioViewModel;

                if (Type.Count() >= 3)
                {
                    degre = detail.Split('µ')[0];
                    iseas = Convert.ToBoolean(detail.Split('µ')[1]);
                    isnat = Convert.ToBoolean(detail.Split('µ')[2]);
                    isacad = Convert.ToBoolean(detail.Split('µ')[3]);
                } else
                {
                    degre = detail;
                    iseas = scenario.isEasy;
                    isnat = scenario.isNational;
                    isacad = scenario.isAcademy;
                }
                if (degre == null) degre = "Entrant";
                //Recupération Tree

                bool easy = false;
                string[] listnoEasy = new string[] { "Entrant", "1", "Diplome", "Academie" };

                if (listnoEasy.Contains(degre)) easy = false;
                else easy = iseas;

                if (degre.Equals("Diplome") || degre.Equals("Academie")) isnat = false;

                TreeModelView mt1 = ModelTree(degre, easy, isnat, isacad);

                var parent1 = mt1.model.Where(a => a.ParentId == id);

                var model = new CreateIndexModel<Scenario>(
                   Builders<Scenario>.IndexKeys.Ascending("series.Variable"));
                await dbContext.CScenario.Indexes.CreateOneAsync(model).ConfigureAwait(false); // TODO: What is this used for?
                //count 

                var tree1 = parent1.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, first.Type, first.Display, Child = second.Count() }).ToList();
                

                var idc = dbContext.CConstat.AsQueryable().Where(c => c.Seq == scenario.observation).Select(c => c.Id).FirstOrDefault();

                var scen1 = tree1.Join(
                    scenario.ht_data,
                    arg => arg.Idm,
                    arg2 => arg2.Variable,
                    (second, first) => new
                    Row
                    {
                        Parent = second.ParentId,
                        Name = first.Variable,
                        RealName = second.DisplayLabel,
                        serie = first.Values,
                        Id = second.Idm,
                        Level = 0,
                        child = second.Child,
                        type  = second.Type,
                        display = second.Display
                    }).ToList();

                List<int> years = new List<int>();
                for (int i = scenario.firstYears; i <= scenario.lastYears; i++)
                {
                    years.Add(i);
                }

                var newMtree = _dataService.Mtrees.Where(x => x.Degres == degre && x.Is_Easy == easy && x.Is_National == isnat && x.Is_Academy == isacad).Select(x => x.Order_Hyp).FirstOrDefault();

                if (id.Equals("EFF")) scen1 = new List<Row>();

                var result = new { YearsCount = years, Datas = scen1, LastYear = years.IndexOf(scenario.lastYearsConstat), hypo = newMtree };

                Logger.LogInformation("End OpenRowChildScenario");
                return Json(JsonConvert.SerializeObject(result, Settings));

            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> DepliageScenario(string id, string name, string detail)
        {
            try
            {
                Logger.LogInformation("Start DepliageScenario");
                string[] Type = detail.Split('µ');
                string degre = "Entrant";
                bool iseas = false, isnat = false, isacad = false;
                ScenarioViewModel scenario = GetScenarioById(name).Clone() as ScenarioViewModel;

                if (Type.Count() >= 3)
                {
                    degre = detail.Split('µ')[0];
                    iseas = Convert.ToBoolean(detail.Split('µ')[1]);
                    isnat = Convert.ToBoolean(detail.Split('µ')[2]);
                    isacad = Convert.ToBoolean(detail.Split('µ')[3]);
                }
                else
                {
                    degre = detail;
                    iseas = scenario.isEasy;
                    isnat = scenario.isNational;
                    isacad = scenario.isAcademy;
                }
                if (degre == null) degre = "Entrant";
                //Recupération Tree

                bool easy = false;
                string[] listnoEasy = new string[] { "Entrant", "1", "Diplome", "Academie" };

                if (listnoEasy.Contains(degre)) easy = false;
                else easy = iseas;

                TreeModelView mt1 = ModelTree(degre, easy, isnat, isacad);

                List<model> m = new List<model>();
                int[] level = new int[1];
                level[0] = 1;
                GetAllChild(mt1, id, m, level);

                var model = new CreateIndexModel<Scenario>(
                   Builders<Scenario>.IndexKeys.Ascending("series.Variable"));
                await dbContext.CScenario.Indexes.CreateOneAsync(model).ConfigureAwait(false);
                //count 

                var tree1 = m.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.Level, first.DisplayLabel, first.Type, first.Display, Child = second.Count() }).ToList();
                

                var idc = dbContext.CConstat.AsQueryable().Where(c => c.Seq == scenario.observation).Select(c => c.Id).FirstOrDefault();
                var constat = GetConstatById(idc).Clone() as ConstatViewModel;
                //Récupération 
                int nbrScenario = scenario.lastYears - constat.Last_year;
                int tabScenario = scenario.lastYears - constat.First_year;
                int skip = tabScenario - nbrScenario;
                int nbrTabAct = scenario.ht_data.FirstOrDefault().Values.Count;
                var res = new List<Serie>();
                res = scenario.ht_data;

                scenario.lastYearsConstat = constat.Last_year;
                scenario.firstYears = constat.First_year;

                var scen1 = tree1.Join(
                    res,
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
                for (int i = scenario.firstYears; i <= scenario.lastYears; i++)
                {
                    years.Add(i);
                }

                var newMtree = _dataService.Mtrees.Where(x => x.Degres == degre && x.Is_Easy == easy && x.Is_National == isnat && x.Is_Academy == isacad).Select(x => x.Order_Hyp).FirstOrDefault();

                var result = new { YearsCount = years, Datas = scen1, LastYear = years.IndexOf(scenario.lastYearsConstat), hypo = newMtree };

                Logger.LogInformation("End DepliageScenario");

                return Json(JsonConvert.SerializeObject(result, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult SaveTreeScenario(string id, string serie)
        {
            try
            {
                Logger.LogInformation("Start SaveTreeScenario");
                if (serie != null && String.IsNullOrEmpty(serie) == false)
                {
                    ScenarioViewModel scenarioVM = GetScenarioById(id);
                    List<Serie> Lserie = JsonConvert.DeserializeObject<List<Serie>>(serie);

                    // trouvé les séries à modifier et mettre à jours les données
                    foreach (Serie serieVM in scenarioVM.ht_data)
                    {
                        foreach (Serie serieUpdated in Lserie)
                        {
                            if (serieUpdated.Variable.Equals(serieVM.Variable))
                            {
                                int diff = serieVM.Values.Count - serieUpdated.Values.Count;
                                for (int iA = 0; iA < serieUpdated.Values.Count; iA++)
                                {
                                    serieVM.Values[diff + iA] = serieUpdated.Values[iA];
                                }

                                break;
                            }
                        }
                    }

                    Scenario.Update(dbContext.CScenario, id, scenarioVM.ht_data, scenarioVM.Last_Degree);
                    UpdateCacheScenario(id, scenarioVM.ht_data, scenarioVM.Last_Degree);

                }

                Logger.LogInformation("End SaveTreeScenario");
                return Json(JsonConvert.SerializeObject(new { msg = "Scénario enregistré." }, Settings));
                //return Json(JsonConvert.SerializeObject(new { msg = "Scénario [" + scenarioVM.Name + "] enregistré" }, settings));
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
                Logger.LogInformation("Start Supprimer scénario");
                
                    var scenario = GetScenarioById(id);
                    dbContext.InitRecapitulatif();
                    if (Scenario.Delete(dbContext.CRecapitulatif, dbContext.CScenario, scenario.Id, id) == false)
                    {
                        return Json("false");
                    }
                    DeleteCacheScenario(id);

                //_cache.Remove(id);

                Logger.LogInformation("End Supprimer scénario");
                return Json("true");
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

        }

        // INFO: Called when creating a scenario from existing scenario
        [HttpPost]
        public IActionResult GetScenario(string id, string name, string newYears, bool isNew, string idConstat, string degre, bool isEasy)
        {
            try
            {
                Logger.LogInformation("Start GetScenario");
                if (id.Contains("newId")) throw new Exception("Veuillez vérifier que l'appel API est correct.");
                ScenarioViewModel scenario = (ScenarioViewModel)GetScenarioById(id).Clone();

                // INFO: Test scenario name ?
                Scenario ct = Scenario.FindByName(dbContext.CScenario, name, scenario.User);
                if (ct != null) throw new Exception("Ce nom de scénario existe déjà. Veuillez en choisir un autre.");

                // Création du nouvel objet
                scenario.Name = name;
                scenario.seq = 0;
                Scenario scnew = new Scenario();
                scnew.Name = name;
                scnew.academy = scenario.Academy;
                scnew.user = scenario.User;
                scnew.First_year = scenario.firstYears;
                scnew.Last_year = scenario.lastYears;
                scnew.Observation = scenario.observation;
                scnew.Last_Degree = scenario.Last_Degree;
                scnew.degres_modifies = scenario.degres_modifies;
                var idsc = ObjectId.GenerateNewId().ToString();
                scnew.Id = idsc;
                scenario.Id = idsc;
                List<Serie> nSeries = scenario.ht_data;

                scnew.isEasy = scenario.isEasy;
                scnew.isAcademy = scenario.isAcademy;
                scnew.isNational = scenario.isNational;

                scnew.Last_year_constat = scenario.lastYearsConstat;
                scnew.Seq = ScenarioUtils.GetLastSeq();

                // Insertion en base
                Scenario.InsertOrUpdate(dbContext.CScenario, scnew, nSeries, scenario.degres_modifies);
                UpdateCacheScenario(scnew.Id, scenario, nSeries, scenario.degres_modifies);

                string[] last_degree = new string[] { "Entrant", "1", "2", "3", "4", "5", "6", "Diplome", "Academy" };
                if (scenario.Last_Degree > last_degree.Length - 1) degre = last_degree[last_degree.Length - 1];
                else degre = last_degree[scenario.Last_Degree];
                if (degre == null) degre = "Entrant";

                //Recupération Tree
                TreeModelView mt1 = ModelTree(degre, scenario.isEasy, scenario.isNational, scenario.isAcademy);

                var parent1 = mt1.model.Where(a => a.ParentId == "Hypotheses");
                var parent2 = mt1.model.Where(a => a.ParentId == "Resultats");
                var tree1 = parent1.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, Child = second.Count() }).ToList();
                var tree2 = parent2.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, Child = second.Count() }).ToList();

                var scen1 = tree1.Join(
                scenario.ht_data,
                arg => arg.Idm,
                arg2 => arg2.Variable,
                (second, first) => new {
                    Parent = second.ParentId,
                    Name = first.Variable,
                    RealName = second.DisplayLabel,
                    serie = first.Values,
                    Id = second.Idm,
                    Level = 0,
                    child = second.Child
                }).ToList();
                var scen2 = tree2.Join(
                    scenario.ht_data,
                    arg => arg.Idm,
                    arg2 => arg2.Variable,
                    (second, first) => new {
                        Parent = second.ParentId,
                        Name = first.Variable,
                        RealName = second.DisplayLabel,
                        serie = first.Values,
                        Id = second.Idm,
                        Level = 0,
                        child = second.Child
                    }).ToList();

                List<int> years = new List<int>();
                for (int i = scenario.firstYears; i <= scenario.lastYears; i++)
                {
                    years.Add(i);
                }

                var result = new
                {
                    Id = scenario.Id,
                    YearsCount = years,
                    scen1 = scen1,
                    scen2 = scen2,
                    Type1 = degre + "µ" + scenario.isEasy + "µ" + scenario.isNational + "µ" + scenario.isAcademy,
                    Type2 = degre + "µ" + scenario.isEasy + "µ" + scenario.isNational + "µ" + scenario.isAcademy,
                    LastYear = years.IndexOf(scenario.lastYearsConstat),
                    deg = scenario.Last_Degree,
                    degres_modifies = scenario.degres_modifies
                };


                Logger.LogInformation("End GetScenario");
                return Json(JsonConvert.SerializeObject(result, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
        [HttpPost]
        public ActionResult VerificationCoherence(string id, string degre)
        {
            try
            {
                Logger.LogInformation("Start VerificationCoherence");
                var scenario = MemCache.Get<ScenarioViewModel>(id);
                var first_yearC = scenario.firstYears;
                var last_yearC = scenario.lastYearsConstat;
                var last_year = scenario.lastYears;
                int first = last_yearC - first_yearC + 1;
                var last = last_year - first_yearC;
                //double epsilon = 0.005;
                var res = dbContext.CModelTree.AsQueryable().Where(x => x.Degres == degre && x.Is_National && x.Is_Easy && x.Version == 0).Select(x => x.Order_Res).First();
                List<string> coher = new List<string>();
                string text;
                int dep_year = last_yearC - first_yearC + 1;
                foreach (var j in scenario.ht_data)
                {
                    //  var j = scenario.ht_data.Where(m => m.Variable.Contains(l)).FirstOrDefault();

                    for (int k = dep_year; k <= last; k++)
                    {
                        int annee = first_yearC + k;

                        if (j.Values[k].ToString() == "∞") continue;
                        float b = 0;
                        float.TryParse(j.Values[k].ToString().Replace('.', ','), out b);
                        if (b < 0.0)
                        {

                            if ((j.Variable.StartsWith("P_")) || (j.Variable.StartsWith("T_")))
                            {
                                double val = 0;
                                double.TryParse(j.Values[k].ToString().Replace('.', ','), out val);
                                //   val *= 100;
                                text = "Taux negatif(" + j.Variable.ToString() + " année : " + annee.ToString() + ":" + float.Parse(val.ToString()).ToString("f2");
                                coher.Add(text);
                            }
                            else
                            {
                                text = "Effectif negatif(" + j.Variable.ToString() + " année : " + annee.ToString() + ":" + j.Values[k].ToString();
                                coher.Add(text);
                            }

                        }
                        else if ((j.Variable.StartsWith("P_") || (j.Variable.StartsWith("T_"))) && b > 100)
                        {
                            if (j.Variable.StartsWith("P_"))
                            {
                                var val = double.Parse(j.Values[k].ToString().Replace(".", ","), new CultureInfo("fr-FR"));
                                text = "Part(Taux) strictement supérieure à 100% (" + j.Variable.ToString() + " année : " + annee.ToString() + ":" + float.Parse(val.ToString()).ToString("f2");
                                coher.Add(text);
                            }
                            else if ((b) > 120)
                            {
                                var val = b;
                                text = "(Taux)strictement supérieure à 120% (" + j.Variable.ToString() + " année : " + annee.ToString() + ":" + float.Parse(val.ToString()).ToString("f2");
                                coher.Add(text);
                            }
                        }
                    }
                }
                Logger.LogInformation("End VerificationCoherence");
                return Json(JsonConvert.SerializeObject(coher, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // Get list of Scenario
        [HttpPost]
        public IActionResult ListScenario(string userId, string academyId)
        {
            //Données Académiques
            try
            {
                Logger.LogInformation("Start ListScenario");

                //Constats
                dbContext.InitScenario();
                var datas1 = dbContext.CScenario.AsQueryable().Where(x => x.user == userId /* && x.academy == academyId */ && !x.Is_archive)
                    .Select(x => new Scenario()
                    {
                        Id = x.Id,
                        Name = x.Name,
                        First_year = x.First_year,
                        Last_year = x.Last_year,
                        user = x.user,
                        academy = x.academy,
                        Seq = x.Seq,
                        Documentation = x.Documentation,
                        Is_calculed = x.Is_calculed
                    }).ToList();
                //datas1.Constats = dbContext.CConstat.Find(x => x.user == userId && x.academy == academyId).ToList();

                //Scenario

                //tab recap
                Logger.LogInformation("End ListScenario");
                return Json(JsonConvert.SerializeObject(datas1, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult GetScenarioArchive(string id, string name, string type, string user, string academy)
        {
            var model = new Archive();
            model.Id = id;
            model.Name = name;
            if (academy == null || (academy != null && academy == "null")) academy = ObjectId.Empty.ToString();
            model.Type = "Scenario";
            dbContext.InitScenario();
            string[] academies = academy.Split(",");
            List<ArchiveItem> archives = new List<ArchiveItem>();
            foreach(var acad in academies)
            {
                var archive = dbContext.CScenario.AsQueryable().Where(x => x.user == user && x.academy == acad).Select(
                        c => new ArchiveItem() { Id = c.Id, Name = c.Name, Is_archive = c.Is_archive }
                ).OrderBy(c => c.Name).ToList();
                archives.AddRange(archive);
            }
   
            model.archives = archives;
            return Json(JsonConvert.SerializeObject(model, Settings));
        }

        [HttpPost]
        public IActionResult UpdateScenarioName(string _id, string name, string userId)
        {
            try
            {
                Logger.LogInformation("Start UpdateScenarioName");
                if (name == null || name.Trim().Length == 0) throw new Exception("Veuillez entrez un nom correct.");

                dbContext.InitScenario();

                Scenario ct = Scenario.FindByName(dbContext.CScenario, name, userId);
                if (ct != null) throw new Exception("Ce nom de scénario existe déjà. Veuillez en choisir un autre.");
                Scenario.UpdateScenarioName(dbContext.CScenario, _id, name);
                UpdateCacheScenario(_id, name);
                var resutl = new { name = name };
                Logger.LogInformation("End UpdateScenarioName");
                return Json(JsonConvert.SerializeObject(resutl, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult CalculateAll( string idScenario, int lastYear, string currentDegree, string lastDegreeOpen,bool islastDegree,bool isNationalUser )
        {
            try {
                Logger.LogInformation("Start calculate all");
                
                var result = new { };
                string[] degres = new string[] { "Entrant", "1", "2", "3", "4", "5", "6", "Diplome", "Academie" };
                int indexCurrentDegree = Array.IndexOf(degres, currentDegree);
                int indexLastDegreeOpen = Array.IndexOf(degres,lastDegreeOpen);
                List<string> degresOpened = new List<string>();
                for (int i=indexCurrentDegree; i < indexLastDegreeOpen; i++)
                {
                    degresOpened.Add(degres[i]);
                }
                if (islastDegree && isNationalUser)
                {
                    degresOpened.Add(degres[^1]);
                }else if (islastDegree && isNationalUser==false) {
                    degresOpened.Add(degres[^2]);
                }
                int newDeg = indexCurrentDegree+1;
                foreach (string degre in degresOpened)
                {
                    if (degre == degresOpened[0]) {
                        CalculContexte(idScenario, degre, newDeg);
                    }
                    else
                    {
                        // ReconduireVariables(idScenario, lastYear, degre);
                        CalculContexte(idScenario, degre, newDeg);
                    }
                    newDeg++;
                }

                Logger.LogInformation("End calculate all");
                return Json(JsonConvert.SerializeObject(result, Settings));
            }
            catch(Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
            
        }

        #endregion actions

        #region functions
        public IActionResult InitTreeScenario(string table, string id, string name)
        {
            try
            {
                Logger.LogInformation("Start InitTreeScenario");
                var scenario = JsonConvert.DeserializeObject<Scenario>(table);
                //dbContext.InitConstat();
                Constat constat = dbContext.CConstat.AsQueryable().Where(x => x.Seq == scenario.Observation).Select(x => new Constat()
                {
                    First_year = x.First_year,
                    Last_year = x.Last_year

                }).FirstOrDefault();

                //dbContext.InitModelTree();
                Model_Trees md1 = dbContext.CModelTree.Find(x => x.Degres == "Entrant" && x.Is_National && !x.Is_Easy).FirstOrDefault();

                var scen1 = CreateTreeScenario(scenario.series, md1.model, new int[] { constat.First_year, scenario.Last_year, constat.Last_year });
                var scen2 = CreateTreeScenario(scenario.series, md1.model, new int[] { constat.First_year, scenario.Last_year, constat.Last_year });
                Logger.LogInformation("End InitTreeScenario");

                return Json(JsonConvert.SerializeObject(new object[] { scen1, scen2 }, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        public object[] CreateTreeScenario(List<Serie> series, List<model> models, int[] year)
        {
            try
            {
                Logger.LogInformation("Start CreateTreeScenario");
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
                        if (var.StartsWith("P_") || var.StartsWith("T_")) ser[i] = "" + decimal.Round(Convert.ToDecimal(sr.Data[i].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 2);
                        else ser[i] = "" + decimal.Round(decimal.Parse(sr.Data[i].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 2);


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
                Logger.LogInformation("End CreateTreeScenario");
                return new object[] { data, data2, year[0], year[1], year[2] };
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return null;
            }
        }
        public IActionResult SendTree(string parent, TreeModelView mt1, ScenarioViewModel scenario, string degre, string hypoVars, string resVars, string[] newMtree, bool isGetFirstTreeScenario)
        {
            int lastDegree = scenario.Last_Degree;

            User user = prevsup.Models.User.Find(dbContext.CUser, scenario.User);
            if (user != null)
            {
                if(user.Login.ToLower().Equals("ssr70") == false)
                {
                    if (lastDegree > 7) lastDegree = 7;
                }
            }

            if (parent.Equals("J900"))
            {
                var parent1 = mt1.model.Where(a => a.ParentId == "Hypotheses");
                var parent2 = mt1.model.Where(a => a.ParentId == "Resultats");
                var tree1 = parent1.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, first.Type, first.Display, Child = second.Count() }).ToList();
                var tree2 = parent2.GroupJoin(mt1.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, first.Type, first.Display, Child = second.Count() }).ToList();

                var scen1 = tree1.Join(
                    scenario.ht_data,
                    arg => arg.Idm,
                    arg2 => arg2.Variable,
                    (second, first) => new {
                        Parent = second.ParentId,
                        Name = first.Variable,
                        RealName = second.DisplayLabel,
                        serie = first.Values,
                        Id = second.Idm,
                        Level = 0,
                        child = second.Child,
                        type = second.Type,
                        display = second.Display
                    }).Where(x => x.Name != " ").ToList();
                var scen2 = tree2.Join(
                    scenario.ht_data,
                    arg => arg.Idm,
                    arg2 => arg2.Variable,
                    (second, first) => new {
                        Parent = second.ParentId,
                        Name = first.Variable,
                        RealName = second.DisplayLabel,
                        serie = first.Values,
                        Id = second.Idm,
                        Level = 0,
                        child = second.Child,
                        type = second.Type,
                        display = second.Display
                    }).Where(x => x.Name != " ").ToList();

                List<int> years = new List<int>();
                for (int i = scenario.firstYears; i <= scenario.lastYears; i++)
                {
                    years.Add(i);
                }

                var result = new { Name = scenario.Name, Id = scenario.Id, YearsCount = years, scen1 = scen1, scen2 = scen2, Type1 = degre + "µ" + scenario.isEasy + "µ" + scenario.isNational + "µ" + scenario.isAcademy, Type2 = degre + "µ" + scenario.isEasy + "µ" + scenario.isNational + "µ" + scenario.isAcademy, LastYear = years.IndexOf(scenario.lastYearsConstat), deg = lastDegree, hypo = newMtree, degres_modifies = scenario.degres_modifies };

                Logger.LogInformation("End GetFirstTreeScenario");
                return Json(JsonConvert.SerializeObject(result, Settings));
            }
            else
            {

                List<FiliereTreeModel> filieres = GetFilieresTree();

                int level = -1;
                foreach(var filiere in filieres)
                {
                    if (filiere.nom.Equals(parent))
                    {
                        level = filiere.Level + 1;
                        break;
                    }
                }

                parent = parent.Replace("J", "");
                IEnumerable<model> parent1 = new List<model>();
                IEnumerable<model> parent2 = new List<model>();
                if (level == -1)
                {
                    Logger.LogInformation("[SendTree] Level = -1");
                    parent1 = mt1.HypoChildren.Where(a => a.Idm.Contains(parent));
                    parent2 = mt1.ResChildren.Where(a => a.Idm.Contains(parent));
                }  else
                {
                    parent1 = mt1.HypoChildren.Where(a => a.Idm.Contains(parent) && a.LevelXML == level);
                    parent2 = mt1.ResChildren.Where(a => a.Idm.Contains(parent) && a.LevelXML == level);
                }           


               




                var tree1 = parent1.GroupJoin(mt1.HypoChildren, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, first.Type, first.Display, Child = second.Count() }).ToList();
                var tree2 = parent2.GroupJoin(mt1.ResChildren, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new { first.Idm, first.ParentId, first.DisplayLabel, first.Type, first.Display, Child = second.Count() }).ToList();



                var scen1 = tree1.Join(
                    scenario.ht_data,
                    arg => arg.Idm,
                    arg2 => arg2.Variable,
                    (second, first) => new {

                        Parent = second.ParentId,
                        Name = first.Variable,
                        RealName = second.DisplayLabel,
                        serie = first.Values,
                        Id = second.Idm,
                        Level = 0,
                        child = second.Child,
                        type = second.Type,
                        display = second.Display
                    }).Where(x => x.Name != " ").ToList();
                var scen2 = tree2.Join(
                    scenario.ht_data,
                    arg => arg.Idm,
                    arg2 => arg2.Variable,
                    (second, first) => new {

                        Parent = second.ParentId,
                        Name = first.Variable,
                        RealName = second.DisplayLabel,
                        serie = first.Values,
                        Id = second.Idm,
                        Level = 0,
                        child = second.Child,
                        type = second.Type,
                        display = second.Display
                    }).Where(x => x.Name != " ").ToList();

                List<int> years = new List<int>();
                for (int i = scenario.firstYears; i <= scenario.lastYears; i++)
                {
                    years.Add(i);
                }

                var result = new
                {
                    name= scenario.Name,
                    Id = scenario.Id,
                    YearsCount = years,
                    scen1 = scen1,
                    scen2 = scen2,
                    Type1 = degre + "µ" + scenario.isEasy + "µ" + scenario.isNational + "µ" + scenario.isAcademy,
                    Type2 = degre + "µ" + scenario.isEasy + "µ" + scenario.isNational + "µ" + scenario.isAcademy,
                    LastYear = years.IndexOf(scenario.lastYearsConstat),
                    deg = lastDegree,
                    hypo = newMtree,
                    degres_modifies = scenario.degres_modifies
                }; // TODO: This maybe incorrect

                Logger.LogInformation("End GetFirstTreeScenario");
                return Json(JsonConvert.SerializeObject(result, Settings));
            }
        }
        #endregion functions
    }
}
