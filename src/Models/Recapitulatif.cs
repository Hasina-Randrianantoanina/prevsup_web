using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using prevsup.Utils;
using prevsup.Utils.Engine;
using prevsup.ViewModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Models
{
    public class Recapitulatif
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonElement("idScenario1")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string idscenario1 { get; set; }
        [BsonElement("idScenario2")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string idscenario2 { get; set; }
        [BsonElement("idScenario3")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string idscenario3 { get; set; }
        [BsonElement("idUser")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string iduser { get; set; }
        [BsonElement("idAcademy")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string idacademie { get; set; }
        [BsonElement("name")]
        public string Name { get; set; }
        [BsonElement("is_archive")]
        public bool Is_archive { get; set; }

        // Pour stocker l'id du fichier dans MongoDB
        [BsonElement("serie_id")]
        public string SerieId { get; set; }

        public List<Serie> Series { get; set; }

        private static FieldDefinition<Recapitulatif, string> serieIdField = "SerieId";
        private static FieldDefinition<Recapitulatif, string> idField = "Id";
        private static FieldDefinition<Recapitulatif, string> nameField = "Name";

        public int Iter { get; set; } // INFO: For Building Tree, TODO: This means not used

        public static Recapitulatif Find(IMongoCollection<Recapitulatif> collections, string userId, string recapName)
        {
            var found = collections.Find(x => x.Name.Equals(recapName) && x.iduser.Equals(userId)).FirstOrDefault();
            found = FindById(collections, found.Id);
            return found;
        }

        public static Recapitulatif FindById(IMongoCollection<Recapitulatif> collections, string _id) {
            
            GridFSUtils<Recapitulatif, List<Serie>> gridFSUtils = new GridFSUtils<Recapitulatif, List<Serie>>(collections.Database, _id, idField, serieIdField, "SerieId");
            Recapitulatif found = gridFSUtils.Find(collections, "Series");
            if (found == null) throw new Exception("Ce récapitulatif n'existe pas.");
            
            return found;
        }

        public static ModelTreeRecap CreateTree(List<Serie> _series, string rootPath, ScenarioViewModel scenario, string id) // IMongoCollection<Model_Trees> collections,  
        {
            ModelTreeRecap result = new ModelTreeRecap();
            result.scenarioname = scenario.Name;
            result.isNational = scenario.isNational;

            List<int> years = new List<int>(); // TODO: Maybe get this from scenario.Years so Insert it into Database, Check if this is inserted into database
            for (int i = scenario.firstYears; i <= scenario.lastYears; i++) years.Add(i);

            var seriesDict = GenUtils.SerieToDico(_series);

            // GetModelTree
            
            List<RecapitulatifTreeModel> treeData = null;
            //var parentHypo = hypTree.model.Where(a => a.ParentId == "Hypotheses");
            //var tree1 = parentHypo.GroupJoin(hypTree.model, arg => arg.Idm, arg2 => arg2.ParentId, (first, second) => new RowTree{ Idm = first.Idm, ParentId = first.ParentId, DisplayLabel = first.DisplayLabel, Child = second.Count() }).ToList();
            
            Recapitulatif recapForTree = new Recapitulatif();
            XmlDocument hypo = null;

            // Tree for Effectif
            treeData = new List<RecapitulatifTreeModel>();
            //TreeModelView hypTree = null;
            //hypTree = GetTree(collections, "projDipLMDHyp", scenario.isNational); //TODO: Maybe Insert Hyp into Database
            //BuildTree(treeData, seriesDict, hypTree.model, null);
            hypo = DOMUtili.getDocumentFromResourcePath(Path.Combine(rootPath, "projEffLMDHyp.xml"), true);
            recapForTree.Iter = 0;
            recapForTree.createTree(hypo.DocumentElement, treeData, seriesDict);
            result.EffectifLMD = treeData;

            // Tree for diplome
            recapForTree.Iter = 0;
            treeData = new List<RecapitulatifTreeModel>();
            hypo = DOMUtili.getDocumentFromResourcePath(Path.Combine(rootPath, "projDipLMDHyp.xml"), true);
            recapForTree.Iter = 0;
            recapForTree.createTree(hypo.DocumentElement, treeData, seriesDict);
            result.DiplomeLMD = treeData;
            
            // Execute only when scenario is national
            if(result.isNational)
            {
                treeData = new List<RecapitulatifTreeModel>();
                hypo = DOMUtili.getDocumentFromResourcePath(Path.Combine(rootPath, "projAcaLMDHyp.xml"), true);
                recapForTree.Iter = 0;
                recapForTree.createTree(hypo.DocumentElement, treeData, seriesDict);
                result.AccademieLMD = treeData;
            }

            // Fill other fields
            result.YearDebutEff = result.YearDebutDip = result.YearDebutAca = scenario.firstYears;
            result.YearEndEff = result.YearEndDip = result.YearEndAca = scenario.lastYears;
            result.YearEndCEff = result.YearEndCDip = result.YearEndCAca = scenario.lastYearsConstat;
            result.YearsEff = result.YearsDip = result.YearsAca = years;
            result.IndexLastYearEff = result.IndexLastYearDip = result.IndexLastYearAca = years.IndexOf(scenario.lastYearsConstat); // TODO: Maybe get this from scenario.LastYearsIndex so Insert it into Database
            result.Id = id;
            return result;
        }

        #region BuildTree
        public void createTree(XmlNode root, List<RecapitulatifTreeModel> treeData, Dictionary<string, List<double>> seriesDict)
        {
            int id = 1;
            Iter = 1;
            RecursvieAdd(root, treeData, seriesDict, 0, "recap", id);
        }
        private void RecursvieAdd(XmlNode root, List<RecapitulatifTreeModel> treeData, Dictionary<string, List<double>> seriesDict, int parentid, string parent, int id)
        {

            int boucle = 0;
            if (root.Name == "Var")
            {
                boucle = id;
                RecapitulatifTreeModel tree = new RecapitulatifTreeModel();
                tree.id = boucle;
                tree.parentid = parentid;
                tree.Name = root.Attributes["Label"].Value;
                tree.displayLabel = root.Attributes["DisplayLabel"].Value;
                tree.label = root.Attributes["Label"].Value;
                tree.Level = GetLevel(root);
                tree.parent = parent;
                if (root.Attributes["Type"] != null)
                {
                    tree.type = root.Attributes["Type"].Value;
                }
                if (root.Attributes["Display"] != null)
                {
                    tree.display = root.Attributes["Display"].Value;
                }

                // if (this.sdico.ContainsKey(tree.Name)) tree.Datas = new List<object>(this.sdico[tree.Name]);
                if (seriesDict.ContainsKey(tree.Name)) tree._data = seriesDict[tree.Name];

                tree.hasChild = root.HasChildNodes;
                tree.Child = root.ChildNodes.Count;
                treeData.Add(tree);
                Iter++;
            }
            foreach (XmlNode child in root.ChildNodes)
            {
                RecursvieAdd(child, treeData, seriesDict, boucle, root.Attributes["Label"].Value, Iter);
            }

        }
        public int GetLevel(XmlNode node)
        {
            int level = 0;
            while (null != (node = node.ParentNode))
                level++;
            return (level - 1);
        }
        #endregion BuildTree


        private static TreeModelView GetTree(IMongoCollection<Model_Trees> collections, string degre, Boolean isNational)
        {
            return  collections
                                .Aggregate()
                                .Match(c => c.Degres.Equals(degre) && c.Is_Easy == false && c.Is_National == isNational)
                                .Project(c => new
                                TreeModelView
                                {
                                    Id = c.Id,
                                    model = c.model
                                })
                                .FirstOrDefault();
        }

        public static Recapitulatif Create(List<Serie> _series, string academyId, string userId, string name, string idscenario)
        {
            Recapitulatif recap = new Recapitulatif();

            recap.Id = ObjectId.GenerateNewId().ToString();
            recap.Series = _series;
            recap.idacademie = academyId;
            recap.iduser = userId;
            recap.Name = name;
            recap.idscenario1 = idscenario;

            return recap;
        }

        public static List<Serie> ExecuteEngine(List<Serie> _series, string rootPath, int firstYear, int lastYear, Boolean shouldReplaceVar = false)
        {
            List<Serie> result = _series.ToList();
            string[] summaryFiles = new string[] { "projEff", "projDip", "projAca" };
            AcademyData acaYear = new AcademyData();
            VarData data = new VarData(acaYear.Year, acaYear.Year[acaYear.Year.Count - 1]);
            data.IsTabRecap = true;
            data.IsConstat = false;
            VarData.NbYears = lastYear - firstYear + 1;



            if (shouldReplaceVar)
            {
                // resultDict = Dict(result);
                var resultDict = GenUtils.SerieToDico(result);
                var cpDict = resultDict.ToDictionary(entry => entry.Key, entry => entry.Value);

                foreach (var serie in resultDict)
                {
                    string nSerie = serie.Key.Replace("_J_", "_IJ_1:9,");
                    if (nSerie.Equals(serie.Key) == false)
                    {
                        cpDict[nSerie] = serie.Value;
                    }
                }
                // For each serie
                // new serie = serie.variable.Replace("_IJ_1:9,", "_J_");
                // if newserie.variable.Equals(serie.variable) == false
                //resultDict[newserie.variable] = serie.values

                result = GenUtils.DicoToSerie(cpDict);
            }


            foreach (string summaryFile in summaryFiles)
            {
                XmlDocument hypo = DomUtils.getDocumentFromResourcePath(Path.Combine(rootPath, String.Format("{0}LMDHyp.xml", summaryFile)));
                XmlDocument model = DomUtils.getDocumentFromResourcePath(Path.Combine(rootPath, String.Format("{0}LMDModel.xml", summaryFile)));

                data.HtData = GenUtils.SerieToDico(result);

                Engine engine = new Engine(data);

                for(int i = 0; i < acaYear.Year.Count; i++)
                {
                    engine.RtCompute(hypo.DocumentElement);
                    engine.StaticCompute(model.DocumentElement);
                    engine.RtCompute(hypo.DocumentElement);
                }

                result = GenUtils.DicoToSerie(data.HtData);
                data.HtData = null;
            }

            VarData.NbYears = 30; // INFO: Reset NbYears

            return result;

        }

        public static long Insert(IMongoCollection<Recapitulatif> collections, Recapitulatif recap)
        {
            GridFSUtils<Recapitulatif, List<Serie>> gridFSUtils = new GridFSUtils<Recapitulatif, List<Serie>>(collections.Database, recap.Id, idField, serieIdField, "SerieId");

            var update = Builders<Recapitulatif>.Update.Set(x => x.idacademie, recap.idacademie).Set(x => x.iduser, recap.iduser).Set(x => x.Name, recap.Name).Set(x => x.idscenario1, recap.idscenario1);

            // Execute Engine

            return gridFSUtils.InsertOrUpdate(collections, recap.Series, update);
        }

        public static long Insert(IMongoCollection<Recapitulatif> collections, ScenarioViewModel scenario, string academyId, string userId, string name)
        {
            string id = ObjectId.GenerateNewId().ToString();
            GridFSUtils<Recapitulatif, List<Serie>> gridFSUtils = new GridFSUtils<Recapitulatif, List<Serie>>(collections.Database, id, idField, serieIdField, "SerieId");

            var update = Builders<Recapitulatif>.Update.Set(x => x.idacademie, academyId).Set(x => x.iduser, userId).Set(x => x.Name, name);

            // Execute Engine

            return gridFSUtils.InsertOrUpdate(collections, scenario.ht_data, update);
        }
        public static List<Recapitulatif> FindAll(IMongoCollection<Recapitulatif> collections)
        {
            return collections.Find(new BsonDocument()).ToList();
        }


        public static List<Recapitulatif> FindAll(IMongoCollection<Recapitulatif> collections, string _userId)
        {
            return collections.AsQueryable().Where(x => x.iduser.Equals(_userId) /* && x.idacademie == academyId */ && !x.Is_archive)
                    .Select(x => new Recapitulatif()
                    {
                        Id = x.Id,
                        Name = x.Name,
                    }).ToList();
        }

        public static Boolean Exists(IMongoCollection<Recapitulatif> collections, string _userId, string _recapName, string _academyId = null)
        {
            if(Find(collections, _userId, _recapName, _academyId) == null)
            {
                return false;
            }
            return true;
        }

        public static Recapitulatif Find(IMongoCollection<Recapitulatif> collections, string _userId, string _recapName, string _academyId= null)
        {
            Recapitulatif res;
            if(_academyId == null)
            {
                res = collections.AsQueryable().FirstOrDefault(x => x.iduser.Equals(_userId) /* && x.idacademie == academyId */ && x.Name.Equals(_recapName));
            } else
            {
                res = collections.AsQueryable().FirstOrDefault(x => x.iduser.Equals(_userId) && x.idacademie.Equals(_academyId) && x.Name.Equals(_recapName));
            }
            return res;
        }
        
        public static void Delete(IMongoCollection<Recapitulatif> collections, string _name)
        {
            //collections.FindOneAndDelete(x => x.Name.Equals(_name));
            GridFSUtils<Recapitulatif, List<Serie>> gridFSUtils = new GridFSUtils<Recapitulatif, List<Serie>>(collections.Database, _name, nameField, serieIdField, "SerieId");
            gridFSUtils.Delete(collections);
        }
    }
}
