using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using Newtonsoft.Json;
using prevsup.Controllers;
using prevsup.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Xml.Serialization;

namespace prevsup.Utils
{
    //    public static class ImportUtils
    //    {
    //        private static string path;
    //        private static ILogger<MainController> _logger;
    //        private static TABLE matrice;
    //        private static AcademyData data_acad;
    //        private static Dictionary<string, List<double>> series;
    //        private static IWebHostEnvironment _hostingEnvironment;
    //        private static Dictionary<string, double> temp = new Dictionary<string, double>();
    //        private static int count = 0;
    //        private static int index_annee;
    //        private static int first_year = 2010;

    //        public static Object Import(string path)
    //        {
    //            ImportUtils.path = path;
    //            ImportUtils._logger = MainController.Logger;
    //            ImportUtils._hostingEnvironment = MainController._hostingEnvironment;
    //            IMongoCollection<Academy> CAcademy = dbContext.CAcademy;
    //            var Academy = CAcademy.AsQueryable().Where(x => x.Is_Whole).Select(x => x.Number).ToList();
    //            var academies = CAcademy.AsQueryable().Select(x => x.Number).ToList();

    //            //MainController.progress.NbAcademies = academies.Count;
    //            //MainController.progress.Dossier = "";
    //            //MainController.progress.CurrentAcademie = 0;
    //            //MainController.progress.Complete = false;

    //            /*List<AcademyData> AcademyData = new List<AcademyData>();
    //            var AcademyData = dbContext.CAcademyDatas.AsQueryable().Where(x => x.aca == "12").FirstOrDefault();
    //            foreach (var item in academies)
    //            {
    //                AcademyData = dbContext.CAcademyDatas.AsQueryable().Where(x => x.aca == item.ToString()).FirstOrDefault();
    //                System.Threading.Thread.Sleep(5000);
    //                if (AcademyData != null) AcademyData.Add(AcademyData);
    //            }*/

    //            XmlSerializer XML = new XmlSerializer(typeof(TABLE));
    //            // Dictionary<string, AcademyData> data = new Dictionary<string, AcademyData>();

    //            string filename = Path.Combine(path, "insdipflu.xml");
    //            if (!File.Exists(filename)) return new { error = "Le fichier insdipflu.xml n'a pas été trouvé dans le fichier .ZIP" };
    //            Convert2UTF8(filename);
    //            var stream = new FileStream(filename, FileMode.Open, FileAccess.Read);
    //            var list = (TABLE)XML.Deserialize(stream);
    //            stream.Close();
    //            matrice = list;

    //            filename = Path.Combine(path, "tbt.xml");
    //            if (!File.Exists(filename)) return new { error = "Le fichier tbt.xml n'a pas été trouvé dans le fichier .ZIP" };
    //            Convert2UTF8(filename);
    //            stream = new FileStream(filename, FileMode.Open, FileAccess.Read);
    //            list = (TABLE)XML.Deserialize(stream);
    //            stream.Close();
    //            matrice.TBT = list.TBT;

    //            filename = Path.Combine(path, "coefLMD.xml");
    //            if (!File.Exists(filename)) return new { error = "Le fichier coefLMD.xml n'a pas été trouvé dans le fichier .ZIP" };
    //            Convert2UTF8(filename);
    //            stream = new FileStream(filename, FileMode.Open, FileAccess.Read);
    //            list = (TABLE)XML.Deserialize(stream);
    //            stream.Close();
    //            matrice.COEFLMD = list.COEFLMD;

    //            filename = Path.Combine(path, "recap_aca.xml");
    //            if (!File.Exists(filename)) return new { error = "Le fichier recap_aca.xml n'a pas été trouvé dans le fichier .ZIP" };
    //            Convert2UTF8(filename);
    //            stream = new FileStream(filename, FileMode.Open, FileAccess.Read);
    //            list = (TABLE)XML.Deserialize(stream);
    //            stream.Close();
    //            matrice.MAT_ACAPART = list.MAT_ACAPART;

    //            filename = Path.Combine(path, "recap_pgm150.xml");
    //            if (!File.Exists(filename)) return new { error = "Le fichier recap_pgm150.xml n'a pas été trouvé dans le fichier .ZIP" };
    //            Convert2UTF8(filename);
    //            stream = new FileStream(filename, FileMode.Open, FileAccess.Read);
    //            list = (TABLE)XML.Deserialize(stream);
    //            stream.Close();
    //            matrice.MAT_TAUX150 = list.MAT_TAUX150;

