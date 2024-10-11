using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Models
{
    public class Formule
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonElement("variable")]
        public string Variable { get; set; }
        [BsonElement("observation")]    
        public string FConstat { get; set; }
        [BsonElement("scenario")]
        public string FScenario { get; set; }
    }
}
