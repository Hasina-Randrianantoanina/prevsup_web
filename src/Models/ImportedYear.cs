using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using System.Collections.Generic;

namespace prevsup.Models
{
    public class ImportedYear
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("year")]
        string Year;

        public static List<string> FindAll(IMongoCollection<ImportedYear> collections)
        {
            List<ImportedYear> foundYears = collections.Find(new BsonDocument()).ToList();
            List<string> result = new List<string>();
            foreach (ImportedYear year in foundYears) result.Add(year.Year);

            return result;
        }
        public static List<ImportedYear> FindAllImportedYears(IMongoCollection<ImportedYear> collections)
        {
            List<ImportedYear> foundYears = collections.Find(new BsonDocument()).ToList();

            return foundYears;
        }

        public static void Insert(IMongoCollection<ImportedYear> collections, string year)
        {
            List<string> allYears = FindAll(collections);
            if(allYears.Contains(year) == false)
            {
                ImportedYear newYear = new ImportedYear();
                newYear.Year = year;
                collections.InsertOne(newYear);
            }
        }
       

    }
}
