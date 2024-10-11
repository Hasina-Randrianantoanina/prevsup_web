using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using System.IO;
using System.Xml;
using MongoDB.Driver;
using prevsup.Models;
using Microsoft.AspNetCore.Http;
using System.IO.Compression;

namespace prevsup.Utils.Import
{
    public class ImportData
	{

		public ImportData()
        {
			Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
		}
		public Boolean ImportYearData(IMongoCollection<Academy> academys, IMongoCollection<AcademyData> academyDatas, IMongoCollection<ImportedYear> yearsCollection, string rootPath,  IFormFile upload)
        {
			var filename = upload.FileName;
			if (Path.GetExtension(filename).ToUpper() != ".ZIP") throw new Exception(filename + " n'est pas un fichier .ZIP.");
			if (!System.IO.Directory.Exists(rootPath)) System.IO.Directory.CreateDirectory(rootPath);

			var currTime = DateTime.Now.ToString("yyyyMMddHHmmss");

			filename = string.Concat(Path.GetFileNameWithoutExtension(filename), "_", currTime, Path.GetExtension(filename));
			var src_path = Path.Combine(rootPath, filename);
			var dest_path = Path.Combine(rootPath, currTime);
			var stream = new FileStream(src_path, FileMode.Create);
			//upload.CopyToAsync(stream);
			upload.CopyTo(stream);
			stream.Close();

			ZipFile.ExtractToDirectory(src_path, dest_path);

			Boolean isSuccess = ImportYearData(academys, academyDatas, yearsCollection, dest_path);
			
			// TODO: Delete dest_path && src_path

			return isSuccess;
		}

		public Boolean ImportYearData(IMongoCollection<Academy> academys, IMongoCollection<AcademyData> academyDatas, IMongoCollection<ImportedYear> yearsCollection, string rootPath)
		{
			FileAttributes attr = File.GetAttributes(rootPath);
			if ((attr & FileAttributes.Directory) != FileAttributes.Directory) throw new Exception("Veuillez spécifier un dossier valide");

			// Check if all files exist
			XMLUtil.FilesExist(rootPath);

			// Check if ANNEE exists in the file
			int xmlYear = XMLUtil.GetYear(XMLUtil.LoadDataFromXML(rootPath, FILESToIMPORT.insdipflu));

			// ParseXML
			Dictionary<string, Dictionary<string, List<double>>> academySeries = new Dictionary<string, Dictionary<string, List<double>>>();
			List<Academy> academyList = Academy.FindAll(academys);
			
			// We load data from Academy
			foreach(Academy academy in academyList)
            {
				// We Load Data from Database
				AcademyData academyData = AcademyData.FindByAca(academyDatas, academy.Code);// TODO: This should be code or seq or number?
				if (academyData == null) academySeries.Add(academy.Code, new Dictionary<string, List<double>>());
				else
                {
					// INFO: Here we reinitialize all variables for specific year
					int indYear = XMLUtil.GetIndYear(xmlYear.ToString());
					foreach(Serie serie in academyData.Series)
                    {
						if (serie.Values.Count > indYear) serie.Values[indYear] = 0;
                    }

					academySeries.Add(academy.Code, GenUtils.SerieToDico(academyData.Series));
                }
			}

			XMLUtil.ParseXML(academyList, academySeries, rootPath, FILESToIMPORT.insdipflu, 2);
			XMLUtil.ParseXML(academyList, academySeries, rootPath, FILESToIMPORT.recap_aca, 2);
			XMLUtil.ParseXML(academyList, academySeries, rootPath, FILESToIMPORT.coefLMD, 1);
			XMLUtil.ParseXML(academyList, academySeries, rootPath, FILESToIMPORT.recap_pgm150, 0);
			XMLUtil.ParseXML(academyList, academySeries, rootPath, FILESToIMPORT.tbt, 1);

			// Execute CalculContexte
			// TODO: CalculContexte

			// Insert into Database
			foreach (KeyValuePair<string, Dictionary<string, List<double>>> academy in academySeries)
            {
				AcademyData saveAca = new AcademyData();
            	saveAca.InsertOrUpdate(academyDatas, academy.Key, academy.Value);
            }

			// TODO: Should use transactions
			ImportedYear.Insert(yearsCollection, xmlYear.ToString());

			return true;
		}
	}


}
