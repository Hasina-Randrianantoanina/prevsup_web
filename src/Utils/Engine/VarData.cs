using System;
using System.Collections.Generic;
using System.Xml;

namespace prevsup.Utils.Engine
{
    public class VarData: IData
    {
        public static int NbYears = 30;
        public Dictionary<string, List<double>> HtData { get; set; }
        public Boolean IsConstat { get; set; }
        public int LastYearIndex { get; set; }
        public bool IsImportPEPCS { get; set; }
        public bool IsTabRecap { get; set; }
        public List<int> Years { get; set; }

        public VarData(List<string> years, string lastYear) : this(ConvertYears(years), Int32.Parse(lastYear))
        {

        }

        public VarData(List<int> years, int lastYear)
        {
            Years = years;
            LastYearIndex = Years.IndexOf(lastYear) + 1;
        }

        public List<double> GetDataList(string label)
        {
            return HtData[label];
        }

        public static List<int> ConvertYears(List<string> years)
        {
            List<int> yearsInt = new List<int>();
            foreach (string year in years) yearsInt.Add(Int32.Parse(year));
            return yearsInt;
        }


        public List<double> GetDataList(XmlNode node)
        {
            string label = node.Attributes["Label"].Value;
            if (HtData.ContainsKey(label) == false)
            {
                HtData[label] = new List<double>(new double[VarData.NbYears]);
            }
            List<double> res = HtData[label];
            
            // if(res == null) logger.LogInformation("Pas dedonnées pour label = " + label);
            return res;
        }

        public void AddDataList(string label, List<double> data)
        {
            HtData[label] = data;
        }

        public void AddDataList(string label, params double[] data)
        {
            HtData[label] = new List<double>(data);
        }
    }
}
