using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Utils.Engine
{
	public class MultPreviousYearOperator : GenericOperator
	{

		public MultPreviousYearOperator(IData _data) : base(_data)
		{
		}

		public override List<double> Calc(params List<double>[] values)
		{
			if (values.Length != 2)
				return null;

			List<Double> mult = null;
			List<Double> val = values[0];
			List<Double> theCurrent = null;

			if (val == null)
				return null;

			mult = (List<Double>)val.ToList();
			if (Current != null)
			{
				theCurrent = (List<Double>)Current.ToList();
				Current = null;
			}

			val = values[1];
			if (val == null)
				return null;

			int it = 0;
			if (!Data.IsConstat)
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

			for (; it < mult.Count; it++)
				theCurrent[it] = mult[it] * val[it - 1];

			return theCurrent;
		}
	}
}