using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using prevsup.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace prevsup_unit_testing
{
    internal class Database
    {
        public IMongoDatabase database { get; set; }
        public Database() {
            //get the parameter in appsettings
            var configuration = new ConfigurationBuilder().AddJsonFile("testingsettings.json").Build();
            string db = (String.IsNullOrEmpty(configuration["dbUsername"]) && String.IsNullOrEmpty(configuration["dbPassword"])) ?
                    configuration["dbServerIP"] + ":" + configuration["dbPort"] :
                    configuration["dbUsername"] + ":" + configuration["dbPassword"] + "@" + configuration["dbServerIP"] + ":" + configuration["dbPort"];



            //localtest
            //var client = new MongoClient("mongodb://localhost:27017");

            //VM test
            var client = new MongoClient("mongodb://"+ db);
            database= client.GetDatabase("prevsup_test");
        }
    }
}
