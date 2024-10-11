using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Models
{
    public class ContexteCalcul
    {
        public static List<Serie> serie = new List<Serie>();
        public static Dictionary<string, List<double>> series = new Dictionary<string, List<double>>();
        public static void CalculModel(Calcul variable, Dictionary<string, object> temp, int annee, int lastConstat)
        {
            var v = variable.Label;
            v = v.Contains("_J_") ? v.Replace("_J_", "_IJ_1:9,") : v;

            Serie varM = new Serie();
            if (v.Contains("temp"))
            {
                if (!temp.ContainsKey(v)) temp.Add(v,0);
                varM = null;
            }
            else
            {
                if (series.ContainsKey(v)) varM = new Serie() { Variable = v, Values = series[v] };
                else return;
            }

            double res = 0;
            int newannee = annee;
            if (variable.Fun != null) newannee = variable.Fun.ToUpper().Contains("PR") ? annee - 1 : annee;
            else variable.Fun = "Sigma";

            int tempAnnee = annee;
            bool test = true;
            foreach (var item in variable.Var)
            {
                if (!test) tempAnnee = newannee;
                var newvar = item.Label;
                newvar = newvar.Contains("_J_") ? newvar.Replace("_J_", "_IJ_1:9,") : newvar;

                var newvarM = new Serie();

                double val = 0;
                if (series.ContainsKey(newvar))
                {
                    if (newvar.Contains("COEF")) {
                        series[newvar][annee] = series[newvar][lastConstat]; // si on reconduit les valeurs
                        // sinon
                        //var newsd = double.Parse(series[newvar][annee].ToString().Replace(".",",") , new CultureInfo("fr-FR"));
                        //if(newsd == 0) series[newvar][annee] = series[newvar][lastConstat];
                    }
                    newvarM = new Serie() { Variable = newvar, Values = series[newvar] };
                    var val2 = newvarM.Values[tempAnnee].ToString();
                    if (val2.ToString() == "Infinity") val2 = "0";
                    val = double.Parse(val2.Replace('.', ','), new CultureInfo("fr-FR"));

                }
                else
                {
                    if (temp.ContainsKey(newvar)) val = double.Parse(temp[newvar].ToString().Replace('.', ','), new CultureInfo("fr-FR"));
                    else break;
                }

                if (double.IsInfinity(val) || double.IsNaN(val)) val = 0;

                res = CalcPondere(res, val, variable.Fun, test);
                test = false;
                if (newvarM == null) temp[newvar] = res;
            }

            if (temp.ContainsKey(v)) temp[v] = res;
            else
            {
                varM.Values[annee] = res;
                series[v] = varM.Values;
            }
        }

        private static double CalcPondere(double res, double val, string op, bool test)
        {
            if (test) return val;
            if (op.ToLower().Contains("mult")) return double.Parse(res.ToString().Replace('.', ','), new CultureInfo("fr-FR")) * double.Parse(val.ToString().Replace('.', ','), new CultureInfo("fr-FR"));
            else if (op.ToLower().Contains("sum") || op.ToLower().Contains("sigma")) return double.Parse(res.ToString().Replace('.', ','), new CultureInfo("fr-FR")) + double.Parse(val.ToString().Replace('.', ','), new CultureInfo("fr-FR"));
            else if (op.ToLower().Contains("moins")) return double.Parse(res.ToString().Replace('.', ','), new CultureInfo("fr-FR")) - double.Parse(val.ToString().Replace('.', ','), new CultureInfo("fr-FR"));
            else
            {
                double tmp = 0;
                tmp = double.Parse(res.ToString().Replace('.', ','), new CultureInfo("fr-FR")) / double.Parse(val.ToString().Replace('.', ','), new CultureInfo("fr-FR"));

                if (double.IsNaN(tmp) || double.IsInfinity(tmp)) return 0;
                else return tmp;
            }
        }

        public static double CalculRecursive(Vari variable, Dictionary<string, object> temp, int annee, Dictionary<string, string> CPonderation, int lastConstat)
        {
            var v = variable.Label;

            v = v.Contains("_J_") ? v.Replace("_J_", "_IJ_1:9,") : v;

            var newv = Tools.GetMereVariable(v);
            var ponderation = CPonderation.ContainsKey(newv) ? CPonderation[newv] : "";

            
            var split = v.Split('_');
            var endIndex = "_"+split[split.Length - 1];

            var newvar = new Serie();

            var anneePr = annee;


            if (series.ContainsKey(v)) newvar = new Serie() { Variable = v, Values = series[v] };
            else return 0;

            if (v.Contains("P_ACA"))
            {
                //series[v][annee] = series[v][lastConstat];
                var newsd = double.Parse(series[v][annee].ToString().Replace(".",",") , new CultureInfo("fr-FR"));
                if(newsd == 0) series[v][annee] = series[v][lastConstat];
            }

            if (variable.Type == "Data" || variable.Vars.Count == 0)
            {
                if (newvar.Values[annee].ToString() == "Infinity") return 0;
                return double.Parse(newvar.Values[annee].ToString().Replace('.',','), new CultureInfo("fr-Fr"));
            }
            else
            {
                double res = 0;
                if (ponderation == "")
                {
                    foreach (var item in variable.Vars)
                    {
                        var rec = CalculRecursive(item, temp, annee, CPonderation, lastConstat);
                        if (double.IsInfinity(rec) || double.IsNaN(rec)) rec = 0;
                        res = calc(rec, res);
                    }
                    if (v.StartsWith("P_ACA") && res >= 1) res = 1;
                }
                else
                {
                    foreach (var item in variable.Vars)
                    {
                        var rec = CalculRecursive(item, temp, annee, CPonderation, lastConstat);
                        if (double.IsInfinity(rec) || double.IsNaN(rec)) rec = 0;
                        res = calcPondere(rec, res, annee, item.Label, CPonderation);
                    }
                    if (ponderation.Contains("+"))
                    {
                        var sp = ponderation.Split('+');

                        var nvar = sp[0] + endIndex;
                        var nvar1 = sp[1] + endIndex;

                        var pondSerie = new Serie();
                        var pondSerie1 = new Serie();
                        if (series.ContainsKey(nvar) && series.ContainsKey(nvar1))
                        {
                            pondSerie = new Serie() { Variable = nvar, Values = series[nvar] };
                            pondSerie1 = new Serie() { Variable = nvar1, Values = series[nvar1] };
                        }

                        if (!String.IsNullOrEmpty(pondSerie.Variable) && !String.IsNullOrEmpty(pondSerie1.Variable))
                        {
                            double val = double.Parse(pondSerie.Values[annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")) +
                                double.Parse(pondSerie1.Values[annee].ToString().Replace(".", ","), new CultureInfo("fr-FR"));

                            res /= val;
                        }
                    }
                    else
                    {
                        if (ponderation.Contains("[an-1]"))
                        {
                            ponderation = ponderation.Replace("[an-1]", "");
                            anneePr = anneePr - 1;
                        }

                        var IJPond = Tools.GetIJ(ponderation, 0);
                        var IJ = Tools.GetIJ(v, 1);

                        if (IJPond == "I" && IJ == "IJ")
                        {
                            if (endIndex.Contains(",")) endIndex = endIndex.Split(',')[0];
                        }
                        /*else if (IJPond == "IJ" && IJ == "JI")
                        {
                            endIndex = endIndex.Replace("_", "");
                            var splt = endIndex.Split(',');
                            endIndex = "_" + splt[1] + "," + splt[0];
                        }*/
                        else if (IJPond == "I200" || IJPond == "I300" || IJPond == "I400")
                        {
                            var ind = IJPond.Substring(1);
                            ponderation = ponderation.Replace(IJPond, "IJ");
                            endIndex = "_1:9," + ind;
                        }

                        var nvar = ponderation + endIndex;
                        var pondSerie = new Serie();
                        if (series.ContainsKey(nvar)) pondSerie = new Serie() { Variable = nvar, Values = series[nvar] };

                        if (!String.IsNullOrEmpty(pondSerie.Variable)) res /= double.Parse(pondSerie.Values[anneePr].ToString().Replace(".", ","), new CultureInfo("fr-FR"));
                        else res = 0;
                    }

                    
                }

                if (double.IsNaN(res) || double.IsInfinity(res)) res = 0;
                series[v][annee] = res;
                var rere = series[v];
                return res;
            }
        }

        private static double calc(double rec, double res)
        {
            return double.Parse(rec.ToString().Replace('.', ','), new CultureInfo("fr-FR")) + double.Parse(res.ToString().Replace('.', ','), new CultureInfo("fr-FR"));
        }
        private static double calcPondere(double rec, double res, int annee, string variable, Dictionary<string, string> CPonderation)
        {
            variable = variable.Contains("_J_") ? variable.Replace("_J_", "_IJ_1:9,") : variable;

            var newv = Tools.GetMereVariable(variable);
            var ponderation = CPonderation.ContainsKey(newv) ? CPonderation[newv] : "";

            var split = variable.Split('_');
            var endIndex = "_" + split[split.Length - 1];
            var anneePr = annee;
            if (ponderation.Contains("+"))
            {
                var sp = ponderation.Split('+');

                var nvar = sp[0] + endIndex;
                var nvar1 = sp[1] + endIndex;

                var pondSerie = new Serie();
                var pondSerie1 = new Serie();
                if (series.ContainsKey(nvar) && series.ContainsKey(nvar1))
                {
                    pondSerie = new Serie() { Variable = nvar, Values = series[nvar] };
                    pondSerie1 = new Serie() { Variable = nvar1, Values = series[nvar1] };
                }

                if (!String.IsNullOrEmpty(pondSerie.Variable) && !String.IsNullOrEmpty(pondSerie1.Variable))
                {
                    double val = double.Parse(pondSerie.Values[annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")) +
                        double.Parse(pondSerie1.Values[annee].ToString().Replace(".", ","), new CultureInfo("fr-FR"));

                    return double.Parse(res.ToString().Replace('.', ','), new CultureInfo("fr-FR")) + (double.Parse(rec.ToString().Replace('.', ','), new CultureInfo("fr-FR")) * val);
                }
            }
            else
            {
                if (ponderation.Contains("[an-1]"))
                {
                    ponderation = ponderation.Replace("[an-1]", "");
                    anneePr = anneePr - 1;
                }

                var IJPond = Tools.GetIJ(ponderation, 0);
                var IJ = Tools.GetIJ(variable, 1);

                if (IJPond == "I" && IJ == "IJ")
                {
                    if (endIndex.Contains(",")) endIndex = endIndex.Split(',')[0];
                }
                /*else if (IJPond == "IJ" && IJ == "JI")
                {
                    endIndex = endIndex.Replace("_", "");
                    var split = endIndex.Split(',');
                    endIndex = "_" + split[1] + "," + split[0];
                }*/
                else if (IJPond == "I200" || IJPond == "I300" || IJPond == "I400")
                {
                    var ind = IJPond.Substring(1);
                    ponderation = ponderation.Replace(IJPond, "IJ");
                    endIndex = "_1:9," + ind;
                }


                var nvar = ponderation + endIndex;
                var pondSerie = new Serie();
                if (series.ContainsKey(nvar)) pondSerie = new Serie() { Variable = nvar, Values = series[nvar] };
                if (!String.IsNullOrEmpty(pondSerie.Variable)) return double.Parse(res.ToString().Replace('.', ','), new CultureInfo("fr-FR")) + (double.Parse(rec.ToString().Replace('.', ','), new CultureInfo("fr-FR")) * double.Parse(pondSerie.Values[anneePr].ToString().Replace(".", ","), new CultureInfo("fr-FR")));
                else return 0;
            }
            return 0;
        }
    }
}
