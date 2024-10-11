using prevsup.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.ViewModel
{
    public class ScenarioViewModel : ICloneable
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Academy { get; set; }
        public string User { get; set; }
        public int firstYears { get; set; }
        public int lastYears { get; set; }
        public List<int> Years { get; set; }
        public int lastYearsConstat { get; set; }
        public int seq { get; set; }
        public int observation { get; set; }
        public int Cycle { get; set; }
        public List<Serie> ht_data { get; set; }
        public byte[] series2 { get; set; }
        public int LastYearsIndex { get; set; }
        public int Last_Degree { get; set; }

        public bool isEasy{ get; set; }
        public bool isNational { get; set; }
        public bool isAcademy { get; set; }
        public bool[] degres_modifies;

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    }
}

