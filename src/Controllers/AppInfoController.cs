using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.IO;
using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using prevsup.Models;

namespace prevsup.Controllers
{
    public class AppInfoController : BaseController
    {
        public AppInfoController(IConfiguration config, ILogger<UserController> _logger, IWebHostEnvironment _environment, IMemoryCache _memoryCache, DataService _dataService) : base(config, _logger, _environment, _memoryCache, _dataService)
        {
        }
        [HttpPost]
        public IActionResult ChangeAppInfo(string info = "app information")
        {
            try
            {
                Logger.LogInformation("Start ChangeAppInfo");
                //string folderPath = Environment.WebRootPath + "\\FileJson\\appInfo.json";
                var appInfo = new { content = info };
                //open file stream
                //using (StreamWriter file = System.IO.File.CreateText(folderPath))
                //{
                //    JsonSerializer serializer = new JsonSerializer();
                //    //serialize object directly into file stream
                //    serializer.Serialize(file, appInfo);
                //}

                string jsonString = System.IO.File.ReadAllText("appInfo.json");

                // Convert the JSON string to a JObject:
                JObject jObject = Newtonsoft.Json.JsonConvert.DeserializeObject(jsonString) as JObject;
                // Select a nested property using a single string:
                JToken jToken = jObject.SelectToken("content");
                // Update the value of the property: 
                jToken.Replace(info);
                // Convert the JObject back to a string:
                string updatedJsonString = jObject.ToString();
                System.IO.File.WriteAllText("appInfo.json", updatedJsonString);


                Logger.LogInformation("End ChangeAppInfo");
                return Json(JsonConvert.SerializeObject(appInfo, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

        }

        [HttpGet]
        public IActionResult GetAppInfo()
        {
            try
            {
                Logger.LogInformation("Start getting app info");
                string jsonString = System.IO.File.ReadAllText("appInfo.json");

                // Convert the JSON string to a JObject:
                JObject jObject = JObject.Parse(jsonString);
                string contentValue = (string)jObject["content"];
                string addressValue = (string)jObject["address"];
                var res = new { content = contentValue, address = addressValue };
                Logger.LogInformation("End getting app info");
                return Json(JsonConvert.SerializeObject(res, Settings));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

        }
    }
}
