using MongoDB.Bson;
using MongoDB.Driver;
using prevsup.Models;
using prevsup.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Controllers
{
    public class DataService
    {
        public List<Academy> Academies { get; set; }
        public Datas datas { get; set; } = new Datas();
        public List<Formule> ListFormule { get; set; } = new List<Formule>();
        public List<Filiere> detailFiliere { get; set; } = new List<Filiere>();
        public List<Ponderation> PonderationsAca { get; set; } = new List<Ponderation>();
        public List<Ponderation> Ponderations { get; set; } = new List<Ponderation>();
        public List<Model_Trees> Mtrees { get; set; } = new List<Model_Trees>();
        public List<VariableName> variablesName { get; set; } = new List<VariableName>();

        public DataService()
        {
            InitAll();
        }

        public void InitAll()
        {
            dbContext.InitUser();
            dbContext.InitAcademy();
            dbContext.InitConstat();
            dbContext.InitScenario();
            dbContext.InitData();
            dbContext.InitModelTree();
            dbContext.InitRecapitulatif();
            dbContext.InitFiliere();
            dbContext.InitAgregation();
            dbContext.InitVariableName();
            dbContext.InitFormule();
            dbContext.InitVariables();
            dbContext.InitAcademyData();
            dbContext.InitPonderation();
            dbContext.InitPonderationAca();
            dbContext.InitImportedYear();
            Index();
        }

        public void Index()
        {
            InitModelTree();
            InitVariablesNames();
            InitFiliere();
            InitFormule();
            InitMtree();
            InitPonderation();
            InitAcademy();
            UPonderation.InitPonderation();

            dbContext.InitAcademyData();
            string[] v = GetType().Assembly.GetName().Version.ToString().Split(".");
            Array.Resize(ref v, v.Length - 1);
            //ViewBag.version = String.Join(".", v);

            dbContext.InitImportedYear();

            //InitVariables();
        }


        public void InitConstat()
        {
            if (datas.Constats == null)
            {
                dbContext.InitConstat();
                datas.Constats = dbContext.CConstat.Find(new BsonDocument()).ToList();

            }
        }
        public void InitScenario()
        {
            if (datas.Constats == null)
            {
                dbContext.InitScenario();
                datas.Scenarios = dbContext.CScenario.Find(new BsonDocument()).ToList();

            }
        }
        public void InitFormule()
        {
            dbContext.InitFormule();
            ListFormule = dbContext.CFormule.Find(new BsonDocument()).ToList();
        }


        public void InitFiliere()
        {
            dbContext.InitFiliere();
            detailFiliere = dbContext.CFiliere.Find(new BsonDocument()).ToList();
        }



        public void InitPonderation()
        {
            dbContext.InitPonderation();
            dbContext.InitPonderationAca();
            Ponderations = dbContext.CPonderation.Find(new BsonDocument()).ToList();
            PonderationsAca = dbContext.CPonderationAca.Find(new BsonDocument()).ToList();
        }

        public void InitMtree()
        {
            dbContext.InitModelTree();
            Mtrees = dbContext.CModelTree.AsQueryable().Select(x => new Model_Trees()
            {
                Id = x.Id,
                Degres = x.Degres,
                Is_Easy = x.Is_Easy,
                Is_Academy = x.Is_Academy,
                Is_National = x.Is_National,
                Order_Hyp = x.Order_Hyp,
                Order_Res = x.Order_Res,
                model = x.model,
                HasChild = x.HasChild
            }).ToList();
        }

        public void InitVariablesNames()
        {
            dbContext.InitVariableName();
            variablesName = dbContext.CVariableName.Find(new BsonDocument()).ToList();
            for (int i = 0; i < variablesName.Count; i++)
            {
                /*Encoding utf8 = Encoding.UTF8;
                Encoding ascii = Encoding.ASCII;
                // variablesName[i].Definition = ascii.GetString(Encoding.Convert(utf8, ascii, utf8.GetBytes(variablesName[i].Definition)));
                // variablesName[i].Definition = utf8.GetString(Encoding.Convert(ascii, utf8, ascii.GetBytes(variablesName[i].Definition)));
                string str_avant = variablesName[i].Definition;
                string str_apres = StringUtil.HtmlEncode(str_avant);
                variablesName[i].Definition = str_apres;*/
                /*var file = variablesName[i].Variable;
                var filename = _hostingEnvironment.WebRootPath + "/Aide/" + file + "_IJ.html";
                variablesName[i].IJ = System.IO.File.Exists(filename) ? "IJ" : "J";*/
            }
        }


        public void InitModelTree()
        {
            if (datas.Model_Trees == null)
            {
                dbContext.InitModelTree();
                datas.Model_Trees = dbContext.CModelTree.Find(x => !x.Is_National && !x.Is_Easy).FirstOrDefault();
            }
        }


        public void InitAcademy()
        {
            dbContext.InitAcademy();
            Academies = AcademyData.FindAllAca(dbContext.CAcademyDatas, dbContext.CAcademy);
        }


    }
}