    //            // Kaky - 27/06/2022 - Obtenir l'année que l'on importe en cours
    //            string currentYear = getCurrentYear(matrice.INSDIPFLU[0]);

    //            foreach (var num_academie in academies)
    //            {
    //                //if (num_academie != 70) continue; //TODO: TEST à commenter
    //                _logger.LogInformation(String.Format("Start ImportData Academie: {0}", num_academie));
    //                //MainController.progress.NumAcademie = num_academie;
    //                var t0 = matrice.INSDIPFLU[0];
    //                var annee = t0.COLUMN.Where(x => x.Name.ToUpper() == "ANNEE").FirstOrDefault().Value;
    //                loadDataAcad(num_academie, currentYear);
    //                int year = ImportData(num_academie);
    //                year -= first_year;

    //                CalculContexteNew.series = series;
    //                CalculDataNew(num_academie, year); // TODO test décommenter

    //                GC.Collect();
    //                GC.WaitForPendingFinalizers();

    //                saveDataAcad(num_academie);
    //                data_acad = null;

    //                GC.Collect();
    //                GC.WaitForPendingFinalizers();

    //                _logger.LogInformation(String.Format("End ImportData Academie: {0}", num_academie));
    //                //MainController.progress.CurrentAcademie++;
    //            }
    //            //MainController.progress.Complete = true;

    //            return new { success = true  };
    //        }

    //        private static string getCurrentYear(INSDIPFLU insdipflu)
    //        {
    //            return insdipflu.COLUMN.Where(x => x.Name.ToUpper().Equals("ANNEE")).FirstOrDefault().Value;
    //        }

    //        private static void saveDataAcad(int num_academie)
    //        {
    //            // Kaky - 16/06/2022 - Utilisation de GridFS pour stocker les séries
    //            AcademyData saveAca = new AcademyData();
    //            saveAca.InsertOrUpdate(dbContext.CAcademyDatas, num_academie.ToString(), series, data_acad.Year);
    //        }

    //        private static void loadDataAcad(int num_academie, string currentYear)
    //        {
    //            // Kaky - 16/06/2022 - Utilisation de GridFS pour avoir les données d'Académie
    //            data_acad = AcademyData.FindByAca(dbContext.CAcademyDatas, num_academie.ToString());

    //            // Ajout de la nouvelle année dans Year
    //            HashSet<string> newYears = new HashSet<string>(data_acad.Year);
    //            newYears.Add(currentYear);
    //            //data_acad.Year = newYears.ToList(); //TODO: Test à décommenter

    //            series = data_acad.Series.ToDictionary(x => x.Variable, x => x.Values);

    //            // Complété la Variable series
    //            completeSeriesValues(series, currentYear);
    //        }

    //        private static void completeSeriesValues(Dictionary<string, List<double>> _series, string currentYear)
    //        {
    //            if(_series.Count > 0)
    //            {
    //                List<double> values = _series.First().Value;
    //                int ind = data_acad.Year.IndexOf(currentYear);
    //                if(values.Count < ind + 1)
    //                {
    //                    foreach (KeyValuePair<string, List<double>> pair in _series)
    //                    {
    //                       pair.Value.Add(0);
    //                    }
    //                }
    //                /*
    //                List<double> Values = _series.First().Value;
    //                int yearInd = getIndYear(currentYear);
    //                if(Values.Count < yearInd + 1)
    //                {

    //                }*/
    //            }
    //        }

    //        public static int getIndYear(string sYear)
    //        {
    //            return int.Parse(sYear) - 2010;
    //        }

    //        private static int ImportData(int num_academie)
    //        {
    //            string acad, i, j, d, curs, a, eff = "";

    //            string[] allvar = new string[] { "I", "J", "A", "ACA", "DEGRE", "ANNEE", "CURSUS", "EFFECTIFTOTAL" };

