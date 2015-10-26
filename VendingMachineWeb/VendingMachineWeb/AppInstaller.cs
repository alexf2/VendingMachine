using System;
using System.Configuration;
using System.Web.Http;
using System.Web.Mvc;
using Castle.MicroKernel.Registration;
using Castle.MicroKernel.SubSystems.Configuration;
using Castle.Windsor;
using UseTech.VendingMachine.Contract;
using UseTech.VendingMachine.Runtime;

namespace UseTech.VendingMachine.Web
{
    /// <summary>
    /// Web application composition root. Loads type mappings into the dependency injection container.
    /// </summary>
    public sealed class AppInstaller : IWindsorInstaller
    {
        public void Install(IWindsorContainer container, IConfigurationStore store)
        {
            container.Register(
                Classes.FromThisAssembly()
                    .Where(t => typeof(IController).IsAssignableFrom(t) || typeof(ApiController).IsAssignableFrom(t))
                    .Configure(configurer => configurer.Named(configurer.Implementation.Name))
                    .LifestylePerWebRequest(),


                Classes.FromAssemblyContaining<VendingMachineModelFactory>()
                    .Where(t => t.Name.EndsWith("Factory", StringComparison.Ordinal))
                    .WithService.FirstInterface().LifestyleSingleton(),
                    //.ConfigureFor<VendingMachineModelFactory>(reg => reg.DependsOn(Property.ForKey("vendingMacineName").Eq(ConfigurationManager.AppSettings["simulator-vm"])))
                    //.ConfigureFor<VendingSimulatorModelFactory>(reg => reg.DependsOn(Property.ForKey("userName").Eq(ConfigurationManager.AppSettings["simulator-user"]))),

                
                Component.For<IVendingMachineModel>().UsingFactoryMethod(k => k.Resolve<IVendingMachineModelFactory>().Create(
                    ConfigurationManager.AppSettings["simulator-vm"])).LifestylePerWebRequest(),

                Component.For<IVendingSimulatorModel>().UsingFactoryMethod(k => k.Resolve<IVendingSimulatorModelFactory>().Create(
                    k.Resolve<IVendingMachineModel>(), 
                    ConfigurationManager.AppSettings["simulator-user"])).LifestylePerWebRequest()
            );
        }
    }
}