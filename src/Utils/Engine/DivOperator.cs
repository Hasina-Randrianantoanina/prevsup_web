using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Utils.Engine
{
    public class DivOperator : GenericOperator
    {

        public DivOperator(IData data): base(data)
        {
        }

        public override List<double> Calc(params List<double>[] values)
        {
            if(values.Length != 2) return null;

            List<double> div = null;
            List<double> val = values[0];
            List<double> theCurrent = null;
            if (val == null)
                return null;

            div = val.ToList();

            val = values[1];
            if (val == null)
                return null;

            if (Current != null)
            {
                theCurrent = Current.ToList();
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
            if (val.Count > div.Count )
            {
                size = div.Count;
            }
            else
            {
                size = val.Count;
            }

            for (; it < size; it++)
            {
                if (val[it] != 0)
                {
                    theCurrent[it] = div[it] / val[it];
                }
                else
                {
                    theCurrent[it] = 0d;
                }
            }

            return theCurrent;
        }
    }
}
