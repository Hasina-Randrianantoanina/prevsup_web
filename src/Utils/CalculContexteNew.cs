using prevsup.Controllers;
using prevsup.Models;
using prevsup.ViewModel;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace prevsup.Utils
{
    public class CalculContexteNew
    {
        //public static Dictionary<string, List<double>> series;
        //private static int nbAnnees, iAnnee;
        //private static bool easy;
        //private static Calculs listModelConstat;
        //public static Variablesi listHypo;
        //public static Calculs listModel;
        //public static Variablesi listRes;
        //private static bool isPrevision;

        //private static double _d(double o)
        //{
        //    return o;
        //    //return double.Parse(o.ToString().Replace(".", ","), new CultureInfo("fr-FR"));
        //}
        //private static List<double> zeros(int size)
        //{
        //    List<double> l = new List<double>();
        //    for (int i = 0; i < size; i++) l.Add(0);
        //    return l;
        //}
        //public static void calculLMD()
        //{
        //    string webRootPath = MainController._hostingEnvironment.WebRootPath;
        //    XmlSerializer xmlModelConstat = new XmlSerializer(typeof(Calculs));
        //    string filename = webRootPath + "/Summary/projAcaLMDModel.xml";
        //    var stream = new FileStream(filename, FileMode.Open, FileAccess.Read);
        //    Calculs modelLMD = (Calculs)xmlModelConstat.Deserialize(stream);
        //    stream.Close();
        //    // Kaky - 27/06/2022 - Pour éviter un IndexOutOfBondException
        //    iAnnee--;

        //    foreach (var v in modelLMD.Calcul)
        //    {
        //        ProcessCalcul(v, 3, "lmd");
        //    }

        //}
        //public static void openXML(bool isAcademy, string degre, bool easy, int dep_year, int fin_year)
        //{
        //    CalculContexteNew.easy = easy;
        //    string webRootPath = MainController._hostingEnvironment.WebRootPath;
        //    string file;
        //    if (degre == "Constat")
        //    {
        //        file = "Constat";
        //        if (!isAcademy) file += "Nat";
        //    }
        //    else if (degre == "Entrant")
        //    {
        //        file = "CtxEntrant";
        //        if (!isAcademy) file += "National";
        //    }
        //    else if (degre == "Diplome")
        //    {
        //        file = "CtxDiplomes";
        //    }
        //    else if (degre == "Academie")
        //    {
        //        file = "CtxAcademie";
        //    }
        //    else
        //    {
        //        if (degre == "1") easy = false;
        //        file = "CtxDegre" + degre + (easy ? "Simpl" : "") + (isAcademy ? "" : "Nat");
        //    }
        //    string item = file;
        //    string filename;
        //    FileStream stream;

        //    /*XmlSerializer xmlModelConstat = new XmlSerializer(typeof(Calculs));
        //    filename = webRootPath + "/Calcule/Constat/model.xml";
        //    stream = new FileStream(filename, FileMode.Open, FileAccess.Read);
        //    listModelConstat = (Calculs)xmlModelConstat.Deserialize(stream);
        //    stream.Close();*/

        //    XmlSerializer xmlHypo = new XmlSerializer(typeof(Variablesi));
        //    filename = webRootPath + "/Calcule/" + item + "/hypo.xml";
        //    stream = new FileStream(filename, FileMode.Open, FileAccess.Read);
        //    listHypo = (Variablesi)xmlHypo.Deserialize(stream);
        //    stream.Close();

        //    XmlSerializer xmlModel = new XmlSerializer(typeof(Calculs));
        //    filename = webRootPath + "/Calcule/" + item + "/model.xml";
        //    stream = new FileStream(filename, FileMode.Open, FileAccess.Read);
        //    listModel = (Calculs)xmlModel.Deserialize(stream);
        //    stream.Close();

        //    listRes = null;
        //    if (degre != "Constat")
        //    {
        //        XmlSerializer xmlRes = new XmlSerializer(typeof(Variablesi));
        //        filename = webRootPath + "/Calcule/" + item + "/res.xml";
        //        stream = new FileStream(filename, FileMode.Open, FileAccess.Read);
        //        listRes = (Variablesi)xmlRes.Deserialize(stream);
        //        stream.Close();
        //    }
        //}
        //public static void calcul(bool isAcademy, string degre, bool easy, int dep_year, int fin_year, int _nbAnnees = 0, bool _isPrevision = true)
        //{
        //    isPrevision = _isPrevision;
        //    openXML(isAcademy, degre, easy, dep_year, fin_year);

        //    if(series.ContainsKey("ANCINSC_N0_IJ_1:9,900")) nbAnnees = series["ANCINSC_N0_IJ_1:9,900"].Count;
        //    else
        //    {
        //        nbAnnees = _nbAnnees;
        //    }


        //    for (iAnnee = dep_year; iAnnee <= fin_year; iAnnee++)
        //    {
        //        foreach (var v in listHypo.Var)
        //        {
        //            //MainController.progress.CurrentHypothese++;
        //            ProcessVar(v);
        //        }
        //        foreach (var v in listModel.Calcul)
        //        {
        //            //MainController.progress.CurrentModele++;
        //            if (v.Label.StartsWith("ENT_") && degre == "Constat") continue;
        //            ProcessCalcul(v, 2, degre);
        //        }
        //        foreach (var v in listHypo.Var)
        //        {
        //            //MainController.progress.CurrentHypothese++;
        //            ProcessVar(v);
        //        }
        //        if (listRes != null)
        //        {
        //            foreach (var v in listRes.Var)
        //            {
        //                //MainController.progress.CurrentResultat++;
        //                ProcessVar(v);
        //            }
        //        }

        //        foreach (var v in listModel.Calcul)
        //        {
        //            //MainController.progress.CurrentModele++;
        //            if (v.Label.StartsWith("ENT_") && degre == "Constat") continue;
        //            ProcessCalcul(v, 2, degre);
        //        }
        //        foreach (var v in listHypo.Var)
        //        {
        //            //MainController.progress.CurrentHypothese++;
        //            ProcessVar(v);
        //        }
        //    }
        //    GC.Collect();
        //    GC.WaitForPendingFinalizers();

        //}

        //private static void CalculVar(Vari v, int level)
        //{
        //    if (v.Type == "Data") return;
        //    if (v.Vars.Count == 0) return;

        //    foreach (var vi in v.Vars)
        //    {
        //        CalculVar(vi, level + 1);
        //    }
        //    if (v.Type != null && v.Type == "Sum")
        //    {
        //        double val = 0;
        //        for (int i = 0; i < v.Vars.Count; i++)
        //        {
        //            if (!series.ContainsKey(v.Vars[i].Label)) continue; // TEST
        //            val += _d(series[v.Vars[i].Label][iAnnee]);
        //        }
        //        if (!series.ContainsKey(v.Label))
        //        {
        //            series[v.Label] = zeros(nbAnnees);
        //        }
        //        series[v.Label][iAnnee] = val;
        //    }
        //}

        //private static string _IJ_(string v)
        //{
        //    if (!v.StartsWith("temp")) v = v.Replace("_J_", "_IJ_1:9,");
        //    return v;
        //}

        //private static void ProcessCalcul(Calcul variable, int step, string degre)
        //{
        //    foreach (var v in variable.Var)
        //    {
        //        CalculVar(v, 1);
        //    }
        //    string vLabel = variable.Label; //vLabel = vLabel.Replace("_I_", "_IJ_1:9,");
        //    string vLabel1 = _IJ_(vLabel);
            
          
        //    if (!series.ContainsKey(vLabel))
        //    {
        //        series[vLabel] = zeros(nbAnnees);
        //    }

        //    if(!series.ContainsKey(vLabel1))
        //    {
        //        series[vLabel1] = zeros(nbAnnees);
        //    }


        //    string fun = variable.Fun;
        //    if (fun != null && fun.StartsWith("Sigma") || variable.Type != null && variable.Type.StartsWith("Sum"))
        //    {
        //        double val = 0;
        //        for (int i = 0; i < variable.Var.Count; i++)
        //        {
        //            string op = _IJ_(variable.Var[i].Label);
        //            if (!series.ContainsKey(op)) series[op] = zeros(nbAnnees); // TEST
        //            val += _d(series[op][iAnnee]);
        //        }
        //        series[vLabel][iAnnee] = val;
        //    }
        //    string fun1 = fun != null ? fun.Replace("Pr", "") : "";
        //    if (fun != null && (fun1 == "Mult" || fun1 == "Div" || fun1 == "Moins"))
        //    {
        //        string op1 = _IJ_(variable.Var[0].Label), op2 = _IJ_(variable.Var[1].Label);
        //        int iAnnee_1 = iAnnee - (iAnnee > 0 && fun.EndsWith("Pr") ? 1 : 0);
        //        int iAnnee_pr = iAnnee; if (iAnnee_pr > 0) iAnnee_pr--;
        //        if (!series.ContainsKey(op1)) return; // TEST
        //        if (!series.ContainsKey(op2)) return; // TEST
        //        if (op2.StartsWith("COEF") && isPrevision) series[op2][iAnnee] = series[op2][iAnnee_pr];
        //        if (fun1 == "Div" && _d(series[op2][iAnnee_1]) == 0) series[vLabel][iAnnee] = 0;
        //        else
        //        {
        //            double v = 0, v1 = _d(series[op1][iAnnee]), v2 = _d(series[op2][iAnnee_1]);
        //            if (fun1 == "Mult") v = v1 * v2;
        //            else if (fun1 == "Div") v = v1 / v2;
        //            else if (fun1 == "Moins") v = v1 - v2;
        //            series[vLabel][iAnnee] = v;
        //        }
        //    }
        //    series[_IJ_(vLabel)][iAnnee] = series[vLabel][iAnnee];
        //}

        //private static void ProcessVar(Vari v)
        //{
        //    string label = v.Label;
        //    if (!series.ContainsKey(label)) { series[label] = zeros(nbAnnees); }
        //    foreach (var x in v.Vars)
        //    {
        //        ProcessVar(x);
        //    }
        //    if (v.Type != null && v.Type == "Sum")
        //    {
        //        double sum = 0;
        //        foreach (var x in v.Vars) {
        //            string iLabel = x.Label; 
        //            if (!iLabel.StartsWith("temp") && iLabel.Contains("_J_")) {
        //                iLabel = iLabel.Replace("_J_", "_IJ_1:9,");
        //                if(!series.ContainsKey(iLabel)) series[iLabel] = zeros(nbAnnees);
        //            }
        //            sum += _d(series[iLabel][iAnnee]);
        //        }
        //        series[label][iAnnee] = sum;
        //        if (!label.StartsWith("temp") && label.Contains("_J_"))
        //        {
        //            string nLabel = label.Replace("_J_", "_IJ_1:9,");
        //            if (!series.ContainsKey(nLabel)) { series[nLabel] = zeros(nbAnnees); }
        //            series[nLabel][iAnnee] = series[label][iAnnee];
        //        }
        //    }
        //}

    }
}
