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
    public class Constat
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
        [BsonElement("documentation")]
        public string Documentation { get; set; }
        [BsonElement("first_year")]
        public int First_year { get; set; }
        [BsonElement("last_year")]
        public int Last_year { get; set; }
        [BsonElement("name")]
        public string Name { get; set; }
        [BsonElement("series")]
        public List<Serie> series { get; set; }
        [BsonElement("series2")]
        public byte[] series2 { get; set; }
        [BsonElement("is_calculed")]
        public bool Is_calculed { get; set; }
        [BsonElement("is_archive")]
        public bool Is_archive{ get; set; }
        [BsonElement("is_easy")]
        public bool isEasy{ get; set; }
        [BsonElement("is_national")]
        public bool isNational{ get; set; }
        [BsonElement("is_academy")]
        public bool isAcademy{ get; set; }
        // Kaky - 16/06/2022 - Pour stocker l'id du fichier dans MongoDB
        [BsonElement("serie_id")]
        public string SerieId { get; set; }

        private static FieldDefinition<Constat, string> serieIdField = "SerieId";
        private static FieldDefinition<Constat, string> idField = "Id";

        public ConstatViewModel CopyToViewModel()
        {
            ConstatViewModel constatModel = new ConstatViewModel();
            constatModel.Id = this.Id;
            constatModel.Seq = this.Seq;
            constatModel.First_year = this.First_year;
            constatModel.series = this.series;
            constatModel.Last_year = this.Last_year;
            constatModel.Name = this.Name;
            constatModel.User = this.user;
            constatModel.Academy = this.academy;

            constatModel.isEasy = this.isEasy;
            constatModel.isNational = this.isNational;
            constatModel.isAcademy = this.isAcademy;
            
            return constatModel;
        }

        public static List<Constat> FindAll(IMongoCollection<Constat> collections)
        {
            return collections.Find(new BsonDocument()).ToList();
        }

        public static Constat FindByName(IMongoCollection<Constat> collections, string name, string userId)
        {
            return collections.Find(x => x.Name.Equals(name) && x.user.Equals(userId)).FirstOrDefault();
        }

        public static Boolean Delete(IMongoCollection<Constat> collectionsConst, IMongoCollection<Scenario> collectionsScen, string _id, int seq)
        {
           
            var scen = collectionsScen.AsQueryable().Where(x => x.Observation == seq).Count();

            if (scen > 0) return false;
            GridFSUtils<Constat, List<Serie>> gridFSUtils = new GridFSUtils<Constat, List<Serie>>(collectionsConst.Database, _id, idField, serieIdField, "SerieId");
            gridFSUtils.Delete(collectionsConst);
            //var result = collectionsConst.DeleteOne(x => x.Id.Equals(_id));
            //if (result.DeletedCount <= 0) return false;

            return true;
        }

        public static string GetIdByObs(IMongoCollection<Constat> collections, int _obs, string sceneName)
        {
            string idConst = collections.AsQueryable().Where(c => c.Seq == _obs).Select(c => c.Id).FirstOrDefault();
            // Gestion constat vide
            if (string.IsNullOrEmpty(idConst)) throw new Exception("Constat rattaché au scénario [" + sceneName + "] introuvable !");
            return idConst;
        }

        public static ConstatViewModel FindVMById(IMongoCollection<Constat> collections, string _id)
        {
            var res = collections
                           .Aggregate()
                           .Match(c => c.Id.Equals(_id))
                           .Project(c => new ConstatViewModel
                           {
                               Id = c.Id,
                               Name = c.Name,
                               Seq = c.Seq,
                               Academy = c.academy,
                               User = c.user,
                               series = c.series,
                               series2 = c.series2,
                               First_year = c.First_year,
                               Last_year = c.Last_year,
                               isEasy = c.isEasy,
                               isNational = c.isNational,
                               isAcademy = c.isAcademy,
                               SerieId = c.SerieId
                           })
                           .FirstOrDefault();
           
            GridFSUtils<Constat, List<Serie>> gridFSUtils = new GridFSUtils<Constat, List<Serie>>(collections.Database, _id, idField, serieIdField, "SerieId");
            Constat foundConst = gridFSUtils.Find(collections, "series");
            if (foundConst == null) throw new Exception("Ce Constat est trouvable");
            res.series = foundConst.series;

            return res;
        }
        
        public static Constat CastToConstat(ConstatViewModel c)
        {
            return new Constat
            {
                Id = c.Id,
                Name = c.Name,
                Seq = c.Seq,
                academy = c.Academy,
                user = c.User,
                series = c.series,
                series2 = c.series2,
                First_year = c.First_year,
                Last_year = c.Last_year,
                isEasy = c.isEasy,
                isNational = c.isNational,
                isAcademy = c.isAcademy,
                SerieId = c.SerieId
            };
        }
        
        // Kaky - 28/06/2022 -  Utilisation de GridFS pour stocker les series
        public static long InsertOrUpdate(IMongoCollection<Constat> collections, List<Serie> series, Constat nConst)
        {
            GridFSUtils<Constat, List<Serie>> gridFSUtils = new GridFSUtils<Constat, List<Serie>>(collections.Database, nConst.Id, idField, serieIdField, "SerieId");

            var update = Builders<Constat>.Update
                .Set(x => x.series, null)
                .Set(x => x.series2, null)
                .Set(x => x.Seq, nConst.Seq)
                .Set(x => x.academy, nConst.academy)
                .Set(x => x.user, nConst.user)
                .Set(x => x.Documentation, nConst.Documentation)
                .Set(x => x.First_year, nConst.First_year)
                .Set(x => x.Last_year, nConst.Last_year)
                .Set(x => x.Name, nConst.Name)
                .Set(x => x.Id, nConst.Id)
                .Set(x => x.Is_calculed, nConst.Is_calculed)
                .Set(x => x.Is_archive, nConst.Is_archive)
                .Set(x => x.isEasy, nConst.isEasy)
                .Set(x => x.isNational, nConst.isNational)
                .Set(x => x.isAcademy, nConst.isAcademy);
            
            return gridFSUtils.InsertOrUpdate(collections, series, update);
        }


    }

    public class Serie : ICloneable
    {
        public List<double> Values { get; set; }
        public string Variable { get; set; }
      
        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}

