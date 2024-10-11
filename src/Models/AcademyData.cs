using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using prevsup.Utils;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace prevsup.Models
{
    public class AcademyData
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonElement("academy")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Academy { get; set; }
        [BsonElement("aca")]
        public string Aca { get; set; }
        [BsonElement("year")]
        public List<string> Year { get
            {
                return ImportedYear.FindAll(dbContext.CImportedYear); // TODO: dbcontext should be passed as parameter
            } }
        [BsonElement("series")]
        public List<Serie> Series { get; set; }
        [BsonElement("is_calculed")]
        public bool IsCalculed { get; set; }

        public bool IsModified { get; set; }

        // Kaky - 16/06/2022 - Pour stocker l'id du fichier dans MongoDB
        [BsonElement("serie_id")]
        public string SerieId { get; set; }
        // TODO: Cette propriété n'est là que pour vider les données stocker d'avant (à supprimer plus tard)
        public byte[] series2 { get; set; }

        private static FieldDefinition<AcademyData, string> serieIdField = "SerieId";
        private static FieldDefinition<AcademyData, string> idField = "aca";

        /// <summary>
        /// Utilisation de GridFS pour stocker les fichiers
        /// </summary>
        /// <param name="collections"></param>
        /// <param name="_aca"></param>
        /// <param name="series"></param>
        /// <param name="years"></param>
        /// <returns></returns>
        public long InsertOrUpdate(IMongoCollection<AcademyData> collections, string _aca, Dictionary<string, List<double>> series, List<string> years)
        {
            GridFSUtils<AcademyData, List<Serie>> gridFSUtils = new GridFSUtils<AcademyData, List<Serie>>(collections.Database, _aca, idField, serieIdField, "SerieId");
            List<Serie> fileSeries = DicoToSerie(series);

            var update = Builders<AcademyData>.Update.Set(x => x.Series, null).Set(x => x.Year, years).Set(x => x.series2, null);

            return gridFSUtils.InsertOrUpdate(collections, fileSeries, update);
        }

        /// <summary>
        /// Utilisation de GridFS pour stocker les fichiers
        /// </summary>
        /// <param name="collections"></param>
        /// <param name="_aca"></param>
        /// <param name="series"></param>
        /// <returns></returns>
        public long InsertOrUpdate(IMongoCollection<AcademyData> collections, string _aca, Dictionary<string, List<double>> series)
        {
            if (_aca.Contains("SSR"))
            {
                _aca = int.Parse(_aca.Substring(3)).ToString();
            }
            GridFSUtils<AcademyData, List<Serie>> gridFSUtils = new GridFSUtils<AcademyData, List<Serie>>(collections.Database, _aca, idField, serieIdField, "SerieId");
            List<Serie> fileSeries = GenUtils.DicoToSerie(series);

            return gridFSUtils.InsertOrUpdate(collections, fileSeries, null);
        }

        public static List<Academy> FindAllAca(IMongoCollection<AcademyData> collections, IMongoCollection<Academy> academiesCollect)
        {
            //TODO: Change .Aca to .Name
            var allAcademyDatas = collections.AsQueryable()
                    .Select(x => new Academy()
                    {
                        Id = x.Id,
                        Code ="SSR" + x.Aca
                    }).ToList();
            //Création nouvelle liste pour prendre en compte les SSR moins de 10
            var allAcademyDataConversion=new List<Academy>();
            foreach (var academyData in allAcademyDatas)
            {
                String[] splitVar = academyData.Code.Split('R');
                if (Int32.Parse(splitVar[1]) < 10)
                {
                    allAcademyDataConversion.Add(new Academy() { Id = academyData.Id, Code = "SSR0" + splitVar[1] });
                }
                else
                {
                    allAcademyDataConversion.Add(new Academy() { Id = academyData.Id, Code = academyData.Code });
                }

            }
            var allAcademies = Models.Academy.FindAll(academiesCollect);
            var joins = from academyData in allAcademyDataConversion
                        join academy in allAcademies on academyData.Code equals academy.Code
                        select new Academy()
                        {
                            Id = academyData.Id,
                            Name = academy.Name,
                            Is_Whole = academy.Is_Whole
                        };
            return joins.ToList();
        }

        public static AcademyData FindById(IMongoCollection<AcademyData> collections, string _id)
        {
            var found = collections.Find(x => x.Id.Equals(_id)).FirstOrDefault(); //TODO: not using x.Academy anymore
            if (found == null) throw new Exception("Cette académie n'existe pas");

            return FindByAca(collections, found.Aca);
        }

        public static AcademyData FindByAca(IMongoCollection<AcademyData> collections, string _aca)
        {
            if (_aca.Contains("SSR"))
            {
                _aca = int.Parse(_aca.Substring(3)).ToString();
            }
            GridFSUtils<AcademyData, List<Serie>> gridFSUtils = new GridFSUtils<AcademyData, List<Serie>>(collections.Database, _aca, idField, serieIdField, "SerieId");
            AcademyData foundAca = gridFSUtils.Find(collections, "Series");

            if (foundAca == null) throw new Exception("Cette académie n'existe pas");
            //if (foundAca == null) return null;

            if (foundAca.Series == null)
            {
                foundAca.Series = new List<Serie>();
            }

            return foundAca;
        }



        public static List<AcademyData> FindAll(IMongoCollection<AcademyData> collections)
        {
            return collections.Find(new BsonDocument()).ToList();
        }

        List<Serie> DicoToSerie(Dictionary<string, List<double>> dico)
        {
            List<Serie> series = new List<Serie>();
            foreach (var item in dico)
            {
                if (item.Key.StartsWith("temp")) continue;
                series.Add(new Serie() { Variable = item.Key, Values = item.Value });
            }
            return series;
        }
        
        
    }
}
