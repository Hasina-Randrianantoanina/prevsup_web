using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Models
{
    public class Tools
    {
        public static string GetMereVariable(string s)
        {
            var splt = s.Split('_');
            var v = "";
            for (int i = 0; i < splt.Length - 1; i++)
            {
                if (i == splt.Length - 2) v += splt[i];
                else v += splt[i] + "_";
            }
            return v;
        }
        public static string GetVariable(string s)
        {
            var splt = s.Split('_');
            var v = "";
            for (int i = 0; i < splt.Length - 1; i++)
            {
                v += splt[i] + "_";
            }
            return v;
        }

        public static string GetVariableIJ(string s)
        {
            var splt = s.Split('_');
            var v = "";
            for (int i = 0; i < splt.Length - 2; i++)
            {
                v += splt[i] + "_";
            }
            return v;
        }

        public static string GetNiveauDeg(string s)
        {
            var splt = s.Split('_');
            return splt[splt.Length - 3];
        }

        public static string GetIJ(string s, int a)
        {
            var splt = s.Split('_');
            return splt[splt.Length - 1 - a];
        }
    }

    public class Progress
    {
        // Kaky - 22/06/2022 - Statut de la progression
        public string Status { get; set; }
        public int NumAcademie;
        public bool Complete;
        public bool isRunning;
        public string Dossier;
        public int NbAcademies;
        public int NbHypotheses;
        public int NbModeles;
        public int NbResultats;
        public int CurrentAcademie;
        public int CurrentHypothese;
        public int CurrentModele;
        public int CurrentResultat;


        public Progress()
        {
            init();
        }
        
        public void init()
        {
            Status = "Rien";
            NumAcademie = 0;
            Complete = false;
            isRunning = false;
            Dossier = "";
            NbAcademies = 0;
            NbHypotheses = 0;
            NbModeles = 0;
            NbResultats = 0;
            CurrentAcademie = 0;
            CurrentHypothese = 0;
            CurrentModele = 0;
            CurrentResultat = 0;
        }
    }

    public class OneSerie
    {
        public string Variable{ get; set; }
        public object Value{ get; set; }
    }

    public class Datas
    {
        public List<Academy> Academies { get; set;  }
        //public AcademicData AcademicData { get; set; } 
        public List<Constat> Constats { get; set; }
        public List<Scenario> Scenarios { get; set; }
        //public List<TabRecap> TabRecaps { get;set;}
        public List<User> Utilisateurs { get; set; }
        public Model_Trees Model_Trees { get; set; }
        public List<ImportedYear> ImportedYears { get; set; }
        public List<string> ImportedYearsString { get; set; }
    }

    public class NodeT
    {
        public int IdParent { get; set; }
        public string Childs { get; set; }
        public int ChildCount { get; set; }
        public string Parent { get; set; }
        public string Name { get; set; }
        public string RealName { get; set; }
        public string[] data { get; set; }

        public int Id { get; set; }
        public int level { get; set; }

        public IList<NodeT> Children { get; set; } = new List<NodeT>();
    }

    public static class Extension
    {
        public static IEnumerable<NodeT> Traverse(this NodeT root)
        {
            var stack = new Stack<NodeT>();
            stack.Push(root);
            while (stack.Count > 0)
            {
                var current = stack.Pop();
                yield return current;
                foreach (var child in current.Children)
                    stack.Push(child);
            }
        }
    }

    public class Data
    {
        public int Id { get; set; }
        public string Label { get; set; }
        public string RealName { get; set; }
        public int IdParent { get; set; }
        public int level { get; set; }
        public int ChildCount { get; set; }
        public string Childs { get; set; }
        public virtual List<object> Baccs { get; set; }
    }

    public static class ModelPath
    {
        public static string EffectifLMDHyp(string path)
        {
            return Path.Combine(path, "Summary/projEffLMDHyp.xml");
        }
        public static string EffectifLMDModel(string path)
        {
            return Path.Combine(path, "Summary/projEffLMDModel.xml");
        }
        public static string DiplomeLMDHyp(string path)
        {
            return Path.Combine(path, "Summary/projDipLMDHyp.xml");
        }
        public static string DiplomeLMDModel(string path)
        {
            return Path.Combine(path, "Summary/projDipLMDModel.xml");
        }
        public static string AccademiqueLMDHyp(string path)
        {
            return Path.Combine(path, "Summary/projAcaLMDHyp.xml");
        }
        public static string AccademiqueLMDModel(string path)
        {
            return Path.Combine(path, "Summary/projAcaLMDModel.xml");
        }
    }
}
