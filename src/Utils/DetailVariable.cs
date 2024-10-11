using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Utils
{
    public class DetailVariable
    {
        public string Index { get; set; }
        public string Variable { get; set; }
        public string Degre { get; set; }

        public static DetailVariable getVarName(string s)
        {
            var spl = s.Split('_');
            var indice = spl[spl.Length - 1];
            var degre = spl[spl.Length - 2];
            if (degre.Contains("N")) degre = degre[1].ToString();
            else degre = null;
            var variable = "";
            for (int i = 0; i < spl.Length - 1; i++)
            {
                if (i == spl.Length - 2) variable += spl[i];
                else variable += spl[i] + "_";
            }


            return new DetailVariable() { Index = indice, Variable = variable, Degre = degre };
        }
    }

    
}
