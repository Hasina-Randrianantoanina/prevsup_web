using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public ObjectId Id { get; set; }
        [BsonElement("seq")]
        public int Seq { get; set; }
        [BsonElement("name")]
        public string Name { get; set; }
        [BsonElement("login")]
        public string Login { get; set; }
        [BsonElement("password")]
        public string Password { get; set; }
        [BsonElement("academy")]
        [BsonRepresentation(BsonType.ObjectId)]
        public ObjectId AcademyId {get; set;}
        [BsonElement("profile")]
        public string Profile { get; set; }
        public Academy Academy { get; set; }
        [BsonElement("academies")]
        public string Academies { get; set; }
        [BsonElement("color_ui")]
        public ColorUI ColorUI { get; set; }
        [BsonElement("is_connected")]
        public Boolean IsConnected { get; set; }
        [BsonElement("connected_count")]
        public ushort ConnnectedCount { get; set; }
        [BsonElement("is_complete_graph")]
        public Boolean isCompleteGraph { get; set; }


        // Constructors
        public User()
        {

        }

        public User(string _login)
        {
            Login = _login;
        }

        private static string getAcademyIds(string _academies, ObjectId _academyId)
        {
            if (_academies != null && _academies.Length > 0) return _academies;
            if(ObjectId.TryParse(_academyId.ToString(), out _))
            {
                return _academyId.ToString();
            }
            return "";
        }

        public static List<User> FindAll(IMongoCollection<User> collections)
        {
            var users = collections.AsQueryable().Where(x => x.Name != "admin")
                    .Select(x => new User()
                    {
                        Id = x.Id,
                        Name = x.Name,
                        Login = x.Login,
                        Password = x.Password,
                        Academy = x.Academy,
                        AcademyId = x.AcademyId,
                        Academies = x.Academies
                    }).OrderBy(x => x.Login).ToList();
            // Fill user.Academies if it is null
            foreach(User user in users)
            {
                user.Academies = getAcademyIds(user.Academies, user.AcademyId);
            }

            return users;
        }


        public void UpdateColorUI(IMongoCollection<User> collections, string _userId, ColorUI color)
        {
            // TODO: pourquoi utilise la colonne ID dans cette fonction non pas le Login?
            //beforeUpdate(collections);
            var ret = collections.Find(x => x.Id.Equals(new ObjectId(_userId))).FirstOrDefault();
            if (ret == null) throw new Exception("Cet utilisateur n'existe pas");
            
            var filter = Builders<User>.Filter.Eq(x => x.Id, new ObjectId(_userId));
            var update = Builders<User>.Update.Set(x => x.ColorUI, color);
            UpdateResult result = collections.UpdateOne(filter, update);
            long modified = result.ModifiedCount;
            
        }

        public long UpdatePassword(IMongoCollection<User> collections, string password)
        {
            beforeUpdate(collections);

            var filter = Builders<User>.Filter.Eq(x => x.Login, Login);
            var update = Builders<User>.Update.Set(x => x.Password, password);
            var result = collections.UpdateOne(filter, update);
            return result.ModifiedCount;
        }

        public static List<User> ConnectedUsers(IMongoCollection<User> collections) {
            string _adminLogin = "admin"; // TODO: Admin statique
            var users = collections.Find(x => 
            (x.Login.Equals(_adminLogin) == false && x.ConnnectedCount > 0) || 
            (x.Login.Equals(_adminLogin) == true && x.ConnnectedCount > 1)).ToList();
            return users;
        }

        public long UpdateConnectivity(IMongoCollection<User> collections, Boolean _isLogin)
        {
            beforeUpdate(collections);
            var user = collections.Find(x => x.Login.Equals(Login)).FirstOrDefault();
            var filter = Builders<User>.Filter.Eq(x => x.Login, Login);

            ushort currCntCount = user.ConnnectedCount;
            if (_isLogin) currCntCount++;
            else currCntCount--;
            if (currCntCount < 0) currCntCount = 0;

            Boolean _isConnected = currCntCount > 0 ? true : false;

            var update = Builders<User>.Update.Set(x => x.IsConnected, _isConnected);
            

            update = update.Set(x => x.ConnnectedCount, currCntCount);

            var result = collections.UpdateOne(filter, update);

            return result.ModifiedCount;
        }

        public static User Find(IMongoCollection<User> collections, string _id)
        {
            var user  = collections.Find(x => x.Id.Equals(new ObjectId(_id))).FirstOrDefault();
            if (user == null) throw new Exception("Cet utilisateur n'existe pas");
            
            return user;
        }

        public static Boolean DoLogout(IMongoCollection<User> collections, string login)
        {
            User foundUser = collections.Find(x => x.Login.Equals(login)).FirstOrDefault();
            if (foundUser == null) throw new Exception("Cet utilisateur n'existe pas");
            long updtCount = foundUser.UpdateConnectivity(collections, false);

            if (updtCount <= 0) return false;
            return true;
        }

        public static User DoLogin(IMongoCollection<User> collections, string login , string password)
        {
            User checkUser = collections.Find(x => x.Login.Equals(login)).FirstOrDefault();
            if (checkUser == null) throw new Exception("Cet utilisateur n'existe pas.");
            else
            {
                if (checkUser.Password.Equals(password) == false) throw new Exception("Mot de passe incorrect.");
            }
            User foundUser = collections.Find(x => x.Login.Equals(login) && x.Password.Equals(password)).FirstOrDefault();
            if (foundUser == null) throw new Exception("Cet utilisateur n'existe pas.");

            if(ObjectId.TryParse(foundUser.AcademyId.ToString(), out _))
            {
                // TODO: dbContext devrait être passé en paramètre
                dbContext.InitAcademy();
                dbContext.InitAcademyData();
                List<Academy> allAcademies = Models.AcademyData.FindAllAca(dbContext.CAcademyDatas, dbContext.CAcademy);
                if(foundUser.Academies != null && foundUser.Academies.Length > 0)
                {
                    string[] arrAcademies = foundUser.Academies.Split(",");
                    if(arrAcademies.Length > 0) 
                        foundUser.Academy = allAcademies.Where(x => x.Id.ToString().Equals(arrAcademies[0])).FirstOrDefault();
                }
            }
            if(foundUser.Academy == null) foundUser.Academy = new Academy();

            if (foundUser.Academies == null && foundUser.Academy != null) foundUser.Academies =  foundUser.Academy.Id;

            foundUser.UpdateConnectivity(collections, true);

            return foundUser;
        }

 
        public void Update(IMongoCollection<User> collections, string nom, string academies, string password)
        {
            beforeUpdate(collections);
           
            var filter = Builders<User>.Filter.Eq(x => x.Login, Login);
            var update = Builders<User>.Update.Set(x => x.Name, nom).Set(x => x.Academies, academies);

            UpdateResult result = collections.UpdateOne(filter, update);

            if (!string.IsNullOrEmpty(password))
            {
                update = Builders<User>.Update.Set(x => x.Password, password);
                result = collections.UpdateOne(filter, update);
            }
        }


        public static User Insert(IMongoCollection<User> collections, string login, string nom, string password, string academies, string profile)
        {
                
            var usrTemp = collections.Find(x => x.Login == login).FirstOrDefault();
            if (usrTemp != null)
            {
                throw new Exception("Ce login est déjà utilisé.");
            }

            string firstAca = academies.Split(",")[0];

            ColorUI defaultCol = new ColorUI() {
                active = "#0db4ea",
                back = "#ffffff",
                calcback = "#dbb9b9",
                calcconst = "#000000",
                calcscen = "#000000",
                constatdata = "#000000",
                scenback = "#dbb9b9",
                scendata = "#000000",
                separator = "#ff0a11" };

            User newUser = new User {
                Id = ObjectId.GenerateNewId(),
                Name = nom,
                Login = login,
                Password = password,
                AcademyId = ObjectId.Parse(firstAca),
                Academies = academies,
                Profile = profile,
                IsConnected = false,
                ConnnectedCount = 0,
                ColorUI = defaultCol
                };
            collections.InsertOneAsync(newUser);

            return collections.Find(x => x.Login == login).FirstOrDefault(); 
        }

        public static void Delete(IMongoCollection<User> collections, string id)
        {
           collections.FindOneAndDelete(x => x.Id.Equals(new ObjectId(id)));
           // TODO: supprimer par ordre récapitulatif, scenario et constat de l'user
        }
        
        private void beforeUpdate(IMongoCollection<User> collections)
        {
            if (Login == null) throw new Exception("Veuillez spécifier un login");
            var user = collections.Find(x => x.Login == Login).FirstOrDefault();
            if (user == null) throw new Exception(String.Format("Cet utilisateur {0} n'existe pas", Login));
        }

        public Boolean UpdateIsCompleteGraph(IMongoCollection<User> collections, Boolean isComplete, string _userId)
        {
            var ret = collections.Find(x => x.Id.Equals(new ObjectId(_userId))).FirstOrDefault();
            if (ret == null) throw new Exception("Cet utilisateur n'existe pas");

            var filter = Builders<User>.Filter.Eq(x => x.Id, new ObjectId(_userId));
            var update = Builders<User>.Update.Set(x => x.isCompleteGraph, isComplete);
            var result = collections.UpdateOne(filter, update);
            return isComplete;
        }

        public static Boolean FindIsCompleteGraph(IMongoCollection<User> collections, string _userId)
        {
            var user = collections.Find(x => x.Id.Equals(new ObjectId(_userId))).FirstOrDefault();
            
            return user.isCompleteGraph;

        }

    }

    public class CororUI
    {
        [BsonElement("separator")]
        public string separator { get; set; }
        [BsonElement("back")]
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
        [BsonElement("active")]
        public string active { get; set; }
    }
}
