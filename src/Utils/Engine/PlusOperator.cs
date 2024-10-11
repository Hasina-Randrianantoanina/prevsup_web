using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Utils.Engine
{
	public class PlusOperator : GenericOperator
	{

		/**
		 * Implémentation de l'opérateur PLUS
		 * @param sdata
		 */
		public PlusOperator(IData _data) : base(_data)
		{
		}

		public override List<double> Calc(params List<double>[] values)
		{
			if (values.Length != 2)
				return null;

			List<double> plus = null;
			List<double> val = values[0];
			List<double> theCurrent = null;
			if (val == null)
				return null;

			plus = (List<double>)val.ToList();

			val = values[1];
			if (val == null)
				return null;

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

			int size;
			if (val.Count > plus.Count)
			{
				size = plus.Count;
			}
			else
			{
				size = val.Count;
			}

			for (; it < size; it++)
			{
				theCurrent[it] = plus[it] + val[it];
			}

			return theCurrent;
		}
	}
}