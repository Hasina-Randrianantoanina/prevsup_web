using prevsup.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.ViewModel
{

    public class RecapitulatifViewModel : ICloneable
    {
        public string Name { get; set; }
        public int firstYears { get; set; }
        public int lastYears { get; set; }
        public List<int> Years { get; set; }
        public int lastYearsConstat { get; set; }
        public int Cycle { get; set; }
        public List<Serie> ht_data { get; set; }
        public int LastYearsIndex { get; set; }
        public Dictionary<string, double[]> _data { get; set; }

        public List<string> Scenario { get; set; }
        public RecapitulatifViewModel(string name, ScenarioViewModel scenar)
        {
            this.Name = name;
            this.firstYears = scenar.firstYears;
            this.ht_data = new List<Serie>(scenar.ht_data);
            this.lastYearsConstat = scenar.lastYearsConstat;
            this.LastYearsIndex = scenar.LastYearsIndex;
            this.Scenario = new List<string>();
            this.Scenario.Add(scenar.Name);
            this.Years = new List<int>(scenar.Years);
            this.Cycle = scenar.Cycle;
            this.lastYears = scenar.lastYears;
        }
        #region ICloneable Members

        public object Clone()
        {
            return this.MemberwiseClone();
        }

        #endregion

    }
    
    public class TreeModelView
    {
        public bool IsEasy { get; set; }
        public string Id { get; set; }
        public List<model> model { get; set; }
        public HashSet<model> HypoChildren { get; set; } = new HashSet<model>();
        public HashSet<model> ResChildren { get; set; } = new HashSet<model>();

        public void GetHypoModels()
        {
            var parents = model.Where(a => a.ParentId == "Hypotheses");
            HypoChildren = new HashSet<model>();
            foreach(model mod in parents)
            {
                GetChildren(mod, true);
            }
        }

        public void GetResModels()
        {
            var parents = model.Where(a => a.ParentId == "Resultats");
            ResChildren = new HashSet<model>();

            foreach (model mod in parents)
            {
                GetChildren(mod, false);
            }
        }

        public void GetChildren(model parent, bool isHypo)
        {
            if (parent == null) return;
            foreach (model mod in model)
            {
                if (mod.ParentId == null || string.IsNullOrEmpty(mod.ParentId)) continue;
                if(mod.ParentId.Equals(parent.Idm))
                {
                    if (isHypo) HypoChildren.Add(mod);
                    else ResChildren.Add(mod);
                    GetChildren(mod, isHypo);
                }
            }
        }
        
    }
    public class ConstatViewModel : ICloneable
    {

        public string Id { get; set; }

        public int First_year { get; set; }
        public int Seq { get; set; }

        public int Last_year { get; set; }

        public string Name { get; set; }
        public string User { get; set; }
        public string Academy { get; set; }

        public List<Serie> series { get; set; }
        public byte[] series2 { get; set; }
        public bool isEasy { get; set; }
        public bool isNational { get; set; }
        public bool isAcademy { get; set; }

        public string SerieId { get; set; }

        public object Clone()
        {
            return this.MemberwiseClone();
        }
    
}
    public class RecapitulatifTreeModel
    {
        public string Name { get; set; }
        public int Level { get; set; }
        
        public int id { get; set; }
        public int parentid { get; set; }
        public bool hasChild { get; set; }
        public List<object> Datas { get; set; }
        public List<double> _data { get; set; }
        public string displayLabel { get; set; }
        public string label { get; set; }
        public int Child { get; set; } //test
        public string parent { get; set; }
        public string type { get; set; }
        public string display { get; set; }
    }
    public class ModelTreeRecap
    {
        public string Id { get; set; }
        public string scenarioname  { get;set; }
        public List<RecapitulatifTreeModel> EffectifLMD { get; set; }
        public int YearDebutEff { get; set; }
        public int YearEndEff { get; set; }
        public int YearEndCEff { get; set; }
        public int IndexLastYearEff { get; set; }
        public List<int> YearsEff { get; set; }
        public List<RecapitulatifTreeModel> DiplomeLMD { get; set; }
        public int YearDebutAca { get; set; }
        public int YearEndAca { get; set; }
        public int YearEndCAca { get; set; }
        public int IndexLastYearAca { get; set; }
        public List<int> YearsAca { get; set; }
        public List<RecapitulatifTreeModel> AccademieLMD { get; set; }
        public int YearDebutDip { get; set; }
        public int YearEndDip { get; set; }
        public int YearEndCDip { get; set; }
        public int IndexLastYearDip { get; set; }
        public List<int> YearsDip { get; set; }
        public bool isNational { get; set; }
    }
    public class RowOrder
    {
        public XmlDocument hypOrder { get; set; }
        public XmlDocument resOrder { get; set; }
        public RowOrder(XmlDocument hypRowOrder, XmlDocument resRowOrder)
        {
            hypOrder = hypRowOrder;
            resOrder = resRowOrder;
        }
    }
}

