using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Utils.Engine
{
    public abstract class GenericOperator
    {
        protected List<double> Current { get; set; }
        protected IData Data { get; set; }

        public GenericOperator(IData _data)
        {
            this.Data = _data;
        }
        public virtual List<double> Calc(params XmlNode[] nodes)
        {
            if (nodes.Length != 2) return null;

            if (nodes[0].ParentNode != null)
            {
                Current = Data.GetDataList(nodes[0].ParentNode);
            }
            if (Current == null) // Info: This code seems never be executed since we allocate an array in GetDataList
            {
                Current = new List<double>(new double[VarData.NbYears]);
            }

            return Calc(Data.GetDataList(nodes[0]), Data.GetDataList(nodes[1]));
        }

        public abstract List<double> Calc(params List<double>[] values);
    }
}
