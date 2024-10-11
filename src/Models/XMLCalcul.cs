using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace prevsup.Models
{
    public class XMLCalcul
    {
    }

	public class CalcSerie
    {
        public int Annee{ get; set; }
        public Serie Serie{ get; set; }
    }

	[XmlRoot(ElementName = "Var")]
	public class Var
	{
		[XmlAttribute(AttributeName = "Label")]
		public string Label { get; set; }
		[XmlAttribute(AttributeName = "Calc")]
		public string Calc { get; set; }
		[XmlAttribute(AttributeName = "Annee")]
		public string Annee { get; set; }
		public List<Var> Variable { get; set; }
	}
	/*
	[XmlRoot(ElementName = "Var")]
	public class Var
	{
		[XmlAttribute(AttributeName = "DisplayLabel")]
		public string DisplayLabel { get; set; }

		[XmlAttribute(AttributeName = "Label")]
		public string Label { get; set; }

		[XmlAttribute(AttributeName = "Type")]
		public string Type { get; set; }
	}
	*/
	
	[XmlRoot(ElementName = "Calculs")]
	public class Calculs
	{

		[XmlElement(ElementName = "Calcul")]
		public List<Calcul> Calcul { get; set; }

		[XmlAttribute(AttributeName = "Label")]
		public string Label { get; set; }
	}

	[XmlRoot(ElementName = "Calcul")]
	public class Calcul
	{
		[XmlElement(ElementName = "Var")]
		public List<Vari> Var { get; set; }

		[XmlAttribute(AttributeName = "Fun")]
		public string Fun { get; set; }

		[XmlAttribute(AttributeName = "DisplayLabel")]
		public string DisplayLabel { get; set; }

		[XmlAttribute(AttributeName = "Label")]
		public string Label { get; set; }

		[XmlAttribute(AttributeName = "Type")]
		public string Type { get; set; }
	}

	[XmlRoot(ElementName = "Var")]
	public class Vari
	{

		[XmlAttribute(AttributeName = "DisplayLabel")]
		public string DisplayLabel { get; set; }

		[XmlAttribute(AttributeName = "Label")]
		public string Label { get; set; }

		[XmlAttribute(AttributeName = "Type")]
		public string Type { get; set; }

		[XmlAttribute(AttributeName = "Display")]
		public string Display { get; set; }

		[XmlElement(ElementName = "Var")]
		public List<Vari> Vars { get; set; }
	}

	[XmlRoot(ElementName = "Var")]
	public class Varo
	{

		[XmlAttribute(AttributeName = "DisplayLabel")]
		public string DisplayLabel { get; set; }

		[XmlAttribute(AttributeName = "Label")]
		public string Label { get; set; }

		[XmlAttribute(AttributeName = "Type")]
		public string Type { get; set; }
	}

	[XmlRoot(ElementName = "Variables")]
	public class Variablesi
	{

		[XmlElement(ElementName = "Var")]
		public List<Vari> Var { get; set; }

		[XmlAttribute(AttributeName = "Label")]
		public string Label { get; set; }
	}


}
