using System.Web.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using UseTech.VendingMachine.Contract;


namespace UseTech.VendingMachine.Web.Controllers
{
    /// <summary>
    /// VM simulator data Web Api REST service.
    /// </summary>
    [RoutePrefix("api")]
    [Route("vendingsimulator/", Name = "SimulatorRoute")]    
    public class VenidngSimulatorController : ApiController
    {
        readonly IVendingSimulatorModel _vsm;

        public VenidngSimulatorController (IVendingSimulatorModel vsm)
        {
            _vsm = vsm;
        }

        //test URL: http://localhost/VendingMachine/api/vendingsimulator
        [HttpGet]
        public IHttpActionResult GetModel()
        {
            return Json(_vsm, new Newtonsoft.Json.JsonSerializerSettings()
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                Formatting = Formatting.Indented
            });
        }
    }
}
