using System;
using System.Collections.Generic;

namespace prevsup.Models
{
    public class ArchiveItem : ICloneable
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public bool Is_archive { get; set; }
        public object Clone()
        {
            return this.MemberwiseClone();
        }
    };

    public class Archive
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public List<ArchiveItem> archives;
        public List<ArchiveItem> non_archives;
    }
}