    //            string year = getCurrentYear(matrice.INSDIPFLU[0]);
    //            int idx = data_acad.Year.IndexOf(year);
    //            foreach (var s in series)
    //            {
    //                // Kaky - 29/07/2022 - Correction out off range
    //                try
    //                {
    //                    while (s.Value.Count < data_acad.Year.Count)
    //                    {
    //                        s.Value.Add(0);
    //                    }
    //                    s.Value[idx] = 0;
    //                }
    //                catch (Exception ex)
    //                {
    //                    _logger.LogInformation("Xce" + ex.Message);
    //                }
    //            }

    //            Serie serie = new Serie();

    //            foreach (var table in matrice.INSDIPFLU)
    //            {

    //                acad = table.COLUMN.Where(x => x.Name.ToUpper() == "ACA").FirstOrDefault().Value;
    //                acad = int.Parse(acad).ToString();
    //                if (acad != num_academie.ToString()) continue;

    //                data_acad.IsModified = true;
    //                year = table.COLUMN.Where(x => x.Name.ToUpper() == "ANNEE").FirstOrDefault().Value;

    //                int index = data_acad.Year.IndexOf(year);

    //                i = table.COLUMN.Where(x => x.Name.ToUpper() == "I").FirstOrDefault().Value;
    //                j = table.COLUMN.Where(x => x.Name.ToUpper() == "J").FirstOrDefault().Value;
    //                d = table.COLUMN.Where(x => x.Name.ToUpper() == "DEGRE").FirstOrDefault().Value;

    //                var t = table.COLUMN.Where(x => !String.IsNullOrEmpty(x.Value) && !allvar.Contains(x.Name.ToUpper())).ToList();

    //                foreach (var item in t)
    //                {
    //                    var variable = item.Name;
    //                    if (variable.Contains("_d3")) continue;

    //                    variable += "_IJ_" + i + "," + j;
    //                    variable = variable.ToUpper();

    //                    double val = double.Parse(item.Value.Replace(".", ","), new CultureInfo("fr-FR"));
    //                    if (!series.ContainsKey(variable)) series[variable] = zeros(index + 1);
    //                    series[variable][index] = val;
    //                }

    //            }

    //            foreach (var table in matrice.TBT)
    //            {
    //                acad = table.COLUMN.Where(x => x.Name.ToUpper() == "ACA").FirstOrDefault().Value;
    //                acad = int.Parse(acad).ToString();
    //                if (acad != num_academie.ToString()) continue;


    //                data_acad.IsModified = true;
    //                year = table.COLUMN.Where(x => x.Name.ToUpper() == "ANNEE").FirstOrDefault().Value;

    //                int index = data_acad.Year.IndexOf(year);

    //                i = table.COLUMN.Where(x => x.Name.ToUpper() == "I").FirstOrDefault().Value;

    //                var t = table.COLUMN.Where(x => !String.IsNullOrEmpty(x.Value) && !allvar.Contains(x.Name.ToUpper())).ToList();

    //                foreach (var item in t)
    //                {
    //                    var variable = item.Name;

    //                    variable += "_I_" + i;
    //                    variable = variable.ToUpper();

    //                    double val = double.Parse(item.Value.Replace(".", ","), new CultureInfo("fr-FR"));
    //                    if (!series.ContainsKey(variable)) series[variable] = zeros(index + 1);
    //                    series[variable][index] = val;
    //                }

    //            }

    //            foreach (var table in matrice.COEFLMD)
    //            {
    //                acad = table.COLUMN.Where(x => x.Name.ToUpper() == "ACA").FirstOrDefault().Value;
    //                acad = int.Parse(acad).ToString();
    //                if (acad != num_academie.ToString()) continue;

    //                data_acad.IsModified = true;
    //                year = table.COLUMN.Where(x => x.Name.ToUpper() == "ANNEE").FirstOrDefault().Value;

    //                int index = data_acad.Year.IndexOf(year);

    //                j = table.COLUMN.Where(x => x.Name.ToUpper() == "J").FirstOrDefault().Value;

    //                var t = table.COLUMN.Where(x => !String.IsNullOrEmpty(x.Value) && !allvar.Contains(x.Name.ToUpper())).ToList();

    //                foreach (var item in t)
    //                {
    //                    if (item.Value == null) continue;
    //                    var variable = item.Name;

    //                    variable += "_IJ_1:9," + j;
    //                    variable = variable.ToUpper();

