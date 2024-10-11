using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Models
{
    public class dbContext
    {
        public static IMongoClient dbClient = null;
        public static IMongoDatabase db = null;

        public static IMongoCollection<User> CUser; //user.Find(new BsonDocument()).ToList(); all
        public static IMongoCollection<Academy> CAcademy;
        public static IMongoCollection<Constat> CConstat;
        public static IMongoCollection<Scenario> CScenario;
        public static IMongoCollection<Constat> CData;
        public static IMongoCollection<Model_Trees> CModelTree;
        public static IMongoCollection<Recapitulatif> CRecapitulatif;
        public static IMongoCollection<Filiere> CFiliere;
        public static IMongoCollection<Agregation_filiere> CAgregation_filiere;
        public static IMongoCollection<VariableName> CVariableName;
        public static IMongoCollection<Formule> CFormule;
        public static IMongoCollection<Variables> CVariables;
        public static IMongoCollection<AcademyData> CAcademyDatas;
        public static IMongoCollection<Ponderation> CPonderation;
        public static IMongoCollection<Ponderation> CPonderationAca;
        public static IMongoCollection<ImportedYear> CImportedYear;

        private static string host;
        public static string SetHost
        {
            set
            {
                host = "mongodb://" + value + @"/prevsup?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";
                dbClient = new MongoClient(host);
                db = dbClient.GetDatabase("prevsup");
            }
        }

        public static bool dbExist()
        {
            if (dbClient is not null) return true;
            return false;
        }
        public static void InitUser() { CUser = db.GetCollection<User>("user"); }
        public static void InitAcademy() { CAcademy = db.GetCollection<Academy>("academy"); }
        public static void InitConstat() { CConstat = db.GetCollection<Constat>("observation"); }
        public static void InitScenario() { CScenario = db.GetCollection<Scenario>("scenario"); }
        public static void InitData() { CData = db.GetCollection<Constat>("data"); }
        public static void InitModelTree() { CModelTree = db.GetCollection<Model_Trees>("model_tree"); }
        public static void InitRecapitulatif() { CRecapitulatif = db.GetCollection<Recapitulatif>("summary"); }
        public static void InitFiliere() { CFiliere = db.GetCollection<Filiere>("sector"); }
        public static void InitAgregation() { CAgregation_filiere = db.GetCollection<Agregation_filiere>("aggregationSector"); }
        public static void InitVariableName() { CVariableName = db.GetCollection<VariableName>("help"); }
        public static void InitFormule() { CFormule = db.GetCollection<Formule>("formulas"); }
        public static void InitVariables() { CVariables = db.GetCollection<Variables>("variables"); }
        public static void InitAcademyData() { CAcademyDatas =  db.GetCollection<AcademyData>("AcademyData"); }
        public static void InitPonderation() { CPonderation =  db.GetCollection<Ponderation>("Weighting"); }
        public static void InitPonderationAca() { CPonderationAca =  db.GetCollection<Ponderation>("WeightingAca"); }

        public static void InitImportedYear() { CImportedYear = db.GetCollection<ImportedYear>("ImportedYear"); }
    }
}
