using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Driver;
using prevsup.Models;
using System;
using System.Linq;
using System.Runtime.Intrinsics.X86;
using Xunit;
using Xunit.Abstractions;

namespace prevsup_unit_testing
{
    public class UserTest
    {
        private readonly IMongoCollection<User> _userCollection;
        private readonly ITestOutputHelper _outputHelper;

        public UserTest( ITestOutputHelper testOutput)
        {
            Database db = new Database();
            _userCollection = db.database.GetCollection<User>("user");
            _outputHelper = testOutput;
        }

        [Fact]
        public void testFind()
        {
            // Arrange
            User user1 = new User { Id = ObjectId.GenerateNewId(), Name = "testUser" };
            _userCollection.InsertOne(user1);
            // Act
            var result = User.Find(_userCollection, user1.Id.ToString());

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user1.Id, result.Id);
            Assert.Equal(user1.Name, result.Name);

            //Delete the created user for test
            _userCollection.FindOneAndDelete(x => x.Id.Equals(user1.Id));
        }

        [Fact]
        public void testDelete()
        {
            // Arrange
            User user1 = new User { Id = ObjectId.GenerateNewId(), Name = "testUser" };
            _userCollection.InsertOne(user1);
            // Act
            User.Delete(_userCollection, user1.Id.ToString());

            // Assert
            Assert.Null(_userCollection.Find(x => x.Login == user1.Login).FirstOrDefault());

        }

        [Fact]
        public void testInsert()
        {
            // Arrange
            User user1 = new User { Login="testUser1", Name = "testUser1" ,Password="testUser1", Academies= "615c1b8dde38e583f951ed35", Profile= "Prévisionniste SSA" };
            
            // Act
            User.Insert(_userCollection,user1.Login,user1.Name,user1.Password, user1.Academies,user1.Profile);

            // Assert
            Assert.NotNull(_userCollection.Find(x => x.Login == user1.Login).FirstOrDefault());

            //Delete the created user for test
            _userCollection.FindOneAndDelete(x => x.Login == user1.Login);

        }

        [Fact]
        public void testFindAll()
        {
            // Arrange
            var allUsers = _userCollection.Find(x => x.Name != "admin").ToList<User>().OrderBy(x=>x.Login);
            // Act
            var result =  User.FindAll(_userCollection);
            
            //_outputHelper.WriteLine("*******result*********");
            
            // Assert
            Assert.NotNull(result);
            //Assert.Equal(allUsers, result);
       
        }

        [Fact]
        public void testUpdate()
        {
            // Arrange
            // Arrange
            User user = new User { Login = "testUser", Name = "testUser", Password = "testUser", Academies = "615c1b8dde38e583f951ed35", Profile = "Prévisionniste SSA" };
            _userCollection.InsertOne(user);
            var nom = "ssrTest";
            var academies = "62e271d089c840d1300b4bfa";
            var password = "ssrTest";
            var userToUpdate = new User("testUser");

            // Act
            userToUpdate.Update(_userCollection,nom,academies,password);

            var userUpdated = _userCollection.Find(x => x.Login == user.Login).FirstOrDefault();

            // Assert
            Assert.NotNull(userUpdated);
            Assert.Equal(nom, userUpdated.Name);
            Assert.Equal(academies, userUpdated.Academies);
            Assert.Equal(password, userUpdated.Password);

            //Delete the created user for test
            _userCollection.FindOneAndDelete(x => x.Login == user.Login);
        }
    }
}

