using CsvHelper;
using CsvHelper.Configuration;
using prevsup.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Xml;

namespace prevsup.Utils
{
    public class ExportVars
    {
        public string FilePath { get; set; }
        public string FileName { get; set; }
        public string FileNameClient { get; set; }
        public string Name { get; set; }
        public int FirstYear { get; set; }
        public int LastYear { get; set; }
        public string RootPath { get; set; }
        public string Degre { get; set; }
        public bool IsConstat { get; set; }

        private static string[] suffix_vars = new string[] { "I", "J", "IJ", "JA", "JI" };
        private Dictionary<string, string> dicAcademies = new Dictionary<string, string>();
        private Dictionary<string, string> dicFilieres = new Dictionary<string, string>();
        private Dictionary<string, string> dicSeries = new Dictionary<string, string>();
        private Dictionary<string, string> dicVariables = new Dictionary<string, string>();
        private Dictionary<string, string> dicAides = new Dictionary<string, string>();


        public ExportVars(string rootPath, string name, string degre, int firstYear, int lastYear, bool isConstat)
        {
            Name = name;
            Degre = degre;
            FirstYear = firstYear;
            LastYear = lastYear;
            RootPath = rootPath;
            IsConstat = isConstat;
            Init();
        }

        private void Init()
        {
            string prefixe = "Scenario";
            if (IsConstat) prefixe = "Constat";
            FileName = prefixe + "_" + Name + "_degree_" + Degre + "_" + DateTime.Now.ToString("ddMMyyhhss") + ".csv";
            FilePath = RootPath + "/FileCSV/" + FileName;

            dicAcademies = File.ReadLines(Path.Combine(RootPath, "Dictionnaire", "Academies.txt")).Select(line => line.Split(';')).ToDictionary(line => line[0], line => line[1]);
            dicFilieres =File.ReadLines(Path.Combine(RootPath, "Dictionnaire", "Filieres_J.txt")).Select(line => line.Split(';')).ToDictionary(line => line[0], line => line[1]);
            dicSeries = File.ReadLines(Path.Combine(RootPath, "Dictionnaire", "Series_bac_I.txt")).Select(line => line.Split(';')).ToDictionary(line => line[0], line => line[1]);
            dicVariables = File.ReadLines(Path.Combine(RootPath, "Dictionnaire", "Variables.txt")).Select(line => line.Split(';')).ToDictionary(line => line[0], line => line[1]);
            XmlDocument docAide = DomUtils.getDocumentFromResourcePath(Path.Combine(RootPath, "Dictionnaire", "Aide.xml"));
            
            foreach (XmlNode node in docAide.SelectNodes("Aide/Key"))
            {
                string name = node.Attributes["name"].Value;
                string value = node.FirstChild.Attributes["value"].Value;
                int idx = name.LastIndexOf("_");
                string sfx = name[(idx + 1)..];
                if (suffix_vars.Contains(sfx)) name = name[..idx];
                dicAides[name] = value;
            }
        }

        public string WriteToCSV(List<Serie> series, List<RowTree> trees, string vars)
        {
            List<string> listVars = vars.Split(";").ToList();
            
            var kp = trees.Join(
                series,
                arg => arg.Idm,
                arg2 => arg2.Variable,
                // Kaky - 07/06/2022 - Création de l'object Row pour chaque ligne
                (second, first) => new Row()
                {
                    Parent = second.ParentId,
                    Name = first.Variable,
                    RealName = second.DisplayLabel,
                    serie = first.Values,
                    Id = second.Idm,
                    Level = 0,
                    child = second.Child,
                        // Kaky - 07/06/2022 - ajout de cet attribut pour stocker la Variable dans la ligne
                   // var = getVariableOnly(first.Variable)
                })
                .ToList();

            writeToCSV(kp, listVars);

            string pref = "Scenario";
            if (IsConstat) pref = "Constat";

            string filenameClient = pref + "_" + Name + "_"+ DateTime.Now.ToString("dd_MM_yyyy") + "_degree_" + Degre + ".csv";

            return filenameClient;
        }

        private Dictionary<string, List<Row>> GetRowsByVar(List<Row> kp, List<string> variables)
        {
            // INFO: There should only be one Row instance of a variable, else there is an error somewhere because the variable not exist or there are duplicate keys either in Series or in ModelTree.model 
            foreach(var variable in variables) {
                var foundVars = kp.Where(x => x.RealName.Equals(variable)); 
               
                if (foundVars.Count() <= 0) throw new Exception(String.Format("La variable {0} n'existe pas", variable));
                // TODO: We suppose we always get the first element if it returns multiple elements
                //if (variable.Equals("EFF_TOT_FIL") == false && foundVars.Count() > 1) throw new Exception(String.Format("Il y a erreur pour la variable {0}.", variable));
            }

            // Get the root row with all its children
            Dictionary<string, List<Row>> result = new Dictionary<string, List<Row>>();
            foreach (var variable in variables)
            {
                var rows = GetRowsByVar(kp, variable);
                if (rows.Count > 0) result[getVariableOnly(rows[0].Name)] = rows;
                else result[variable] = new List<Row>();
            }

            return result;
        }

        private List<Row> GetRowsByVar(List<Row> kp, string variable)
        {
            Row rootVar = kp.Where(x => x.RealName.Equals(variable)).ToList()[0];
            HashSet<Row> result = new HashSet<Row>();
            result.Add(rootVar);
            GetChildren(kp, result, rootVar);
            return result.ToList();
        }

