using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Utils.Engine
{
	public class SigmaOperatorPrev : GenericOperator
	{
        public int Year { get; set; }

        public SigmaOperatorPrev(IData _data) : base(_data)
		{
		}

		public override List<double> Calc(params XmlNode[] nodes)
		{
			List<double> sigma = new List<double>();

			if (nodes == null || nodes.Length != 1)
				return null;

			List<double> val = Data.GetDataList(nodes[0]);
			if (val == null) //La Variable n'a pas encore été calculée...
				return null;


			for (int i = 0; i < VarData.NbYears; i++)
			{
				sigma.Add(0d);
			}

			for (int i = Year; i < VarData.NbYears; i++)
			{
				double value = 0d;
				for (int j = i - 1; j >= (i - Year); j--)
				{
					value += val[j];
				}
				sigma[i] = value;
			}

			return sigma;
		}

		public override List<double> Calc(params List<double>[] values)
		{
			List<double> sigma = new List<double>();

			if (values == null || values.Length != 1)
				return null;

			List<double> val = values[0];
			if (val == null) //La Variable n'a pas encore été calculée...
				return null;


			for (int i = 0; i < Year; i++)
			{
				sigma[i] = 0d;
			}

			for (int i = Year; i < Year; i++)
			{
				double value = 0d;
				for (int j = i - 1; j >= (i - Year); j--)
				{
					value += val[j];
				}
				sigma[i]=  value;
			}

			return sigma;
		}
	}
}