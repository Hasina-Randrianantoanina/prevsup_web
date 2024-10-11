using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using prevsup.Models;
using Newtonsoft.Json;

namespace prevsup.Controllers
{
    public class UserGuideController : BaseController
    {
        public UserGuideController(IConfiguration config, ILogger<ConstatController> _logger, IWebHostEnvironment _environment, IMemoryCache _memoryCache, DataService _dataService) : base(config, _logger, _environment, _memoryCache, _dataService)
        {
        }

        [HttpGet]
        public IActionResult DownloadUserGuide()
        {
            try
            {
                //string filename = "TestGuide.pdf";

                Logger.LogInformation("Start downloading userGuide");
                string folderPath = Environment.WebRootPath + "/FilePDF/";
                string[] fileGroup = Directory.GetFiles(folderPath, "*.pdf");
                string filename = Path.GetFileName(fileGroup[0]);
                string filepath = Path.Combine(folderPath, filename);

                // Read the file contents
                byte[] fileContents = System.IO.File.ReadAllBytes(filepath);

                // Set the content type and content disposition headers
                Response.Headers.Add("Content-Type", "application/pdf");
                Response.Headers.Add("Content-Disposition", "attachment; filename="+filename);

                Logger.LogInformation("End downloading userGuide");
                // Return the file as a byte array
                return File(fileContents, "application/pdf", filename);
            }
            catch (Exception e)
            {
                Logger.LogError(e, e.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, e.Message); ;
            }
        }

        [HttpGet]
        public IActionResult GetUserGuideName()
        {
            try
            {
                Logger.LogInformation("Start getting userGuide name");
                string folderPath = Environment.WebRootPath + "/FilePDF/";
                string[] fileGroup = Directory.GetFiles(folderPath, "*.pdf");
                string fileName = "";
                if(fileGroup.Length == 0) { fileName = "null"; }
                else { fileName = Path.GetFileName(fileGroup[0]); }
                var filenameObject = new { name = fileName };
                //return Ok(filename);
                Logger.LogInformation("End getting userGuide name");
                return Json(JsonConvert.SerializeObject(filenameObject, Settings));
            }
            catch (Exception e)
            {
                Logger.LogError(e, e.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, e.Message);
            }
        }
        [HttpPost]
        public IActionResult UploadUserGuide(IFormFile file)
        {
            try
            {
                Logger.LogInformation("Start uploading userGuide");
                string folderPath = Environment.WebRootPath + "/FilePDF/";
                //string oldGuidePath = Environment.WebRootPath + "/FilePDF/*.pdf";
                //delete old user guide
                string[] oldFiles = Directory.GetFiles(folderPath, "*.pdf");
                //DirectoryInfo directory= new DirectoryInfo(oldGuidePath);
                foreach(string oldFile in oldFiles)
                {
                    System.IO.File.Delete(oldFile);
                }
                //add new user guide
                string filepath = Path.Combine(folderPath, file.FileName);

                using (var stream = new FileStream(filepath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }
                Logger.LogInformation("End uploading userGuide");
                return Ok();
            }
            catch (Exception e)
            {
                Logger.LogError(e, e.Message, null);
                return StatusCode(StatusCodes.Status500InternalServerError, e.Message); ;
            }

        }
    }
}
