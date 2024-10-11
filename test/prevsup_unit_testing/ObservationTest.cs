using MongoDB.Bson;
using MongoDB.Driver;
using prevsup.Models;
using prevsup.Utils;
using prevsup.ViewModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace prevsup_unit_testing
{
    public class ObservationTest
    {
        private readonly IMongoCollection<Constat> _observationCollection;
        private readonly ITestOutputHelper _outputHelper;
        private readonly IMongoCollection<Scenario> _scenarioCollection;

        public ObservationTest(ITestOutputHelper testOutput)
        {
            Database db = new Database();
            _observationCollection = db.database.GetCollection<Constat>("observation");
            _scenarioCollection = db.database.GetCollection<Scenario>("scenario");
            _outputHelper = testOutput;
        }

        [Fact]
        public void testInsertOrUpdate()
        {
            // Arrange
            var constatSeries = new ConstatViewModel();
            Constat observation = new Constat
            {
                Id = ObjectId.GenerateNewId().ToString(),
                academy = "62e271d189c840d1300b4c0c",
                First_year = 2010,
                isAcademy = false,
                Is_archive = false,
                Is_calculed = false,
                isEasy = false,
                isNational = true,
                Last_year = 2021,
                Name = "testInsertConstat",
                user = "615c1b8dde38e583f951ed35"
            };

            // Act
            var addConstat = Constat.InsertOrUpdate(_observationCollection,constatSeries.series,observation);

            // Assert
            var result = _observationCollection.Find(x => x.Id==observation.Id).FirstOrDefault();
            Assert.NotNull(result);
            Assert.Equal(observation.Id, result.Id);
            Assert.Equal(observation.Name, result.Name);
            Assert.Equal(observation.user, result.user);
            Assert.Equal(observation.academy, result.academy);

            //Delete the created observation for test
            _observationCollection.FindOneAndDelete(x => x.Id.Equals(observation.Id));
        }


        [Fact]
        public void testFindByName()
        {
            // Arrange
            //GridFSUtils<Constat, List<Serie>> gridFSUtils = new GridFSUtils<Constat, List<Serie>>(_observationCollection.Database, nConst.Id, Constat.idField, serieIdField, "SerieId");
            Constat observation = new Constat { Id = ObjectId.GenerateNewId().ToString(), academy = "62e271d189c840d1300b4c0c",
                First_year=2010,
                isAcademy = false, Is_archive = false,Is_calculed=false, isEasy=false, isNational=true,
                Last_year=2021 , Name = "testConstat", user= "615c1b8dde38e583f951ed35"
            };
            _observationCollection.InsertOne(observation);

            // Act
            var result = Constat.FindByName(_observationCollection,"testConstat", "615c1b8dde38e583f951ed35") ;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(observation.Id, result.Id);
            Assert.Equal(observation.Name, result.Name);
            Assert.Equal(observation.user, result.user);
            Assert.Equal(observation.academy, result.academy);

            //Delete the created observation for test
            _observationCollection.FindOneAndDelete(x => x.Id.Equals(observation.Id));
        }

        [Fact]
        public void testDelete()
        {
            // Arrange
            Constat observation = new Constat
            {
                Id = ObjectId.GenerateNewId().ToString(),
                academy = "62e271d189c840d1300b4c0c",
                First_year = 2010,
                isAcademy = false,
                Is_archive = false,
                Is_calculed = false,
                isEasy = false,
                isNational = true,
                Last_year = 2021,
                Name = "testConstat",
                Seq = 0,
                user = "615c1b8dde38e583f951ed35"
            };

            Scenario scenario3 = new Scenario
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
                Name = "testScenario3",
                Observation=0,
                Seq = 0,
                user = "615c1b8dde38e583f951ed35"
            };

            _observationCollection.InsertOne(observation);
            

            // Act
            var resultDeleteTrue = Constat.Delete(_observationCollection, _scenarioCollection, observation.Id, observation.Seq);



            // Assert
            var findDeletedObservation = _observationCollection.Find(x => x.Id.Equals(observation.Id)).FirstOrDefault();
            Assert.Null(findDeletedObservation);
            Assert.True(resultDeleteTrue);

            //Case observation in relation with a scenario 
            //Arrange
            _observationCollection.InsertOne(observation);
            _scenarioCollection.InsertOne(scenario3);

            //Act
            var resultDeleteFalse = Constat.Delete(_observationCollection, _scenarioCollection, observation.Id, observation.Seq);
            // Assert
            var findDeletedObservationFalse = _observationCollection.Find(x => x.Id.Equals(observation.Id)).FirstOrDefault();

            Assert.NotNull(findDeletedObservationFalse);
            Assert.False(resultDeleteFalse);

            //Delete the created observation for test
            _scenarioCollection.FindOneAndDelete(x => x.Id.Equals(scenario3.Id));
            _observationCollection.FindOneAndDelete(x => x.Id.Equals(observation.Id));
        }
    }
}
