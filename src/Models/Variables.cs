using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Models
{
    public class Variables
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonElement("label")]
        public string Label { get; set; }
        [BsonElement("index")]
        public string Index { get; set; }
        [BsonElement("I")]
        public string I { get; set; }
        [BsonElement("J")]
        public string J { get; set; }
        [BsonElement("A")]
        public string A { get; set; }
        [BsonElement("level")]
        public string Niveau { get; set; }
        [BsonElement("degree")]
        public string Degre { get; set; }
        [BsonElement("subDegree")]
        public string SousDegre { get; set; }
        [BsonElement("variable")]
        public string Variable { get; set; }

    }
}
