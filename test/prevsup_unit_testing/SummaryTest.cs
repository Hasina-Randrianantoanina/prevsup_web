using MongoDB.Bson;
using MongoDB.Driver;
using prevsup.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit.Abstractions;
using Xunit;

namespace prevsup_unit_testing
{
    public class SummaryTest
    {
        private readonly ITestOutputHelper _outputHelper;
        private readonly IMongoCollection<Scenario> _scenarioCollection;
        private readonly IMongoCollection<Recapitulatif> _summaryCollection;

        public SummaryTest(ITestOutputHelper testOutput)
        {
            Database db = new Database();
            _summaryCollection = db.database.GetCollection<Recapitulatif>("summary");
            _scenarioCollection = db.database.GetCollection<Scenario>("scenario");
            _outputHelper = testOutput;
        }


        [Fact]
        public void testFindByName()
        {
            // Arrange
            Scenario scenario = new Scenario
            {
                Id = ObjectId.GenerateNewId().ToString(),
                academy = "62e271d189c840d1300b4c0c",
                First_year = 2010,
                isAcademy = false,
                Is_calculed = false,
                isEasy = false,
                isNational = true,
                Last_year = 2023,
                Last_year_constat = 2021,
                Name = "testScenario",
                Observation = 6,
                Seq = 0,
                user = "615c1b8dde38e583f951ed35"
            };

            Recapitulatif summary = new Recapitulatif
            {
                Id = ObjectId.GenerateNewId().ToString(),
                idscenario1 = scenario.Id,
                iduser = scenario.user,
                Name = "testRecap1",

            };
            _summaryCollection.InsertOne(summary);

            // Act
            var result = Recapitulatif.Find(_summaryCollection, summary.iduser, summary.Name);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(summary.Id, result.Id);
            Assert.Equal(summary.Name, result.Name);
            Assert.Equal(summary.iduser, result.iduser);

            //Delete the created summary for test
            _summaryCollection.FindOneAndDelete(x => x.Id.Equals(summary.Id));
        }

        [Fact]
        public void testDelete()
        {
            // Arrange

            Scenario scenario = new Scenario
            {
                Id = ObjectId.GenerateNewId().ToString(),
                academy = "62e271d189c840d1300b4c0c",
                First_year = 2010,
                isAcademy = false,
                Is_calculed = false,
                isEasy = false,
                isNational = true,
                Last_year = 2023,
                Last_year_constat = 2021,
                Name = "testScenario",
                Observation = 5,
                Seq = 0,
                user = "615c1b8dde38e583f951ed35"
            };

            Recapitulatif summary = new Recapitulatif
            {
                Id = ObjectId.GenerateNewId().ToString(),
                idscenario1 = scenario.Id,
                iduser = scenario.user,
                Name = "testRecap2",

            };

            _summaryCollection.InsertOne(summary);

            // Act
            Recapitulatif.Delete(_summaryCollection, summary.Name);

            // Assert
            var findDeletedSummary = _summaryCollection.Find(x => x.Id.Equals(summary.Id)).FirstOrDefault();
            Assert.Null(findDeletedSummary);

        }

        [Fact]
        public void testInsert()
        {
            // Arrange

            Scenario scenario = new Scenario
            {
                Id = ObjectId.GenerateNewId().ToString(),
                academy = "62e271d189c840d1300b4c0c",
                First_year = 2010,
                isAcademy = false,
                Is_calculed = false,
                isEasy = false,
                isNational = true,
                Last_year = 2023,
                Last_year_constat = 2021,
                Name = "testScenario",
                Observation = 7,
                Seq = 0,
                user = "615c1b8dde38e583f951ed35"
            };

            Recapitulatif summary = new Recapitulatif
            {
                Id = ObjectId.GenerateNewId().ToString(),
                idscenario1 = scenario.Id,
                iduser = scenario.user,
                Name = "testRecapInsert",

            };
           

            // Act
            var result = Recapitulatif.Insert(_summaryCollection, summary);

            // Assert
            var findSummary= _summaryCollection.Find(x => x.Id.Equals(summary.Id)).FirstOrDefault();
            Assert.NotNull(result);
            Assert.NotNull(findSummary);
            Assert.Equal(findSummary.Name, summary.Name);
            Assert.Equal(findSummary.iduser,summary.iduser);

            //delete the data for test
            _summaryCollection.FindOneAndDelete(x => x.Id.Equals(summary.Id));

        }

        [Fact]
        public void testExists()
        {
            // Arrange

            Scenario scenario = new Scenario
            {
                Id = ObjectId.GenerateNewId().ToString(),
                academy = "62e271d189c840d1300b4c0c",
                First_year = 2010,
                isAcademy = false,
                Is_calculed = false,
                isEasy = false,
                isNational = true,
                Last_year = 2023,
                Last_year_constat = 2021,
                Name = "testScenario",
                Observation = 5,
                Seq = 0,
                user = "615c1b8dde38e583f951ed35"
            };

            Recapitulatif summary = new Recapitulatif
            {
                Id = ObjectId.GenerateNewId().ToString(),
                idscenario1 = scenario.Id,
                iduser = scenario.user,
                Name = "testRecapExist",

            };
            Recapitulatif summary2 = new Recapitulatif
            {
                Id = ObjectId.GenerateNewId().ToString(),
                idscenario1 = scenario.Id,
                iduser = scenario.user,
                Name = "testRecapExist2",

            };

            _summaryCollection.InsertOne(summary);

            // Act
            var resultTrue = Recapitulatif.Exists(_summaryCollection, summary.iduser, summary.Name);
            var resultFalse = Recapitulatif.Exists(_summaryCollection, summary2.iduser, summary2.Name);

            // Assert

            Assert.True(resultTrue);
            Assert.False(resultFalse);

            //delete the data for test
            _summaryCollection.FindOneAndDelete(x => x.Id.Equals(summary.Id));

        }
    }
}
