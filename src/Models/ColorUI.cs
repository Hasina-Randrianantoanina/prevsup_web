using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Models
{
    public class ColorUI
    {
        [BsonElement("separator")]
        public string separator { get; set; }
        public string back { get; set; }

        [BsonElement("calcBack")]
        public string calcback { get; set; }

        [BsonElement("observationData")]
        public string constatdata { get; set; }

        [BsonElement("calcObservation")]
        public string calcconst { get; set; }

        [BsonElement("calcScen")]
        public string calcscen { get; set; }

        [BsonElement("scenBack")]
        public string scenback { get; set; }

        [BsonElement("scenData")]
        public string scendata { get; set; }
        public string active { get; set; }
    }

}
