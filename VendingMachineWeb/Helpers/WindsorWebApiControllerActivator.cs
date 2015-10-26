using System;
using System.Net.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Dispatcher;
using Castle.Windsor;

namespace UseTech.Helpers
{
    /// <summary>
    /// Implements Catsle Windsor-based composition root for WEB API.
    /// </summary>
    public sealed class WindsorWebApiControllerActivator : IHttpControllerActivator
    {
        readonly IWindsorContainer _cont;

        public WindsorWebApiControllerActivator(IWindsorContainer cont)
        {
            _cont = cont;
        }

        public IHttpController Create(HttpRequestMessage request, HttpControllerDescriptor controllerDescriptor, Type controllerType)
        {
            var res = (IHttpController)_cont.Resolve(controllerType);
            request.RegisterForDispose(new Releaser(() => _cont.Release(res)));
            return res;
        }
    }
}
