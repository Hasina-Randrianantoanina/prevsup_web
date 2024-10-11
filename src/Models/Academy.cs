using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Models
{
    public class Academy
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonElement("seq")]
        public object Seq { get; set; }
        [BsonElement("name")]
        public string Name { get; set; }
        [BsonElement("code")]
        public string Code { get; set; }
        [BsonElement("number")]
        public int Number { get; set; }
        [BsonElement("is_whole")]
        public bool Is_Whole { get; set; }

        public static List<Academy> FindAll(IMongoCollection<Academy> academys)
        {
            return academys.AsQueryable()
                    .Select(x => new Academy()
                    {
                        Id = x.Id,
                        Name = x.Name,
                        Code = x.Code,
                        Is_Whole = x.Is_Whole
                    }).OrderBy(x => x.Name).ToList();
            //return academys.Find(new BsonDocument()).ToList();
        }
    }
}