    //                    double val = double.Parse(item.Value.Replace(".", ","), new CultureInfo("fr-FR"));
    //                    if (!series.ContainsKey(variable)) series[variable] = zeros(index + 1);
    //                    series[variable][index] = val;
    //                }
    //            }

    //            foreach (var table in matrice.MAT_TAUX150)
    //            {
    //                acad = table.COLUMN.Where(x => x.Name.ToUpper() == "ACA").FirstOrDefault().Value;
    //                acad = int.Parse(acad).ToString();
    //                if (acad != num_academie.ToString()) continue;

    //                data_acad.IsModified = true;
    //                year = table.COLUMN.Where(x => x.Name.ToUpper() == "ANNEE").FirstOrDefault().Value;

    //                int index = data_acad.Year.IndexOf(year);

    //                var t = table.COLUMN.Where(x => !String.IsNullOrEmpty(x.Value) && !allvar.Contains(x.Name.ToUpper())).ToList();

    //                foreach (var item in t)
    //                {
    //                    if (item.Value == null) continue;
    //                    var variable = item.Name;
    //                    variable = variable.ToUpper();

    //                    double val = double.Parse(item.Value.Replace(".", ","), new CultureInfo("fr-FR"));
    //                    if (!series.ContainsKey(variable)) series[variable] = zeros(index + 1);
    //                    series[variable][index] = val;

    //                }
    //            }


    //            List<int> national = new List<int>();

    //            /*foreach (var item in AcademyData)
    //            {
    //                if (!data.ContainsKey(item.aca.ToString()))
    //                {
    //                    data.Add(item.aca.ToString(), item);

    //                    if (Academy.Contains(int.Parse(item.aca))) national.Add(int.Parse(item.aca));
    //                }
    //            }*/

    //            //if (national.Count != 0)
    //            //{
    //            foreach (var table in matrice.MAT_ACAPART)
    //            {
    //                year = table.COLUMN.Where(x => x.Name.ToUpper() == "ANNEE").FirstOrDefault().Value;

    //                /*
    //                Dictionary<int, int> index = new Dictionary<int, int>();

    //                foreach (var item in national)
    //                {
    //                    if (item.ToString() == num_academie.ToString())
    //                    {
    //                        index.Add(item, data_acad.Year.IndexOf(year));
    //                    }

    //                }
    //                */
    //                int indexYear = data_acad.Year.IndexOf(year);

    //                curs = table.COLUMN.Where(x => x.Name.ToUpper() == "CURSUS").FirstOrDefault().Value;
    //                eff = table.COLUMN.Where(x => x.Name.ToUpper() == "EFFECTIFTOTAL").FirstOrDefault().Value;
    //                a = table.COLUMN.Where(x => x.Name.ToUpper() == "A").FirstOrDefault().Value;
    //                a = int.Parse(a).ToString();
    //                j = table.COLUMN.Where(x => x.Name.ToUpper() == "J").FirstOrDefault().Value;

    //                var t = table.COLUMN;
    //                var newt = t.Where(x => !String.IsNullOrEmpty(x.Value) && !allvar.Contains(x.Name.ToUpper())).FirstOrDefault();

    //                if (newt == null) continue;

    //                var res = double.Parse(newt.Value.ToString().Replace(".", ","), new CultureInfo("fr-FR")) *
    //                    double.Parse(eff.ToString().Replace(".", ","), new CultureInfo("fr-FR"));

    //                string variable = newt.Name.ToUpper();
    //                variable += "_JA_" + j + "," + a;
    //                var ind = "_JA_" + j + "," + a;

    //                //foreach (var idx in national)
    //                {
    //                    //if (idx == num_academie)
    //                    {
    //                        double newVal = double.Parse(newt.Value.ToString().Replace(".", ","), new CultureInfo("fr-FR"));
    //                        if (!series.ContainsKey(variable)) series[variable] = zeros(indexYear + 1);
    //                        series[variable][indexYear] = newVal;

    //                        string newvariable = "EFF_" + curs.ToUpper() + ind;
    //                        Serie serieEff = new Serie();
    //                        if (!series.ContainsKey(newvariable)) series[newvariable] = zeros(indexYear + 1);
    //                        series[newvariable][indexYear] = res;
    //                    }
    //                }
    //            }

    //            return int.Parse(year);

    //            //}
    //        }

