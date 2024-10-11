using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Utils.Engine
{
	public class SigmaPeviousYearOperator : GenericOperator
	{

		public SigmaPeviousYearOperator(IData _data) : base(_data)
		{
		}


		public override List<double> Calc(params XmlNode[] nodes)
		{
			List<double> sigma = null;

			if (nodes == null)
				return null;

			sigma = Data.GetDataList(nodes[0].ParentNode);

			if (sigma == null)
			{
				return null;
			}

			for (int it = Data.LastYearIndex; it < sigma.Count; it++)
			{
				sigma[it] = 0.0;

			}
			foreach(XmlNode n in nodes)
			{
				List<double> val = Data.GetDataList(n);
				int size;
				if (val.Count > sigma.Count)
				{
					size = sigma.Count;
				}
				else
				{
					size = val.Count;
				}

				int it = 0;
				if (!Data.IsConstat)
				{
					it = Data.LastYearIndex;
				}
				if (Data.IsImportPEPCS)
				{
					it = 0;
				}
				for (; it < size; it++)
				{
					sigma[it] = sigma[it] + val[it];
				}
			}
			return sigma;
		}

	
		public override List<double> Calc(params List<double>[] values)
		{
			return null;
		}

	}
}