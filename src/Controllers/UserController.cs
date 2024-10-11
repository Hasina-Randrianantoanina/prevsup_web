using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using Newtonsoft.Json;
using prevsup.Models;
using System;

namespace prevsup.Controllers
{
    public class UserController : BaseController
    {
        public UserController(IConfiguration config, ILogger<UserController> _logger, IWebHostEnvironment _environment, IMemoryCache _memoryCache, DataService _dataService) : base(config, _logger, _environment, _memoryCache, _dataService)
        {
        }


        #region actions

        public IActionResult Login()
        {
            Logger.LogInformation("init DB");
            //InitDB();
            Logger.LogInformation("end init DB");
            return View();
        }

        [HttpPost]
        public IActionResult Login(string username, string password)
        {
            try
            {
                Logger.LogInformation("Start Login");
                //InitDB();
                dbContext.InitUser();
                var user = prevsup.Models.User.DoLogin(dbContext.CUser, username, password);
                Logger.LogInformation("End login");
                return Json(JsonConvert.SerializeObject(user, Settings));
            }
            catch (TimeoutException ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, "La connexion à la base a pris trop de temps. Veuillez vérifier que la base est en ligne.");
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

        }

        [HttpPost]
        public IActionResult Logout(string login)
        {
            try
            {
                Logger.LogInformation("Start Logout");
                prevsup.Models.User.DoLogout(dbContext.CUser, login);
                Logger.LogInformation("End Logout");

                return Json(JsonConvert.SerializeObject(new { result = "success" }, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        public IActionResult ListUsers(string userId, string academyId)
        {
            if (userId != null)
            {
                try
                {

                    Logger.LogInformation("Start ListUsers");
                    //Données Académiques

                    //Constats
                    dbContext.InitUser();
                    var user = prevsup.Models.User.Find(dbContext.CUser, userId);
                    var acas = dbContext.CAcademy.AsQueryable()
                        .Select(x => new
                        {
                            Id = x.Id,
                            Code = x.Code,
                        }).OrderBy(x => x.Code).ToList();

                    Logger.LogInformation("End ListUsers");
                    return Json(JsonConvert.SerializeObject(acas, Settings));
                }
                catch (Exception ex)
                {
                    Logger.LogError(ex, ex.Message, null);
                    return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
                }
            }
            else
            {
                Logger.LogInformation("Start ListUsers");
                var users = prevsup.Models.User.FindAll(dbContext.CUser);
                Logger.LogInformation("End ListUsers");
                return Json(JsonConvert.SerializeObject(users, Settings));
            }
           
        }
        [HttpPost]
        public IActionResult CreateUser(string login, string nom, string password, string academies, string profile)
        {
            try
            {
                Logger.LogInformation("Start CreateUser");
                dbContext.InitUser();
                prevsup.Models.User usr = prevsup.Models.User.Insert(dbContext.CUser, login, nom, password, academies, profile);
                var res = new { result = "success", message = "Utilisateur créé", user = usr };
                Logger.LogInformation("End CreateUser");
                return Json(JsonConvert.SerializeObject(res, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
        [HttpPost]
        public IActionResult DeleteUser(string id)
        {
            try
            {
                Logger.LogInformation("Start DeleteUser");
                dbContext.InitUser();
                prevsup.Models.User.Delete(dbContext.CUser, id);

                var res = new { result = "success", message = "Supprimer avec succès" };

                Logger.LogInformation("End DeleteUser");
                return Json(JsonConvert.SerializeObject(res, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult UpdateUser(string login, string nom, string academies, string password)
        {
            try
            {
                Logger.LogInformation("Start UpdateUser");
                string result = "success";
                dbContext.InitUser();

                prevsup.Models.User updatedUser = new Models.User(login);
                updatedUser.Update(dbContext.CUser, nom, academies, password);

                var res = new { result = result, message = "" };
                Logger.LogInformation("End UpdateUser");
                return Json(JsonConvert.SerializeObject(res, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult UpdateUserPassword(string login, string password)
        {
            try
            {
                Logger.LogInformation("Start UpdateUserPassword");
                string result = "success";
                dbContext.InitUser();
                Models.User updtUsr = new User(login);
                updtUsr.UpdatePassword(dbContext.CUser, password);

                var res = new { result = result, message = "Mot de passe mis à jour avec succès" };
                Logger.LogInformation("End UpdateUserPassword");
                return Json(JsonConvert.SerializeObject(res, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult GetColorUI(string userid)
        {
            try
            {
                Logger.LogInformation("Start GetColorUI");
                dbContext.InitUser();
                var user = Models.User.Find(dbContext.CUser, userid);
                // TODO: Code avant est si user == null alors var res = new { color = 0 };
                var res = new { color = user.ColorUI };
                Logger.LogInformation("End GetColorUI");
                return Json(JsonConvert.SerializeObject(res, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        public IActionResult ChangeColorUI([FromBody] ColorUI color, string user)
        {
            try
            {
                Logger.LogInformation("Start ChangeColorUI");
                dbContext.InitUser();
                Models.User updtUser = new Models.User();
                updtUser.UpdateColorUI(dbContext.CUser, user, color);

                Logger.LogInformation("End ChangeColorUI");
                return Json(JsonConvert.SerializeObject(new { result = "success", msg = "Couleur mis à jour avec succès" }, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

        }

        [HttpPost]
        public IActionResult UpdateExportOptionGraph(Boolean isComplete, string userId)
        {
            try
            {
                Logger.LogInformation("Start updateExportOptionGraph");
                
                dbContext.InitUser();
                Models.User actualUser = new User();
                Boolean res = actualUser.UpdateIsCompleteGraph(dbContext.CUser, isComplete, userId);

                Logger.LogInformation("End updateExportOptionGraph");
                return Json(JsonConvert.SerializeObject(res, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        public IActionResult GetExportOptionGraph(string userId)
        {
            try
            {
                Logger.LogInformation("Start GetExportOptionGraph");
                dbContext.InitUser();
                var user = Models.User.Find(dbContext.CUser, userId);
                Boolean res = user.isCompleteGraph;
                Logger.LogInformation("End GetExportOptionGraph");
                return Json(JsonConvert.SerializeObject(res, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        #endregion actions
    }
}
