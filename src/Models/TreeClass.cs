using System;
using System.Collections.Generic;
using System.Linq;

namespace prevsup.Models
{
    public class TreeClass
    {
        public string Parent { get; set; }
        public string Name { get; set; }
        public string RealName { get; set; }
        public List<double> Serie { get; set; }
        public string Id { get; set; }
        public int Level { get; set; }
        public int Child { get; set; }
    }
}
