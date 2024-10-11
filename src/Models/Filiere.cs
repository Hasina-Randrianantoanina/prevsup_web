using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Models
{
    public class Filiere
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonElement("idSector")]
        public int idfiliere { get; set; }
        [BsonElement("sectorName")]
        public string nomfiliere { get; set; }
        [BsonElement("description")]
        public string description { get; set; }
        [BsonElement("index")]
        public string indice { get; set; }
        [BsonElement("firstDegree")]
        public string premierdegre { get; set; }
        [BsonElement("lastDegree")]
        public string dernierdegre { get; set; }
        [BsonElement("highPriority")]
        public string hauteimportance { get; set; }
    }
}
