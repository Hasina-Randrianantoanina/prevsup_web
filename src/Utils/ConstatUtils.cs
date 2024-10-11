using MongoDB.Driver;
using prevsup.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace prevsup.Utils
{
    public class ConstatUtils
    {
        public static int GetLastSeq()
        {
            int seq = 0;
            var list= dbContext.CConstat.AsQueryable().Select(x=>x.Seq).ToList();
            if (list.Count() == 0) return seq;
            seq = dbContext.CConstat.AsQueryable().Max(c => c.Seq);
            return (seq+1);
        }
      
        public static int GetMinSeq(string userid,string academy)
        {
            int seq = 0;
            var list = dbContext.CConstat.AsQueryable().Select(x => x.Seq).ToList();
            if (list.Count() == 0) return seq;
            seq = dbContext.CConstat.AsQueryable().Min(c => c.Seq);
            return (seq);
        }
    }
    public class ScenarioUtils
    {
        public static int GetLastSeq()
        {
            int seq = 0;
            if(dbContext.CScenario.AsQueryable().Count()>0) seq = dbContext.CScenario.AsQueryable().Max(c => c.Seq);
            return (seq + 1);
        }

        public static int GetMinSeq(string userid, string academy)
        {
            int seq = 0;
            seq = dbContext.CScenario.AsQueryable().Where(c => c.user == userid && c.academy == academy).Min(c => c.Seq);
            return (seq);
        }
    }
}
