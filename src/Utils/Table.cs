using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace prevsup.Utils
{
	// TODO: remove all this

	[XmlRoot(ElementName = "COLUMN")]
	public class COLUMN
	{

		[XmlAttribute(AttributeName = "name")]
		public string Name { get; set; }

		[XmlAttribute(AttributeName = "value")]
		public string Value { get; set; }
	}

	[XmlRoot(ElementName = "INSDIPFLU")]
	public class INSDIPFLU
	{

		[XmlElement(ElementName = "COLUMN")]
		public List<COLUMN> COLUMN { get; set; }
	}
	public class TBT
	{

		[XmlElement(ElementName = "COLUMN")]
		public List<COLUMN> COLUMN { get; set; }
	}

	public class COEFLMD
	{

		[XmlElement(ElementName = "COLUMN")]
		public List<COLUMN> COLUMN { get; set; }
	}

	[XmlRoot(ElementName = "MAT_ACAPART")]
	public class MAT_ACAPART
	{
		[XmlElement(ElementName = "COLUMN")]
		public List<COLUMN> COLUMN { get; set; }
	}
	[XmlRoot(ElementName = "MAT_TAUX150")]
	public class MAT_TAUX150
	{
		[XmlElement(ElementName = "COLUMN")]
		public List<COLUMN> COLUMN { get; set; }
	}

	[XmlRoot(ElementName = "TABLE")]
	public class TABLE
	{
		[XmlElement(ElementName = "TBT")]
		public List<TBT> TBT { get; set; }
		[XmlElement(ElementName = "COEFLMD")]
		public List<COEFLMD> COEFLMD { get; set; }
		[XmlElement(ElementName = "INSDIPFLU")]
		public List<INSDIPFLU> INSDIPFLU { get; set; }
		[XmlElement(ElementName = "MAT_ACAPART")]
		public List<MAT_ACAPART> MAT_ACAPART { get; set; }
		[XmlElement(ElementName = "MAT_TAUX150")]
		public List<MAT_TAUX150> MAT_TAUX150 { get; set; }
	}
}
