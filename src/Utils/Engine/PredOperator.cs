using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Utils.Engine
{
	public class PredOperator : GenericOperator
	{

		/**
		 * Implémentation de l'opérateur PLUS
		 * @param sdata
		 */
		public PredOperator(IData _data) : base(_data)
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

            List<double> val = values[0];
            List<double> theCurrent = null;
            if (val == null)
                return null;

            if (Current != null)
            {
                theCurrent = Current.ToList();
                Current = null;
            }

            int it = 0;
            if (Data.IsConstat)
            {
                it = Data.LastYearIndex;
            }
            else
            {
                it = 1;
            }

            if (Data.IsImportPEPCS)
            {
                it = 1;
            }

            // TODO: The other Years with 0 as previous value will have value set to -1
            for (; it < VarData.NbYears; it++)
                theCurrent[it] = theCurrent[it - 1];

            return theCurrent;
        }
	}
}