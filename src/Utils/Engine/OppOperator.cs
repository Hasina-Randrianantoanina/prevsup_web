using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Utils.Engine
{
    public class OppOperator : GenericOperator
    {
        public int Year { get; set; }
 
        public OppOperator(IData _data) : base(_data)
        {
        }

        public override List<double> Calc(params XmlNode[] nodes)
        {
            if (nodes.Length != 1) return null;

            if (nodes[0].ParentNode != null)
            {
                Current = Data.GetDataList(nodes[0].ParentNode);
            }
            if (Current == null)
            {
                Current = new List<double>(new double[VarData.NbYears]);
            }

            return Calc(Data.GetDataList(nodes[0]));
        }


        public override List<double> Calc(params List<double>[] values)
        {
            if (values.Length != 1)
                return null;

            List<double> opp = null;
            List<double> val = values[0];
            List<double> theCurrent = null;
            if (val == null)
                return null;

            opp = (List<double>)val.ToList();

            if (Current != null)
            {
                theCurrent = (List<double>)Current.ToList();
                Current = null;
            }

            int it = 0;
            if (!Data.IsConstat)
            {
                it = Data.LastYearIndex;
            }
            else
            {
                it = 0;
            }

            if (Data.IsImportPEPCS)
            {
                it = 0;
            }

            for (; it < opp.Count; it++)
                theCurrent[it] = 1 - opp[it];

            return theCurrent;
        }
    }
}