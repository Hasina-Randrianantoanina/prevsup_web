using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using prevsup.Models;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using MongoDB.Bson;
using prevsup.ViewModel;
using System.Xml;
using prevsup.Controllers;

namespace prevsup.Utils
{
    public static class RecapUtil
    {
        public static List<double> Complete(List<double> value, int nbr)
        {
            var res = value;
            while (value.Count <= nbr)
            {
                res.Add(0);
            }
            return value;
        }
        public static ScenarioViewModel getDataRecapByscenario(ScenarioViewModel scenario, List<Serie> series)
        {
            //dbContext.InitScenario();
            //var scenario = MainController.GetScenarioById(_Idscenario);
            //var idc = dbContext.CConstat.AsQueryable().Where(c => c.Seq == scenario.observation).Select(c => c.Id).FirstOrDefault();

            //var constat = MainController.GetConstatById(idc);
            //var hdata = from s in dbContext.CScenario.AsQueryable()
            //            join c in dbContext.CConstat.AsQueryable()
            //            on s.Observation equals c.Seq
            //            where s.Id == _Idscenario && s.user == idUser
            //            select new { FirstYears = c.First_year, LastYearConstat = c.Last_year, NomConstat = c.Name, NomScenario = s.Name, LastYears = s.Last_year, hdata = s.series, Docpartic = s.Documentation };

            //int nbrScenario = scenario.lastYears - constat.Last_year;
            //int tabScenario = scenario.lastYears - constat.First_year;
            //int skip = tabScenario - nbrScenario;
            //int nbrTabAct = scenario.ht_data.FirstOrDefault().Values.Count;
            //var res = new List<Serie>();

            //if (nbrTabAct == tabScenario)
            //    res = constat.series.Join(scenario.ht_data, arg => arg.Variable, arg2 => arg2.Variable, (c, s) => new Serie() { Variable = s.Variable, Values = Complete(c.Values.Concat(s.Values.Skip(skip + 1)).ToList(), tabScenario) }).ToList();
            //else
            //    if (nbrTabAct == nbrScenario)
            //    res = constat.series.Join(scenario.ht_data, arg => arg.Variable, arg2 => arg2.Variable, (c, s) => new Serie() { Variable = s.Variable, Values = Complete(c.Values.Concat(s.Values).ToList(), tabScenario) }).ToList();
            //else
            //    res = constat.series.Join(scenario.ht_data, arg => arg.Variable, arg2 => arg2.Variable, (c, s) => new Serie() { Variable = s.Variable, Values = Complete(((s.Values.Count == nbrScenario) ? c.Values.Concat(s.Values).ToList() : c.Values.Concat(s.Values.Skip(skip + 1)).ToList()), tabScenario) }).ToList();

            ScenarioViewModel recap = new ScenarioViewModel();
            recap.isNational = scenario.isNational;
            recap.firstYears = scenario.firstYears;
            recap.lastYears = scenario.lastYears;
            recap.ht_data = series;
            recap.Cycle = 1;
            recap.lastYearsConstat = scenario.lastYearsConstat;
            recap.Name = scenario.Name;
            recap.Years = new List<int>();
            int index = 0;
            for (int i = recap.firstYears; i <= recap.lastYears; i++)
            {
                if (i == recap.lastYearsConstat) recap.LastYearsIndex = index;
                recap.Years.Add(i);
                index++;
            }

            return recap;
        }
        public static RecapitulatifViewModel UpdateModelXMlRecapitulatif(XmlDocument doc, RecapitulatifViewModel recap)
        {
            RecapitulatifViewModel reca = recap;


            return reca;

        }
        public static RecapitulatifViewModel CreateTreeRecapitulatif(XmlDocument doc, RecapitulatifViewModel recap)
        {
            RecapitulatifViewModel reca = recap;
            string str_key = null;
            XmlNodeList elt = doc.GetElementsByTagName("Var");
            foreach(XmlNode node in elt)
            {
                str_key = node.Attributes["Label"].Value;
                Serie sr = reca.ht_data.Where(x => x.Variable == str_key).FirstOrDefault();
                if(sr==null)
                {
                    sr = new Serie();
                    sr.Variable = str_key;
                    sr.Values = new List<double>();
                    for (int i = 0; i <= (reca.lastYears - reca.firstYears); i++)
                    {
                        sr.Values.Add(0.0);
                    }
                    reca.ht_data.Add(sr);
                }
            }
            return reca;
        }
    }
}
