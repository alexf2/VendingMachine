using System.Web.Mvc;

namespace UseTech.VendingMachine.Web.Controllers
{
    /// <summary>
    /// Landing page MVC controller.
    /// </summary>
    public class HomeController : Controller
    {
        public ActionResult Index()
        {            
            return View();
        }        
    }
}