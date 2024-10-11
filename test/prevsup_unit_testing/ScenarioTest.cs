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
using prevsup.ViewModel;

namespace prevsup_unit_testing
{
    public class ScenarioTest
    {
        private readonly ITestOutputHelper _outputHelper;
        private readonly IMongoCollection<Scenario> _scenarioCollection;
        private readonly IMongoCollection<Recapitulatif> _summaryCollection;

        public ScenarioTest(ITestOutputHelper testOutput)
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
                Observation = 0,
                Seq = 0,
                user = "615c1b8dde38e583f951ed35"
            };
            _scenarioCollection.InsertOne(scenario);

            // Act
            var result = Scenario.FindByName(_scenarioCollection, "testScenario", "615c1b8dde38e583f951ed35");

            // Assert
            Assert.NotNull(result);
            Assert.Equal(scenario.Id, result.Id);
            Assert.Equal(scenario.Name, result.Name);
            Assert.Equal(scenario.user, result.user);
            Assert.Equal(scenario.academy, result.academy);

            //Delete the created scenario for test
            _scenarioCollection.FindOneAndDelete(x => x.Id.Equals(scenario.Id));
        }

        [Fact]
        public void testInsertOrUpdate()
        {
            // Arrange
            var scenarioSeries = new ScenarioViewModel();
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
                Name = "testInsertScenario",
                Observation = 0,
                Seq = 0,
                user = "615c1b8dde38e583f951ed35"
            };

            // Act
            var addScenario = Scenario.InsertOrUpdate(_scenarioCollection,scenario, scenarioSeries.ht_data, null);

            // Assert
            var result = _scenarioCollection.Find(x => x.Id == scenario.Id).FirstOrDefault();
            Assert.NotNull(result);
            Assert.Equal(scenario.Id, result.Id);
            Assert.Equal(scenario.Name, result.Name);
            Assert.Equal(scenario.user, result.user);
            Assert.Equal(scenario.academy, result.academy);

            //Delete the created scenario for test
            _scenarioCollection.FindOneAndDelete(x => x.Id.Equals(scenario.Id));
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
                Observation = 2,
                Seq = 0,
                user = "615c1b8dde38e583f951ed35"
            };

            Scenario scenario2 = new Scenario
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
                Name = "testScenario2",
                Observation = 3,
                Seq = 1,
                user = "615c1b8dde38e583f951ed35"
            };


            Recapitulatif summary = new Recapitulatif
            {
                Id = ObjectId.GenerateNewId().ToString(),
                idscenario1 = scenario2.Id,
                iduser = scenario2.user,
                Name = "testRecap",

            };

            _scenarioCollection.InsertOne(scenario);
            _scenarioCollection.InsertOne(scenario2);
            _summaryCollection.InsertOne(summary);

            // Act
            var resultDeleteTrue = Scenario.Delete(_summaryCollection, _scenarioCollection, scenario.Id, scenario.Id);



            // Assert
            var findDeletedScenario = _scenarioCollection.Find(x => x.Id.Equals(scenario.Id)).FirstOrDefault();
            Assert.Null(findDeletedScenario);
            Assert.True(resultDeleteTrue);

            //Case scenario in relation with a summary 
            //Arrange

            //Act
            var resultDeleteFalse = Scenario.Delete(_summaryCollection, _scenarioCollection, scenario2.Id, scenario2.Id);
            // Assert
            var findDeletedScenarioFalse = _scenarioCollection.Find(x => x.Id.Equals(scenario2.Id)).FirstOrDefault();
            Assert.NotNull(findDeletedScenarioFalse);
            Assert.False(resultDeleteFalse);
            //Delete the created scenario for test
            _summaryCollection.FindOneAndDelete(x => x.Id.Equals(summary.Id));
            _scenarioCollection.FindOneAndDelete(x => x.Id.Equals(scenario2.Id));
        }
    }
}
