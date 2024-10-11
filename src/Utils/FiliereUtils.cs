using MongoDB.Driver;
using prevsup.Models;
using prevsup.ViewModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Utils
{
    public class FiliereUtils
    {
        int iter = 0;
        public FiliereUtils()
        {
            dbContext.InitAgregation();
            dbContext.InitFiliere();
            var cb = dbContext.CFiliere.AsQueryable().ToList();
        }
        public List<Filiere> CreateTreeFiliere(int idFiliere, int degmin, int degmax)
        {
            var dbA = dbContext.CAgregation_filiere.AsQueryable().OrderBy(xx => xx.idfiliere);
            var dbF = dbContext.CFiliere.AsQueryable().OrderBy(xx => xx.idfiliere);
            List<Filiere> fil = new List<Filiere>();
            var gh= dbA.ToList().Where(c => c.idagregation == idFiliere).ToList();
            foreach(Agregation_filiere ag in gh)
            {
                var bd = dbF.ToList().FirstOrDefault(c => c.idfiliere == ag.idfiliere);
                if(bd!=null)
                    fil.Add(bd);
            }
            return fil;
        }
        public List<FiliereTreeModel> treeFiliere = new List<FiliereTreeModel>();
        public void GetTreeFiliere(string filiere, int degmin, int degmax,int level)
        {
            FiliereTreeModel treeM = new FiliereTreeModel();
            var Filier = dbContext.CFiliere.AsQueryable().FirstOrDefault(c => c.nomfiliere == filiere);
            treeM.description = Filier.description;
            treeM.indice = Filier.indice;
            treeM.Level = level;
            treeM.nom = Filier.nomfiliere;
            treeFiliere.Add(treeM);
            foreach (Filiere fe in CreateTreeFiliere(Filier.idfiliere, degmin, degmax))
            {
                level = treeM.Level + 1;
                GetTreeFiliere(fe.nomfiliere, degmin, degmax, level);
            }
        }

    }
}
