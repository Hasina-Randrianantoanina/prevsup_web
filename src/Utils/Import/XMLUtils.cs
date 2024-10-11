using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using prevsup.Models;
using prevsup.Utils.Engine;

namespace prevsup.Utils.Import
{
	public abstract class XMLUtil
	{
		public static FILESToIMPORT[] FILES_TO_IMPORT = new FILESToIMPORT[] { FILESToIMPORT.tbt, FILESToIMPORT.insdipflu, FILESToIMPORT.coefLMD, FILESToIMPORT.recap_aca, FILESToIMPORT.recap_pgm150 };

		public static Boolean ParseXML(List<Academy> academyList, Dictionary<string, Dictionary<string, List<double>>> academySeries, string rootPath, FILESToIMPORT fileToImport, int nbIndice)
		{
			Table result = LoadDataFromXML(rootPath, fileToImport);

			Boolean academyColumName_is_A = fileToImport == FILESToIMPORT.recap_aca;
			int insertOnlyForAcademie = -1;
			if (FILESToIMPORT.recap_aca == fileToImport) insertOnlyForAcademie = 70; //TODO: should this be in MongoDB?

			foreach (var row in result.Rows)
			{
				Dictionary<string, string> m_valueMap = new Dictionary<string, string>();
				string year = "";
				string aca = "";
				string indI = "";
				string indJ = "";
				string indV = "";
				string indW = "";
				string indA = "";
				string indU = "";
				string indOrigine = "";
				string indDegre = "";
				string cursus = "";
				foreach (var column in row.Columns)
				{
					string name = column.Name.ToLower();
					string nameUpper = name == null ? null : column.Name.ToUpper();

					if ("annee".Equals(name)) year = column.Value;
					else if ("aca".Equals(name)) aca = column.Value; // TODO: This is slightly different from Java
					else if ("I".Equals(nameUpper)) indI = column.Value;
					else if ("J".Equals(nameUpper)) indJ = column.Value;
					else if ("V".Equals(nameUpper)) indV = column.Value;
					else if ("W".Equals(nameUpper)) indW = column.Value;
					else if ("U".Equals(nameUpper)) indU = column.Value;
					else if ("orig".Equals(name)) indOrigine = column.Value;
					else if ("degre".Equals(name)) indDegre = column.Value;
					else if ("A".Equals(nameUpper))
					{
						if (academyColumName_is_A) aca = column.Value; // TODO: This is slightly different from Java
						indA = column.Value;
					}
					else if ("cursus".Equals(name)) cursus = column.Value;
					else if (column.Missing == null) m_valueMap.Add(nameUpper, column.Value);
					// INFO: If this is decommented then it leads to a Bug, some value are not imported like P_ACA_L_JA_111,32. This variable has value in cursus = "L" but in cursus = "M" it has missing="."
					//else if (column.Missing != null) m_valueMap.Add(nameUpper, "");  // Variables with missing="." are added to the series
				}
				Dictionary<string, string>.KeyCollection keys = m_valueMap.Keys;
				foreach (string OrigKey in keys)
				{
					string key = new string(OrigKey);
					string value = m_valueMap.GetValueOrDefault(key);
					if ("EFFECTIFTOTAL".Equals(key)) key = "EFF_" + cursus;
					string modifiedKey = (nbIndice == 0) ? key : (key + "_");

					if (!indOrigine.Equals("")) modifiedKey += indOrigine + "_";
					if (!indI.Equals("")) modifiedKey += "I";
					if (!indJ.Equals("")) modifiedKey += "J";
					if (!indV.Equals("")) modifiedKey += "V";
					if (!indU.Equals("")) modifiedKey += "U";
					if (!indA.Equals("")) modifiedKey += "A";
					if (!indW.Equals("")) modifiedKey += "W";

					if (nbIndice != 0)
					{
						modifiedKey += "_";
						Boolean indic1 = false;
						if (!indI.Equals(""))
						{
							bool isINumeric = int.TryParse(indI, out _);

							if (nbIndice == 1)
                            {
								if (isINumeric) modifiedKey += int.Parse(indI);
								else modifiedKey += indI.Trim();
							}
							else
							{
								if(isINumeric)
									modifiedKey = modifiedKey + int.Parse(indI) + ",";
								else modifiedKey = modifiedKey + indI.Trim() + ",";
								indic1 = true;
							}
						}
						if (!indJ.Equals(""))
						{
							if (nbIndice == 1) modifiedKey += int.Parse(indJ);
							else
							{
								if (!indic1) modifiedKey += int.Parse(indJ) + ",";
								else modifiedKey += int.Parse(indJ);
							}
						}
						if (!indV.Equals("")) modifiedKey += int.Parse(indV);
						if (!indU.Equals("")) modifiedKey += int.Parse(indU);
						if (!indA.Equals("")) modifiedKey += int.Parse(indA);
						if (!indW.Equals("")) modifiedKey += indW;
					}

					double doubleValue = value.Equals("") ? 0.0 : Double.Parse(value, CultureInfo.InvariantCulture);
					string trueAca = insertOnlyForAcademie == -1 ? aca : insertOnlyForAcademie.ToString();
					trueAca = "SSR" + trueAca; // TODO: we concat SSR with "aca" ?

					Dictionary<string, List<double>> prevSeries;
					academySeries.TryGetValue(trueAca, out prevSeries);


					// TODO: Add check if Date >= 2030 Increase Length of Values By 10
					if (prevSeries.ContainsKey(modifiedKey))
                    {
						// Update the Values of the series
						List<double> oldValues = prevSeries[modifiedKey];
						oldValues[GetIndYear(year)] = doubleValue;
						prevSeries[modifiedKey] = oldValues;
                    } else
                    {
						// TODO: We make the array large engouh to avoid IndexOutOfBoundException. (It can hold series of 30 years)
						
						List<double> values = new List<double>(new double[VarData.NbYears]);
						values[GetIndYear(year)] = doubleValue;
						prevSeries.Add(modifiedKey, values);
                    }
					academySeries[trueAca] = prevSeries;
				}
			}


			return true;
		}

