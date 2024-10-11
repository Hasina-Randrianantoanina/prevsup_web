using MongoDB.Bson;
using MongoDB.Driver;
using prevsup.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Utils
{
    public static class UPonderation
    {
        public static Dictionary<string, string> Ponderation = new Dictionary<string, string>();
        public static Dictionary<string, string> PonderationAca = new Dictionary<string, string>();

        public static void InitPonderation()
        {
            dbContext.InitPonderation();
            dbContext.InitPonderationAca();

            var pond = dbContext.CPonderation.Find(new BsonDocument()).ToList();
            var pondAca = dbContext.CPonderationAca.Find(new BsonDocument()).ToList();

            foreach (var item in pond)
            {
                if (!Ponderation.ContainsKey(item.Variable)) Ponderation.Add(item.Variable, item.ponderation);
            }

            foreach (var item in pondAca)
            {
                if (!PonderationAca.ContainsKey(item.Variable)) PonderationAca.Add(item.Variable, item.ponderation);
            }

        }
    }
}
