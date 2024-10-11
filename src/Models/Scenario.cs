using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using prevsup.Utils;
using prevsup.ViewModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Models
{
    public class Scenario
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonElement("seq")]
        public int Seq { get; set; }

        [BsonElement("academy")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string academy { get; set; }
        [BsonElement("user")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string user { get; set; }
        [BsonElement("observation")]
        public int Observation { get; set; }
        [BsonElement("documentation")]
        public string Documentation { get; set; }
        [BsonElement("is_calculed")]
        public bool Is_calculed { get; set; }
        [BsonElement("first_year")]
        public int First_year { get; set; }
        [BsonElement("last_year")]
        public int Last_year { get; set; }
        [BsonElement("last_year_observation")]
        public int Last_year_constat { get; set; }
        [BsonElement("name")]
        public string Name { get; set; }
        [BsonElement("series")]
        public List<Serie> series { get; set; }
        [BsonElement("series2")]
        public byte[] series2 { get; set; }
        [BsonElement("is_pepcs")]
        public bool Is_pepcs { get; set; }
        [BsonElement("is_archive")]
        public bool Is_archive { get; set; }
        [BsonElement("last_degree")]
        public int Last_Degree { get; set; }
        [BsonElement("last_degree_modif")]
        public int Last_Degree_Modif { get; set; }
        [BsonElement("degrees_modified")]
        public bool[] degres_modifies { get; set; }


        [BsonElement("is_easy")]
        public bool isEasy { get; set; }
        [BsonElement("is_national")]
        public bool isNational { get; set; }
        [BsonElement("is_academy")]
        public bool isAcademy { get; set; }

        // Kaky - 16/06/2022 - Pour stocker l'id du fichier dans MongoDB
        [BsonElement("serie_id")]
        public string SerieId { get; set; }

        private static FieldDefinition<Scenario, string> serieIdField = "SerieId";
        private static FieldDefinition<Scenario, string> idField = "Id";

        public static Scenario CastToScenario(ScenarioViewModel scenario)
        {
            return new Scenario
            {
                Name = scenario.Name,
                academy = scenario.Academy,
                user = scenario.User,
                First_year = scenario.firstYears,
                Last_year = scenario.lastYears,
                Observation = scenario.observation,
                Last_Degree = scenario.Last_Degree,
                Id = ObjectId.GenerateNewId().ToString(),
                isEasy = scenario.isEasy,
                isNational = scenario.isNational,
                Seq = ScenarioUtils.GetLastSeq(),
                isAcademy = scenario.isAcademy,
                Last_year_constat = scenario.lastYearsConstat,
            };
        }

        public static List<Scenario> FindAll(IMongoCollection<Scenario> collections)
        {
            return collections.Find(new BsonDocument()).ToList();
        }

        public static Scenario FindByName(IMongoCollection<Scenario> collections, string name, string userId)
        {
            return collections.Find(x => x.Name.Equals(name) && x.user.Equals(userId)).FirstOrDefault();
        }

        public static Boolean Delete(IMongoCollection<Recapitulatif> collectionsRecap, IMongoCollection<Scenario> collectionsScen, string _idScen, string _id)
        {
            var recap = collectionsRecap.AsQueryable().Where(x => x.idscenario1.Equals(_idScen)).Count();

            if (recap > 0) return false;

            GridFSUtils<Scenario, List<Serie>> gridFSUtils = new GridFSUtils<Scenario, List<Serie>>(collectionsScen.Database, _id, idField, serieIdField, "SerieId");
            gridFSUtils.Delete(collectionsScen);
            //var result = collectionsScen.DeleteOne(x => x.Id.Equals(_id));
            //if (result.DeletedCount <= 0) return false;

            return true;
        }

        public static ScenarioViewModel FindVMById(IMongoCollection<Scenario> collections, IMongoCollection<Constat> collectionsConst, string id)
        {
            var res = collections
                           .Aggregate()
                           .Match(c => c.Id.Equals(id))
                           .Project(c => new ScenarioViewModel
                           {
                               Id = c.Id,
                               Name = c.Name,
                               User = c.user,
                               Academy = c.academy,
                               seq = c.Seq,
                               ht_data = c.series,
                               series2 = c.series2,
                               observation = c.Observation,
                               firstYears = c.First_year,
                               lastYears = c.Last_year,
                               Last_Degree = c.Last_Degree,
                               isEasy = c.isEasy,
                               isNational = c.isNational,
                               isAcademy = c.isAcademy,
                               degres_modifies = c.degres_modifies
                           })
                           .FirstOrDefault();

            var lastYear = collectionsConst.AsQueryable().Where(c => c.Seq == res.observation).Select(c => c.Last_year).FirstOrDefault();
            res.lastYearsConstat = lastYear;
            
            if (res.isAcademy && res.Last_Degree == 8) res.Last_Degree = 7;

            GridFSUtils<Scenario, List<Serie>> gridFSUtils = new GridFSUtils<Scenario, List<Serie>>(collections.Database, id, idField, serieIdField, "SerieId");
            Scenario foundScenario = gridFSUtils.Find(collections, "series");
            if (foundScenario == null) throw new Exception("Ce scénario n'existe pas.");
            res.ht_data = foundScenario.series;
            return res;
        }

        public static long Update(IMongoCollection<Scenario> collections, string _id, bool[] degrees_modif)
        {
            var filter = Builders<Scenario>.Filter.Eq(x => x.Id, _id);
            var update = Builders<Scenario>.Update.Set(x => x.degres_modifies, degrees_modif);

            var result = collections.UpdateOne(filter, update);
            return result.ModifiedCount;
        }
        public static string UpdateScenarioName(IMongoCollection<Scenario> collections, string _id, string name)
        {
            var filter = Builders<Scenario>.Filter.Eq(x => x.Id, _id);
            var update = Builders<Scenario>.Update.Set(x => x.Name, name);

            var result = collections.UpdateOne(filter, update);
            return name;
        }

        public static long Update(IMongoCollection<Scenario> collections, string _id, List<Serie> ht_data)
        {
            GridFSUtils<Scenario, List<Serie>> gridFSUtils = new GridFSUtils<Scenario, List<Serie>>(collections.Database, _id, idField, serieIdField, "SerieId");

            var update = Builders<Scenario>.Update.Set(x => x.series2, null);

            return gridFSUtils.InsertOrUpdate(collections, ht_data, update);
        }

        public static long Update(IMongoCollection<Scenario> collections, string _id, List<Serie> ht_data, int last_degrees)
        {
            GridFSUtils<Scenario, List<Serie>> gridFSUtils = new GridFSUtils<Scenario, List<Serie>>(collections.Database, _id, idField, serieIdField, "SerieId");

            var update = Builders<Scenario>.Update
                .Set(x => x.Last_Degree, last_degrees);

            return gridFSUtils.InsertOrUpdate(collections, ht_data, update);
        }

        public static long Update(IMongoCollection<Scenario> collections, string _id, List<Serie> ht_data, int last_degrees, bool[] degrees_modif)
        {
            GridFSUtils<Scenario, List<Serie>> gridFSUtils = new GridFSUtils<Scenario, List<Serie>>(collections.Database, _id, idField, serieIdField, "SerieId");

            var update = Builders<Scenario>.Update
                .Set(x => x.Last_Degree, last_degrees)
                .Set(x => x.degres_modifies, degrees_modif);

            return gridFSUtils.InsertOrUpdate(collections, ht_data, update);
        }

        public static long InsertOrUpdate(IMongoCollection<Scenario> collections, Scenario nScenario, List<Serie> ht_data, bool[] degres_modifies = null)
        {
            GridFSUtils<Scenario, List<Serie>> gridFSUtils = new GridFSUtils<Scenario, List<Serie>>(collections.Database, nScenario.Id, idField, serieIdField, "SerieId");
            // INFO: Ce code a entrainé un bug lors de ReconduireVariables

            //int nbrScenario = nScenario.Last_year - lastYearsConstat;
            //int tabScenario = nScenario.Last_year - nScenario.First_year;
            //int skip = tabScenario - nbrScenario;
            //List<Serie> series = new List<Serie>(ht_data.Select(v => new Serie() { Variable = v.Variable, Values = v.Values.Skip(skip + 1).ToList() }));

            if(degres_modifies == null)
            {
                degres_modifies = new bool[9];
                for (int iD = 0; iD < degres_modifies.Length; iD++) degres_modifies[iD] = false;
            }
            

            var update = Builders<Scenario>.Update
                .Set(x => x.Name, nScenario.Name)
                .Set(x => x.academy, nScenario.academy)
                .Set(x => x.user, nScenario.user)
                .Set(x => x.First_year, nScenario.First_year)
                .Set(x => x.Last_year, nScenario.Last_year)
                .Set(x => x.Observation, nScenario.Observation)
                .Set(x => x.Last_Degree, nScenario.Last_Degree)
                .Set(x => x.Id, nScenario.Id)
                .Set(x => x.isEasy, nScenario.isEasy)
                .Set(x => x.isNational, nScenario.isNational)
                .Set(x => x.Seq, nScenario.Seq)
                .Set(x => x.isAcademy, nScenario.isAcademy)
                .Set(x => x.degres_modifies, degres_modifies);
           

            return gridFSUtils.InsertOrUpdate(collections, ht_data, update);
        }
    }
}
