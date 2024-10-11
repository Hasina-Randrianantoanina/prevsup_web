using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace prevsup.Utils.Engine
{
    public class Engine
    {
        public IData Data { get; set; }
        public GenericOperator op_sum { get; set; }
        public Dictionary<string, GenericOperator> ht_op { get; set; } = new Dictionary<string, GenericOperator>();
        
        public Engine(IData sdata)
        {
            this.Data = sdata;
            this.op_sum = new SigmaOperator(Data);

            //Ajouter le nouvel opérateur dans la liste ci-dessous
            // ht_op.Add("nom xml de l'operateur",new nom_java_objet_java(Data));
            ht_op.Add("Plus", new PlusOperator(Data));
            ht_op.Add("Moins", new MoinsOperator(Data));
            ht_op.Add("Mult", new MultOperator(Data));
            ht_op.Add("Div", new DivOperator(Data));
            ht_op.Add("Sigma", op_sum);
            ht_op.Add("Inv", new InvOperator(Data));
            ht_op.Add("MultPr", new MultPreviousYearOperator(Data));
            ht_op.Add("SigmaPr", new SigmaPeviousYearOperator(Data));

            MultYear multYear = new MultYear(Data);
            multYear.Year = 2;
            ht_op.Add("MultPr2", multYear);
            multYear = new MultYear(Data);
            multYear.Year = 3;
            ht_op.Add("MultPr3", multYear);
            multYear = new MultYear(Data);
            multYear.Year = 4;
            ht_op.Add("MultPr4", multYear);
            multYear = new MultYear(Data);
            multYear.Year = 5;
            ht_op.Add("MultPr5", multYear);
            ht_op.Add("DivPr", new DivPreviousYearOperator(Data));
            DivYear divYear = new DivYear(Data);
            divYear.Year = 2;
            ht_op.Add("DivPr2", divYear);
            divYear = new DivYear(Data);
            divYear.Year = 3;
            ht_op.Add("DivPr3", divYear);
            divYear = new DivYear(Data);
            divYear.Year = 4;
            ht_op.Add("DivPr4", divYear);
            divYear = new DivYear(Data);
            divYear.Year = 5;
            ht_op.Add("DivPr5", divYear);
            ht_op.Add("Pred", new PredOperator(Data));
            SigmaOperatorPrev sigmaPrev = new SigmaOperatorPrev(Data);
            sigmaPrev.Year = 1;
            ht_op.Add("SigmaPr1", sigmaPrev);
            sigmaPrev = new SigmaOperatorPrev(Data);
            sigmaPrev.Year = 2;
            ht_op.Add("SigmaPr2", sigmaPrev);
            sigmaPrev = new SigmaOperatorPrev(Data);
            sigmaPrev.Year = 3;
            ht_op.Add("SigmaPr3", sigmaPrev);
            ht_op.Add("Opp", new OppOperator(Data));
        }

        public void StaticCompute(XmlNode root)
        {
            if (root.Name.Equals("Calculs") == false) throw new Exception("Le moteur statique est exécuté avec un mauvais fichier XML");

            foreach (XmlNode nodeList in root.SelectNodes("Calcul"))
            {
                String flabel = nodeList.Attributes["Label"].Value;
                foreach(XmlNode leaf in nodeList.SelectNodes("Var"))
                {
                    if (leaf.HasChildNodes == false) Propagate(leaf.ParentNode);
                }

            }
        }

        public void RtCompute(XmlElement root)
        {
            foreach (XmlNode node in root.SelectNodes("Var"))
            {
                RtCompute(node);
            }
        }

        public void RtCompute(XmlNode ast)
        {
            if (ast == null) return;
            if (ast.HasChildNodes == true)
            {
                foreach (XmlNode child in ast.SelectNodes("Var"))
                    RtCompute(child);
            }
            else
            {
                Propagate(ast.ParentNode);
                return;
            }
        }

        private void Propagate(XmlNode node)
        {
            String str_label = node.Attributes["Label"].Value;

            XmlNodeList childNodes = node.ChildNodes;
            XmlNode[] childs = new XmlNode[childNodes.Count];
            int iC = 0;
            foreach(XmlNode child in childNodes)
            {
                childs[iC] = child;
                iC++;
            }
            GenericOperator op = null;
            if (node.Attributes["Type"] != null && node.Attributes["Type"].Value.Equals("Sum")) op = op_sum;
            else if (node.Attributes["Fun"] == null || node.Attributes["Fun"].Equals("")) return;
            else op = ht_op[node.Attributes["Fun"].Value];
            if (op == null) throw new Exception(String.Format("Erreur sur la fonction {0} du noeud {1}. La Fonction n'est pas définie dans le code.", node.Attributes["Fun"], node.Name));
            List<double> res = op.Calc(childs);
            if (res == null) return;
            else
            {
                Data.AddDataList(str_label, res);
                if (node.ParentNode.Name.Equals("Variables") || node.ParentNode.Name.Equals("Calculs")) return;
                Propagate(node.ParentNode);
            }
        }

        
    }
}
