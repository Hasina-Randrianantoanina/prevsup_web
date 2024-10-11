using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Linq;

namespace prevsup.Controllers
{
    // Kaky - 24/06/2022 - Filtre pour bloquer un utilisateur qui tente de se connecter alors qu'il y a import de données
    public class ImportActionFilter : Attribute, IActionFilter
    {
        public void OnActionExecuted(ActionExecutedContext context)
        {
            string[] actionsToBlock = { "Logout", "Progress" };
            if (actionsToBlock.Contains(context.RouteData.Values["action"]) == false)
            {
                if (ImportDataController.IsImportRunning == true)
                {
                    context.Result = new ObjectResult("Une procédure d'import est en cours. Veuillez attendre la fin de la procédure.") { StatusCode = 500 };
                }
            }
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
        }
    }
}
