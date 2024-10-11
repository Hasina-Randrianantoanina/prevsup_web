using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Utils.Engine
{
    public interface IData
    {
        public List<int> Years { get; set; }
        public Boolean IsTabRecap { get; set; }
        public Boolean IsImportPEPCS { get; set; }
        public int LastYearIndex { get; set; }
        public Boolean IsConstat { get; set; }
        public List<double> GetDataList(string label);
        public List<double> GetDataList(XmlNode node);
        public void AddDataList(string label, List<double> data);
        public void AddDataList(string label, params double[] data);
    }
}
