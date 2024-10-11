using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
namespace prevsup.Utils.Import
{
	public enum FILESToIMPORT
	{
		insdipflu,
		tbt,
		coefLMD,
		recap_aca,
		recap_pgm150
	}

	[XmlRoot(ElementName = "COLUMN")]
	public class Column
	{
		[XmlAttribute(AttributeName = "name")]
		public string Name { get; set; }
		[XmlAttribute(AttributeName = "value")]
		public string Value { get; set; }
        [XmlAttribute(AttributeName = "missing")]
        public string Missing { get; set; }
    }

	public class TableRow
	{
		[XmlElement(ElementName = "COLUMN")]
		public List<Column> Columns { get; set; }
	}
	
	public interface Table {
		public abstract List<TableRow> Rows { get; set; }
	}


	[XmlRoot(ElementName = "TABLE")]
	public class TableTbt: Table
	{
		[XmlElement(ElementName = "TBT")]
		public List<TableRow> Rows { get; set; }
	}
	[XmlRoot(ElementName = "TABLE")]
	public class TableCoefLMD : Table
	{
		[XmlElement(ElementName = "COEFLMD")]
		public List<TableRow> Rows { get; set; }
	}
	[XmlRoot(ElementName = "TABLE")]
	public class TableInsdipflu: Table
	{
		[XmlElement(ElementName = "INSDIPFLU")]
		public List<TableRow> Rows { get; set; }
	}
	[XmlRoot(ElementName = "TABLE")]
	public class TableMat_acapart : Table
	{
		[XmlElement(ElementName = "MAT_ACAPART")]
		public List<TableRow> Rows { get; set; }
	}
	[XmlRoot(ElementName = "TABLE")]
	public class TableMat_Taux150 : Table
	{
		[XmlElement(ElementName = "MAT_TAUX150")]
		public List<TableRow> Rows { get; set; }
	}

}
