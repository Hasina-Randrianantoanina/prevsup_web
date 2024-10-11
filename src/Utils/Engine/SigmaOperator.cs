using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Utils.Engine
{
	public class SigmaOperator : GenericOperator
	{

		public SigmaOperator(IData _data) : base(_data)
		{
		}

		public override List<double> Calc(params XmlNode[] nodes)
		{
			List<double> sigma = null;
			foreach(XmlNode node in nodes)
            {
				List<double> val = Data.GetDataList(node);
				// if(val != null) // La Variable n'a pas encore été calculée....
				// return null;
				if (sigma == null) sigma = val.ToList();
				else
                {
					int size;
					if (val.Count > sigma.Count) size = sigma.Count;
					else size = val.Count;
					for(int iT = 0; iT < size; iT++)
                    {
						sigma[iT] = sigma[iT] + val[iT];
                    }
                }
            }
			return sigma;
		}

		public override List<double> Calc(params List<double>[] values)
		{
			List<double> sigma = null;

			foreach(List<double> val in values)
			{
				if (val != null) //La Variable n'a pas encore été calculée....
								 //				return null;
					if (sigma == null)
					{ //Premier item
						sigma = (List<double>)val.ToList();
					}
					else
					{ // On somme les élements
						int size;
						if (val.Count > sigma.Count)
						{
							size = sigma.Count;
						}
						else
						{
							size = val.Count;
						}

						for (int it = 0; it < size; it++)
						{
							sigma[it] = sigma[it] + val[it];
						}
					}
			}
			return sigma;
		}
	}
}