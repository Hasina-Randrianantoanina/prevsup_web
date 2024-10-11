using System;

namespace prevsup.Models
{
    public class Aide : IEquatable<Aide>
    {
        public string Variable { get; set; }
        public string Definition { get; set; }
        public string Formule { get; set; }
        public string Link { get; set; }


        public bool Equals(Aide obj)
        {
            if (obj == null) return false;

            return this.Variable.Equals(obj.Variable);
        }

        public override int GetHashCode()
        {
            if (String.IsNullOrEmpty(Variable)) return base.GetHashCode();

            return Variable.GetHashCode();
        }
    }
}