		public static int GetIndYear(string year)
        {
			int start = 2010;
			int current = int.Parse(year);
			if(current < start) throw new Exception("Veuillez importer une année supérieure ou égale à 2010");
			return current - start;
        }

		public static Boolean FilesExist(string rootPath)
		{
			foreach (FILESToIMPORT fileToImport in FILES_TO_IMPORT)
			{
				string file = fileToImport.ToString() + ".xml";
				string filePath = Path.Combine(rootPath, file);
				if (File.Exists(filePath) == false) throw new Exception(String.Format("Veuillez vérifier que le fichier {0} existe dans le .ZIP", file));
			}

			return true;

		}

		public static int GetYear(Table table)
		{
			if (table.Rows.Count == 0) throw new Exception("Veuillez vérifier que les fichiers contiennent l'attribut ANNEE.");
			return int.Parse(table.Rows[0].Columns.Where(x => x.Name.ToUpper().Equals("ANNEE")).FirstOrDefault().Value);
		}

		public static Table LoadDataFromXML(string rootPath, FILESToIMPORT fileToImport)
		{
			Table result = null;
			XmlSerializer xmlSerializer = null;
			string file = fileToImport.ToString() + ".xml";
			string filePath = Path.Combine(rootPath, file);
			using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
			{
				switch (fileToImport)
				{
					case FILESToIMPORT.insdipflu:
						xmlSerializer = new XmlSerializer(typeof(TableInsdipflu));
						result = (TableInsdipflu)xmlSerializer.Deserialize(stream);
						break;
					case FILESToIMPORT.tbt:
						xmlSerializer = new XmlSerializer(typeof(TableTbt));
						result = (TableTbt)xmlSerializer.Deserialize(stream);
						break;
					case FILESToIMPORT.coefLMD:
						xmlSerializer = new XmlSerializer(typeof(TableCoefLMD));
						result = (TableCoefLMD)xmlSerializer.Deserialize(stream);
						break;
					case FILESToIMPORT.recap_aca:
						xmlSerializer = new XmlSerializer(typeof(TableMat_acapart));
						result = (TableMat_acapart)xmlSerializer.Deserialize(stream);
						break;
					case FILESToIMPORT.recap_pgm150:
						xmlSerializer = new XmlSerializer(typeof(TableMat_Taux150));
						result = (TableMat_Taux150)xmlSerializer.Deserialize(stream);
						break;
				}
			}

			if (result == null) throw new Exception(String.Format("Une erreur s'est produite lors de la déserialization du fichier {0}.", file));

			return result;
		}
	}

}
