using System.Collections.Generic;
using System.Xml;

namespace prevsup.Utils
{
    public static class DOMUtili
    {
        private static Dictionary<string, XmlDocument> cachedDocument = new Dictionary<string, XmlDocument>();
        public static XmlDocument getDocumentFromResourcePath(string path, bool validate)
        {
            if (cachedDocument.ContainsKey(path))
                return cachedDocument[path];
            else
            {
                XmlDocument doc = new XmlDocument();
                doc.Load(path);
                cachedDocument.Add(path, doc);
                return doc;
            }
        }
    }
}
