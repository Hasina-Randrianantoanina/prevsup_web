using prevsup.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace prevsup.Utils
{
    class GenUtils
    {

        public static Dictionary<string, List<double>> SerieToDico(List<Serie> series, int tabLen)
        {
            var result = new Dictionary<string, List<double>>();
            int newSize = Math.Min(series[0].Values.Count, tabLen);
            foreach (Serie serie in series)
            {
                List<double> values = new List<double>();
                for (int i = 0; i < newSize; i++) values.Add(serie.Values[i]);
                result[serie.Variable] = values;
            }

            return result;
        }

        public static Dictionary<string, List<double>> SerieToDico(List<Serie> series)
        {
            var result = new Dictionary<string, List<double>>();
            foreach(Serie serie in series)
            {
                result[serie.Variable] = serie.Values;
            }

            return result;
        }

        public static List<Serie> DicoToSerie(Dictionary<string, List<double>> dico)
        {
            List<Serie> series = new List<Serie>();
            foreach (var item in dico)
            {
                //if (item.Key.StartsWith("temp")) continue;
                series.Add(new Serie() { Variable = item.Key, Values = item.Value });
            }
            return series;
        }
    }
}
