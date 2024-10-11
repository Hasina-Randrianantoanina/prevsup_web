using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Models
{
    public class Model_Trees
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonElement("degrees")]
        public string Degres { get; set; }
        [BsonElement("order_hyp")]
        public string[] Order_Hyp { get; set; }
        [BsonElement("order_res")]
        public string[] Order_Res { get; set; }
        [BsonElement("is_academy")]
        public bool Is_Academy { get; set; }
        [BsonElement("is_national")]
        public bool Is_National { get; set; }
        [BsonElement("is_easy")]
        public bool Is_Easy { get; set; }
        [BsonElement("model")]
        public List<model> model { get; set; }
        [BsonElement("create_at")]
        public DateTime Create_At { get; set; }
        [BsonElement("version")]
        public int Version { get; set; }
        [BsonElement("haschild")]
        public Boolean HasChild { get; set; }


    }

    public class model
    {
        public int Id { get; set; }
        [BsonElement("id")]
        public string Idm { get; set; }
        [BsonElement("parentId")]
        public string ParentId { get; set; }
        [BsonElement("displayLabel")]
        public string DisplayLabel { get; set; }
        [BsonElement("haschild")]
        public Boolean HasChild { get; set; }
        [BsonElement("level_xml")]
        public int LevelXML { get; set; }
        public int Level { get; set; }
        [BsonElement("type")]
        public string Type { get; set; }
        [BsonElement("display")]
        public string Display { get; set; }

        public override int GetHashCode()
        {
            return System.HashCode.Combine(Idm.GetHashCode(), ParentId.GetHashCode(), DisplayLabel.GetHashCode());
        }

        public override bool Equals(object obj)
        {
            if(obj is model)
            {
                model other = (model)obj;
                if (other.Idm != null && other.ParentId != null && other.DisplayLabel != null
                    && Idm != null && ParentId != null && DisplayLabel != null) return (Idm.Equals(other.Idm) && ParentId.Equals(other.ParentId) &&
                        DisplayLabel.Equals(other.DisplayLabel));
                return false;
            }
            return base.Equals(obj);
        }
    }
}
