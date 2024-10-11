using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Models
{
    public class VariableName
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonElement("variable")]
        public string Variable { get; set; }
        [BsonElement("definition")]
        public string Definition { get; set; }
        [BsonElement("ij")]
        public string IJ { get; set; }
    }
}
