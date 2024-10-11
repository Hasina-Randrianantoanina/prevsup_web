using System.Collections.Generic;

namespace prevsup.Models
{
    public class Row
    {
        public string Parent { get; set; }
        public string Name { get; set; }
        public string RealName { get; set; }
        public List<double> serie { get; set; }
        public string Id { get; set; }
        public int Level { get; set; }
        public int child { get; set; }
        public string type { get; set; }
        public string display { get; set; }

        public override int GetHashCode()
        {
            return System.HashCode.Combine(Id.GetHashCode());
        }

        public override bool Equals(object obj)
        {
            if (obj == null) return false;
            if(obj is Row)
            {
                Row other = ((Row)obj);
                if (Id!= null && other.Id !=null) return Id.Equals(other.Id);
                return false;
            }
            return base.Equals(obj);
        }
    }
}
