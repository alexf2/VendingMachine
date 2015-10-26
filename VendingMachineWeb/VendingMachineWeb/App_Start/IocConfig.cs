using System.Web.Http;
using System.Web.Http.Dispatcher;
using System.Web.Mvc;
using Castle.Windsor;
using Castle.Windsor.Installer;
using UseTech.VendingMachine.Runtime;
using UseTech.Helpers;

namespace UseTech.VendingMachine.Web.App_Start
{
    /// <summary>
    /// Implements setting up of dependency injection container and plugging it to MVC and Web Api.
    /// Composition root configuration is done in Castle Windsor installers, which are executed in line _container.Install.
    /// </summary>
    static class IocConfig
    {
        private static IWindsorContainer _container;

        public static void Register()
        {
            _container = new WindsorContainer();
            //_container.Kernel.Resolver.AddSubResolver(new ArrayResolver(_container.Kernel));
            //_container.AddFacility<TypedFactoryFacility>();
            _container.Install(new[] { FromAssembly.This(), FromAssembly.Containing<VendingMachineModelFactory>() });

            //For IoC pattern in MVC
            ControllerBuilder.Current.SetControllerFactory(new WindsorControllerFactory(_container.Kernel));

            //For IoC pattern in Web Api services
            GlobalConfiguration.Configuration.Services.Replace(
                typeof(IHttpControllerActivator),
                new WindsorWebApiControllerActivator(_container)
             );

            //For Service Locator pattern
            //GlobalConfiguration.Configuration.DependencyResolver = new WindsorResolver(_container);
        }

        public static void Teardown()
        {
            _container.Dispose();
        }
    }
}