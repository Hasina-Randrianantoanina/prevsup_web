using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Utils.Engine
{
    public class DivPreviousYearOperator : GenericOperator
    {

        public DivPreviousYearOperator(IData _data) : base(_data)
        {
        }

        public override List<double> Calc(params List<double>[] values)
        {

            if (values.Length != 2)
                return null;

            List<double> div = null;
            List<double> val = values[0];
            List<double> theCurrent = null;
            if (val == null)
                return null;

            div = (List<double>)val.ToList();

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
                it = 1;
            }

            if (Data.IsImportPEPCS)
            {
                it = 1;
            }

            for (; it < div.Count; it++)
            {
                if (val[it - 1] != 0)
                    theCurrent[it] = div[it] / val[it - 1];
                else
                    theCurrent[it] = 0d;
            }
            return theCurrent;
        }
    }
}