    //        private static List<double> zeros(int size)
    //        {
    //            List<double> l = new List<double>();
    //            for (int i = 0; i < size; i++) l.Add(0);
    //            return l;
    //        }

    //        public static void CalculDataNew(int num_academie, int year)
    //        {
    //            List<string> dossier;
    //            if (year < 18)
    //            {
    //                if (num_academie != 70) dossier = new List<string> { "Constat", "Diplome" };
    //                else dossier = new List<string> { "Constat", "Diplome", "Academie" };
    //            }
    //            else
    //            {
    //                if (num_academie != 70) dossier = new List<string> { "Constat", "Entrant", "1", "2", "3", "4", "5", "6", "Diplome" };
    //                else dossier = new List<string> { "Constat", "Entrant", "1", "2", "3", "4", "5", "6", "Diplome", "Academie" };
    //            }

    //            int nbHypo = 0, nbModels = 0, nbRes = 0;
    //            foreach (var degre in dossier)
    //            {
    //                CalculContexteNew.openXML(num_academie != 70, degre, false, year, year);
    //                nbHypo += CalculContexteNew.listHypo.Var.Count;
    //                nbModels += CalculContexteNew.listModel.Calcul.Count;
    //                nbRes += CalculContexteNew.listRes != null ? CalculContexteNew.listRes.Var.Count : 0;
    //                CalculContexteNew.openXML(num_academie != 70, degre, true, year, year);
    //                nbHypo += CalculContexteNew.listHypo.Var.Count;
    //                nbModels += CalculContexteNew.listModel.Calcul.Count;
    //                nbRes += CalculContexteNew.listRes != null ? CalculContexteNew.listRes.Var.Count : 0;
    //            }
    //            //MainController.progress.NbHypotheses = 3 * nbHypo;
    //            //MainController.progress.NbModeles = 2 * nbModels;
    //            //MainController.progress.NbResultats = nbRes;
    //            //MainController.progress.CurrentHypothese = 0;
    //            //MainController.progress.CurrentModele = 0;
    //            //MainController.progress.CurrentResultat = 0;

    //            int nbYears = data_acad.Year.Count + 1;

    //            foreach (var degre in dossier) {
    //                CalculContexteNew.calcul(num_academie != 70, degre, false, year, year, nbYears, false);
    //                CalculContexteNew.calcul(num_academie != 70, degre, true, year, year, nbYears, false);
    //            }
    //            CalculContexteNew.calculLMD(); // Todo test décommenter

    //        }

    //        static double RecursiveMere(Vari variable, bool toIJ, int year)
    //        {
    //            var v = variable.Label;
    //            if (toIJ)
    //            {
    //                if (v.Contains("_J_")) v = v.Replace("_J_", "_IJ_1:9,");
    //            }
    //            Serie newvar = new Serie();
    //            if (!series.ContainsKey(v)) return 0;

    //            if (variable.Type == "Data" || variable.Vars.Count == 0)
    //            {
    //                return double.Parse(series[v][year].ToString().Replace('.',','), new CultureInfo("fr-FR"));
    //            }
    //            else
    //            {
    //                double list = 0;
    //                foreach (var item in variable.Vars)
    //                {
    //                    var rec = RecursiveMere(item, toIJ, year);
    //                    list = calc(rec, list);
    //                    if (v.StartsWith("P_ACA") && list >= 1) list = 1;
    //                }
    //                series[v][year] = list;
    //                return list;
    //            }
    //        }

    //        static double calc(double rec, double res)
    //        {
    //            return double.Parse(rec.ToString().Replace('.', ','), new CultureInfo("fr-FR")) + double.Parse(res.ToString().Replace('.', ','), new CultureInfo("fr-FR"));
    //        }

    //        static void Convert2UTF8(string filename)
    //        {
    //            string tmpfile = Path.Combine(path, "tmp");
    //            string[] lines = File.ReadAllLines(filename);
    //            if (lines[0].Substring(0, 5) == @"<?xml") lines[0] = @"<?xml version=""1.0"" encoding=""UTF-8"" ?>";
    //            File.WriteAllLines(tmpfile, lines);
    //            File.Delete(filename);
    //            File.Move(tmpfile, filename);
    //            lines = null;
    //            GC.Collect();
    //            GC.WaitForPendingFinalizers();
    //        }




}