        private void GetChildren(List<Row> kp, HashSet<Row> result, Row root)
        {
            foreach(Row row in kp)
            {
                if(row.Parent.Equals(root.Id))
                {
                     result.Add(row);
                    GetChildren(kp, result, row);
                }
            }
        }

        private void writeToCSV(List<Row> kp, List<string> listVars)
        {
            // Kaky - 07/06/2022 - Ajout des lignes de chaque valeur dans vars dans un dictionnaire
            Dictionary<string, List<Row>> valuesPerVars = GetRowsByVar(kp, listVars);

            // Kaky - 07/06/2022 - Ecriture dans le fichier CSV
            var config = new CsvConfiguration(CultureInfo.CurrentCulture) { Delimiter = ";" };
            var writer = new StreamWriter(FilePath, false, Encoding.UTF8);
            using (var csv = new CsvWriter(writer, config))
            {
                List<string> Header = new List<string>();

                foreach (KeyValuePair<string, List<Row>> kvp in valuesPerVars)
                {

                    if (kvp.Value.Count > 0)
                    {
                        csv.NextRecord();
                        string varHeader = kvp.Key;
                        int idxHeader = varHeader.LastIndexOf("_");
                        string var1Header = varHeader;
                        if (suffix_vars.Contains(varHeader[(idxHeader + 1)..])) var1Header = varHeader[..idxHeader];
                        // Ecriture en-tête
                        csv.WriteField(varHeader + ":" + (dicAides.ContainsKey(var1Header) ? dicAides[var1Header] : ""));
                        csv.NextRecord();

                        // Ecriture autre noms colonnes
                        if (varHeader[(idxHeader + 1)..] == "IJ")
                        {
                            csv.WriteField("SERIE");
                            csv.WriteField("FILIERE");
                        }
                        else if (varHeader[(idxHeader + 1)..] == "JA")
                        {
                            csv.WriteField("FILIERE");
                            csv.WriteField("ACADEMIE");
                        }
                        else if (varHeader[(idxHeader + 1)..] == "JI")
                        {
                            csv.WriteField("FILIERE");
                            csv.WriteField("SERIE");
                        }
                        else
                        {
                            csv.WriteField("SERIE");
                            csv.WriteField("");
                        }
                        for (int i = FirstYear; i <= LastYear; i++)
                        {
                            csv.WriteField("" + i);
                        }
                        csv.NextRecord();


                        foreach (var value in kvp.Value)
                        {
                            string label = value.Name;
                            int idx = label.LastIndexOf("_");
                            // Ecriture des valeurs pour chaque cellule
                            bool isTaux = label.StartsWith("T_") || label.StartsWith("P_") || label.StartsWith("ANC");

                            string col1 = "", col2 = "";
                            // TODO: Pourquoi vérifier idx == -1?
                            if (idx != -1)
                            {
                                string[] keys = label[(idx + 1)..].Split(",");
                                string v1 = label[..idx];
                                int idx1 = v1.LastIndexOf("_");
                                string ij = v1[(idx1 + 1)..];
                                if (ij == "JA")
                                {
                                    col1 = dicFilieres.ContainsKey(keys[0]) ? dicFilieres[keys[0]] : keys[0];
                                    col2 = dicAcademies.ContainsKey(keys[1]) ? dicAcademies[keys[1]] : keys[1];
                                }
                                else if (ij == "JI")
                                {
                                    // Kaky - 07/06/2022 - Recherche libellés dans dictionnaires
                                    // 0: filiere, 1: serie
                                    col1 = dicFilieres.ContainsKey(keys[0]) ? dicFilieres[keys[0]] : keys[0];
                                    col2 = dicSeries.ContainsKey(keys[1]) ? dicSeries[keys[1]] : keys[1];
                                } else if (ij == "J")
                                {
                                    col1 = dicFilieres.ContainsKey(keys[0]) ? dicFilieres[keys[0]] : keys[0];
                                    col2 = "";
                                }
                                else
                                {
                                    col1 = dicSeries.ContainsKey(keys[0]) ? dicSeries[keys[0]] : keys[0];
                                    col2 = (keys.Count() > 1) ? (dicFilieres.ContainsKey(keys[1]) ? dicFilieres[keys[1]] : keys[1]) : "";
                                }
                            }
                            else
                            {
                                col1 = label;
                                col2 = "";
                            }
                            csv.WriteField(col1);
                            csv.WriteField(col2);

                            foreach (var ka in value.serie)
                            {
                                string s = ka.ToString();
                                if (s != "Infinity")
                                {
                                    double d = double.Parse(ka.ToString().Replace(".", ","), new CultureInfo("fr-FR"));
                                    s = isTaux ? d.ToString("0.000000") : ((int)Math.Round(d)).ToString();
                                }
                                else s = "";
                                csv.WriteField(s);
                            }
                            csv.NextRecord();
                        }

                    }
                }
            }
        }


        private string getVariableOnly(string label)
        {
            int idx = label.LastIndexOf("_");
            string var = label;
            if (idx >= 0) //&& label[idx..].IndexOf(",") > 0
                var = label[..idx]; // tr.RealName;
            return var;
        }

    }
}
