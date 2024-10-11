using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace prevsup.Utils
{
    public static class StringUtil
    {
        public static string HtmlEncode(string text)
        {
            string str_in = text;
            char[] chars = System.Web.HttpUtility.HtmlEncode(text).ToCharArray();
            StringBuilder result = new StringBuilder(text.Length + (int)(text.Length * 0.1));
            foreach (char c in chars)
            {
                int value = Convert.ToInt32(c);
                if (value > 127)
                    result.AppendFormat("&#{0};", value);
                else
                    result.Append(c);
            }
            string str_out = result.ToString();
            return str_out;
        }
    }
}
