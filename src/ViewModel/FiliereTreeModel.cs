using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.ViewModel
{
    public class FiliereTreeModel
    {
        public string id { get; set; }
        public string nom { get; set; }
        public string description { get; set; }
        public string indice { get; set; }

        public int Level { get; set; }
       public int parentId { get; set; }

        public int OrderIndice
        {
            get
            {
                if (indice != null && indice.Length >= 4)
                {
                    return Int32.Parse(indice.Substring(1, 3));
                }

                return -1;
            }
        }
    }
}
