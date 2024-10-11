using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Utils.Engine
{
	public class MoinsOperator : GenericOperator
	{

		public MoinsOperator(IData _data) : base(_data)
		{
		}

		public override List<double> Calc(params List<double>[] values)
		{
			if(values.Length != 2)
			return null;

			List<Double> moins = null;
			List<Double> val = values[0];
			List<Double> theCurrent = null;
			if (val == null)
				return null;

			moins = (List<Double>)val.ToList();

			val = values[1];
			if (val == null)
				return null;

			if (Current != null)
			{
				theCurrent = (List<Double>)Current.ToList();
				Current = null;
			}

			int it = 0;
			if (!Data.IsConstat && !Data.IsTabRecap)
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

			int size;
			if (val.Count > moins.Count)
			{
				size = moins.Count;
			}
			else
			{
				size = val.Count;
			}

			for (; it < size; it++)
			{
				theCurrent[it] = moins[it] - val[it];
			}

			return theCurrent;
		}
	}
}