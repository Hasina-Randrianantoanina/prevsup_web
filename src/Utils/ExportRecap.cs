using CsvHelper;
using CsvHelper.Configuration;
using prevsup.Models;
using prevsup.ViewModel;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace prevsup.Utils
{
    public class ExportRecap
    {

        public string RootPath { get; set; }
        public Recapitulatif Recap { get; set; }
        public ScenarioViewModel Scenario { get; set; }
        public ModelTreeRecap Res { get; set; }
        public string RecapType { get; set; }

        public ExportRecap(string rootPath, Recapitulatif recap, string recapType, ScenarioViewModel scenario)
        {
            RootPath = rootPath;
            Recap = recap;
            RecapType = recapType;
            Scenario = scenario;
            Init();
        }

        private void Init()
        {
            Res = Recapitulatif.CreateTree(Recap.Series, Path.Combine(RootPath, "Summary"), Scenario, Recap.Id);
            var seriesDict = GenUtils.SerieToDico(Recap.Series);
            if(RecapType.Equals("eff")) FillData(seriesDict, Res.EffectifLMD);
            else if(RecapType.Equals("acc")) FillData(seriesDict, Res.AccademieLMD);
            else if (RecapType.Equals("dip")) FillData(seriesDict, Res.DiplomeLMD);
        }

        private void FillData(Dictionary<string, List<double>> seriesDict, List<RecapitulatifTreeModel> data)
        {
            foreach (var serie in data)
            {
                if (seriesDict.ContainsKey(serie.label))
                {
                    serie._data = seriesDict[serie.label];
                }
                else serie._data = new List<double>(new double[Scenario.lastYears - Scenario.firstYears + 1]);
            }
        }

        public string WriteToCSV()
        {
            var config = new CsvConfiguration(CultureInfo.CurrentCulture) { Delimiter = ";" };
            string fileName = "Recapitulatif_" + Recap.Name + "_" + DateTime.Now.ToString("dd_MM_yyyy") + ".csv";
            string path = Path.Combine(RootPath, "FileCSV", fileName);
            using (var writer = new StreamWriter(path, false, Encoding.UTF8))
            {
                using (var csv = new CsvWriter(writer, config))
                {
                    List<string> Header = new List<string>();
                    if (RecapType.Equals("eff")) csv.WriteField("Effectif LMD");
                    else if (RecapType.Equals("acc")) csv.WriteField("Académie LMD");
                    else if (RecapType.Equals("dip")) csv.WriteField("Diplômé LMD");

                    string[] val = new string[Res.YearsEff.Count + 1];
                    foreach (var resz in Res.YearsEff)
                    {
                        csv.WriteField("" + resz);
                    }
                    csv.NextRecord();

                    List<RecapitulatifTreeModel> treeModels = null;
                    if (RecapType.Equals("eff")) treeModels = Res.EffectifLMD;
                    else if (RecapType.Equals("dip")) treeModels = Res.DiplomeLMD;
                    else if (RecapType.Equals("acc")) treeModels = Res.AccademieLMD;

                    foreach (RecapitulatifTreeModel tree in treeModels)
                    {
                        csv.WriteField(tree.displayLabel);
                        string label = tree.label;
                        bool isTaux = label.StartsWith("T_") || label.StartsWith("P_") || label.StartsWith("ANC");
                        foreach (var ka in tree._data)
                        {
                            string s = ka.ToString();
                            //_ka = tree.Name + ":" + s;
                            if (s != "Infinity")
                            {
                                double d = double.Parse(ka.ToString().Replace(".", ","), new CultureInfo("fr-FR"));
                                s = isTaux ? d.ToString("0.000000") : ((int)Math.Round(d)).ToString();
                                csv.WriteField(s);
                            }
                            else
                            {
                                s = "";
                                csv.WriteField(s);
                            }
                        }
                        csv.NextRecord();
                    }
                }
            }
            return fileName;
        }
    }
}
