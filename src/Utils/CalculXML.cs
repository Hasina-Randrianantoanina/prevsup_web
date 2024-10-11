using prevsup.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace prevsup.Utils
{
    public class CalculModelXML
    {
        public static void CalculVariables(Calcul variable, List<Serie> series, int deb)
        {
            var v = variable.Label;
            if (v.Contains("_J_")) v = v.Replace("_J_", "_IJ_1:9,");
            var varm = series.Where(x => x.Variable == v).FirstOrDefault();
            if (varm == null) return;

            var list = new List<double>();
            foreach (var item in variable.Var)
            {
                var va = item.Label;
                if (va.Contains("_J_")) va = va.Replace("_J_", "_IJ_1:9,");
                var newvar = series.Where(x => x.Variable == va).FirstOrDefault();
                if (newvar == null) return;
                if (newvar.Variable.Contains("COEF"))
                {
                    for (int i = deb; i < newvar.Values.Count; i++)
                    {
                        newvar.Values[i] = 1;
                    }
                }
                var val = newvar.Values;
                list = calcContextModel(list, val, variable.Fun, deb);
            }

            for (int i = deb; i < varm.Values.Count; i++)
            {
                varm.Values[i] = list[i];
            }
        }
        public static List<double> calcContextModel(List<double> a, List<double> b, string op, int deb)
        {
            bool isFirst = false;
            if (a.Count == 0) isFirst = true;
            var l = new List<double>();
            var c = Math.Max(a.Count, b.Count);
            while (a.Count < c) a.Add(0);
            while (b.Count < c) b.Add(0);
            l = new List<double>(a);

            if (isFirst)
            {
                return b; //  l = b;
            }
            else
            {
                switch (op)
                {
                    case "Mult":
                        for (int i = deb; i < c; i++)
                        {
                            /*l[i] = double.Parse(a[i].ToString().Replace('.', ','), new CultureInfo("fr-FR")) *
                                double.Parse(b[i].ToString().Replace('.', ','), new CultureInfo("fr-FR"));*/
                            l[i] = a[i] * b[i];
                        }

                        break;
                    case "Div":
                        for (int i = deb; i < c; i++)
                        {
                            double res = 0;
                            /*res = double.Parse(a[i].ToString().Replace('.', ','), new CultureInfo("fr-FR")) /
                                double.Parse(b[i].ToString().Replace('.', ','), new CultureInfo("fr-FR"));*/
                            res = a[i] / b[i];

                            if (double.IsNaN(res) || double.IsInfinity(res)) l[i] = 0;
                            else l[i] = res;
                        }
                        break;
                    case "Sigma":
                        for (int i = deb; i < c; i++)
                        {
                            /*l[i] = double.Parse(a[i].ToString().Replace('.', ','), new CultureInfo("fr-FR")) +
                                double.Parse(b[i].ToString().Replace('.', ','), new CultureInfo("fr-FR"));*/
                            l[i] = a[i] + b[i];
                        }
                        break;
                    default: break;
                }
            }


            return l;
        }

        public static List<double> RecursiveMere(Vari variable, List<Serie> series, int deb)
        {
            var v = variable.Label;
            if (v.Contains("_J_")) v = v.Replace("_J_", "_IJ_1:9,");

            var newvar = series.Where(x => x.Variable == v).FirstOrDefault();
            if (newvar == null)
            {
                return new List<double>();
            }
            if (variable.Type == "Data" || variable.Vars.Count == 0)
            {
                return newvar.Values;
            }
            else
            {
                List<double> list = new List<double>();
                foreach (var item in variable.Vars)
                {
                    var rec = RecursiveMere(item, series,deb);
                    list = calc(rec, list, deb);
                }

                for (int i = deb; i < newvar.Values.Count; i++)
                {
                    newvar.Values[i] = list[i];
                }

                return newvar.Values;
            }
        }

        public static List<double> calc(List<double> a, List<double> b, int deb)
        {
            var l = new List<double>();
            var c = Math.Max(a.Count, b.Count);
            while (a.Count < c) a.Add(0);
            while (b.Count < c) b.Add(0);
            l = b;

            for (int i = deb; i < c; i++)
            {
                /*l[i] = double.Parse(a[i].ToString().Replace('.', ','), new CultureInfo("fr-FR")) +
                    double.Parse(b[i].ToString().Replace('.', ','), new CultureInfo("fr-FR"));*/
                l[i] = a[i] + b[i];
            }

            return l;
        }
    }
    public class CalculXML
    {
        public static Serie CalcSum(Serie res, int deb, List<CalcSerie> listVal)
        {
            for (int i = deb; i < res.Values.Count(); i++)
            {
                bool test = false;
                double value = 0;
                foreach (var item in listVal)
                {
                    if (!test)
                    {
                        // value = Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".",","), new CultureInfo("fr-FR")), 6);
                        value = Math.Round(item.Serie.Values[i - item.Annee], 6);
                        test = true;
                    }
                    else
                    {
                        // value += Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 6);
                        value += Math.Round(item.Serie.Values[i - item.Annee], 6);
                    }
                }
                res.Values[i] = value;
            }

            return res;
        }

        public static Serie CalcMoin(Serie res, int deb, List<CalcSerie> listVal)
        {
            for (int i = deb; i < res.Values.Count(); i++)
            {
                bool test = false;
                double value = 0;
                foreach (var item in listVal)
                {
                    if (!test)
                    {
                        // value = Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 6);
                        value = Math.Round(item.Serie.Values[i - item.Annee], 6);
                        test = true;
                    }
                    else
                    {
                        // value -= Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 6);
                        value -= Math.Round(item.Serie.Values[i - item.Annee], 6);
                    }
                }
                res.Values[i] = value;
            }

            return res;
        }
        public static Serie CalcMult(Serie res, int deb, List<CalcSerie> listVal)
        {
            for (int i = deb; i < res.Values.Count(); i++)
            {
                bool test = false;
                double value = 0;
                foreach (var item in listVal)
                {
                    if (!test)
                    {
                        // value = Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")),6);
                        value = Math.Round(item.Serie.Values[i - item.Annee], 6);
                        test = true;
                    }
                    else
                    {
                        // value *= Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")),6);
                        value *= Math.Round(item.Serie.Values[i - item.Annee], 6);
                    }
                }
                res.Values[i] = value;
            }

            return res;
        }
        public static Serie CalcDiv(Serie res, int deb, List<CalcSerie> listVal)
        {
            for (int i = deb; i < res.Values.Count(); i++)
            {
                bool test = false;
                double value = 0;
                foreach (var item in listVal)
                {
                    if (!test)
                    {
                        // value = Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 6);
                        value = Math.Round(item.Serie.Values[i - item.Annee], 6);
                        test = true;
                    }
                    else
                    {
                        // value /= Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 6);
                        value /= Math.Round(item.Serie.Values[i - item.Annee], 6);
                        if (Double.IsNaN(value)) value = 0;
                    }
                }
                res.Values[i] = value;
            }

            return res;
        }

        public static (Serie, Serie) SyncroCalc(Serie res1, Serie res2, string calc1, string calc2, List<CalcSerie> listVal1 , List<CalcSerie> listVal2, int deb)
        {
            int count = Math.Min(res1.Values.Count(), res2.Values.Count());

            for (int i = deb; i < count; i++)
            {
                bool test1 = false;
                double value1 = 0;
                foreach (var item in listVal1)
                {
                    if (!test1)
                    {
                        //value1 = Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 6);
                        value1 = Math.Round(item.Serie.Values[i - item.Annee], 6);
                        test1 = true;
                    }
                    else
                    {
                        /*if(calc1 == "sum") value1 += Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 6);
                        else if(calc1 == "mult") value1 *= Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 6);
                        else if(calc1 == "div") value1 /= Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 6);*/
                        double val = Math.Round(item.Serie.Values[i - item.Annee], 6);
                        if (calc1 == "sum") value1 += val;
                        else if (calc1 == "mult") value1 *= val;
                        else if (calc1 == "div") value1 /= val;
                        if (Double.IsNaN(value1)) value1 = 0;
                    }
                }
                res1.Values[i] = value1;

                bool test2 = false;
                double value2 = 0;
                foreach (var item in listVal2)
                {
                    if (!test2)
                    {
                        // value2 = Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 6);
                        value2 = Math.Round(item.Serie.Values[i - item.Annee], 6);
                        test2 = true;
                    }
                    else
                    {
                        /*if (calc2 == "sum") value2 += Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 6);
                        else if (calc2 == "mult") value2 *= Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 6);
                        else if (calc2 == "div") value2 /= Math.Round(double.Parse(item.Serie.Values[i - item.Annee].ToString().Replace(".", ","), new CultureInfo("fr-FR")), 6);*/
                        double val = Math.Round(item.Serie.Values[i - item.Annee], 6);
                        if (calc2 == "sum") value2 += val;
                        else if (calc2 == "mult") value2 += val;
                        else if (calc2 == "div") value2 += val;
                        if (Double.IsNaN(value2)) value2 = 0;
                    }
                }
                res2.Values[i] = value2;
            }
            return (res1, res2);
        }
    }
}
