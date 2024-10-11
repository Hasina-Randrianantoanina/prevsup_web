using prevsup.Models;
using prevsup.ViewModel;
using System.Collections.Generic;
using System.Linq;

namespace prevsup.Utils
{
    //TODO: Remove this class, not needed
    public class TreeUtils
    {
        public List<SerieParent> Parents { get; set; } = new List<SerieParent>();
        public List<SerieParent> Children { get; set; } = new List<SerieParent>();
        public int Iter { get; set; } = 0;
        public void GetParents(List<Serie> series, TreeModelView mt1, string child)
        {
            child = child.Replace("J", "");
            var seriesParents = mt1.model.Join(
               series,
               arg1 => arg1.Idm,

               arg2 => arg2.Variable,
               (first, second) => new SerieParent()
               {
                   Variable = second.Variable,
                   Values = second.Values,

                   ParentId = first.ParentId
               }
            ).ToList();

            List<SerieParent> foundSeries = new List<SerieParent>();
            foreach(SerieParent serie in seriesParents)
            {

                if(serie.Variable.Contains(child))

                {
                    foundSeries.Add(serie);
                }
            }



            foreach (SerieParent serie in foundSeries)
            {
                Parents.Add(serie);
                GetParent(seriesParents, serie);
                GetChildren(seriesParents, serie);
            }
        }

        public void GetChildren(List<SerieParent> series, SerieParent parentSerie)
        {

        }

        public void GetParent(List<SerieParent> series, SerieParent childSerie)
        {
            if (Iter >= 50000 || childSerie == null) return;
            SerieParent foundParent = null;
            foreach(SerieParent serie in series)
            {
                if(serie.Variable.Equals(childSerie.ParentId))
                {
                    foundParent = serie;
                    if(foundParent.Variable.Equals("EFF_TOT_FIL") == false)

                        Parents.Add(foundParent);
                    Iter++;
                    GetParent(series, foundParent);
                }
            }

            
            

        }
    }

    public class SerieParent: Serie
    {
        public string ParentId { get; set; }
    }
}
