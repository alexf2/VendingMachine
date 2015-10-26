using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web.Http.Dependencies;
using Castle.MicroKernel.Lifestyle;
using Castle.Windsor;

namespace UseTech.Helpers
{
    /// <summary>
    /// Implements Dependency Scope for Castle Windsor to use in MVC resolver.
    /// </summary>
    public sealed class WindsorDependencyScope : IDependencyScope
    {
        readonly IWindsorContainer _cont;
        IDisposable _scope;

        public WindsorDependencyScope(IWindsorContainer cont)
        {
            _cont = cont;
            _scope = cont.BeginScope();
        }

        public object GetService(Type t)
        {
            return _cont.Kernel.HasComponent(t) ? _cont.Resolve(t) : null;
        }

        public IEnumerable<object> GetServices(Type t)
        {
            return _cont.ResolveAll(t).Cast<object>().ToArray();
        }

        public void Dispose()
        {
            IDisposable s = Interlocked.Exchange(ref _scope, null);
            if (s != null)
                s.Dispose();
        }
    }
}
