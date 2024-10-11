using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Utils.Engine
{
	public class InvOperator: GenericOperator {

		public InvOperator(IData _data): base(_data)
        {
        }
		public override List<double> Calc(params XmlNode[] nodes)
        {
			if (nodes.Length != 1) return null;
			return Calc(Data.GetDataList(nodes[0]));
        }


		public override List<double> Calc(params List<double>[] values)
        {
			if (values.Length != 1) return null;

			List<double> val = values[0];
			if (val == null)
				return null;
			List<double> inv = (List<double>)val.ToList();

			int size;
			if (val.Count > inv.Count)
			{
				size = inv.Count;
			}
			else
			{
				size = val.Count;
			}

			for (int it = 0; it < size; it++)
			{
				inv[it] = 1d / val[it];
			}

			return inv;
		}
    }
}