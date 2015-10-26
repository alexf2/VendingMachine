using System;
using System.Collections.Generic;
using System.Web.Http.Dependencies;
using Castle.Windsor;

namespace UseTech.Helpers
{
    /// <summary>
    /// Implements Castle Windsor-based MVC resolver.
    /// </summary>
    public class WindsorResolver : IDependencyResolver
    {
        readonly IWindsorContainer _container;
        public WindsorResolver(IWindsorContainer cont)
        {
            _container = cont;
        }

        public object GetService(Type serviceType)
        {
            return _container.Kernel.HasComponent(serviceType) ? _container.Resolve(serviceType) : null;
        }

        public IEnumerable<object> GetServices(Type serviceType)
        {
            return (IEnumerable<object>)_container.ResolveAll(serviceType);
        }

        public IDependencyScope BeginScope()
        {
            return new WindsorDependencyScope(_container);
        }

        public void Dispose()
        {
            //диспозим снаружи
            //_container.Dispose();
        }
    }
}
