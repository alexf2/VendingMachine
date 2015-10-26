using AutoMapper;
using Castle.Windsor;
using Castle.MicroKernel.Registration;
using Castle.MicroKernel.SubSystems.Configuration;
using UseTech.VendingMachine.Runtime.Config;
using DTO = UseTech.VendingMachine.Contract.DTO;

namespace UseTech.VendingMachine.Runtime
{
    /// <summary>
    /// Implements the assembly installer. Is executed by Castle Windsor once, at the application startup.
    /// </summary>
    public sealed class AssemblyInstaller : IWindsorInstaller
    {
        public void Install(IWindsorContainer container, IConfigurationStore store)
        {
            //configuring data mappings from configuration-level objects to data transfer objects
            Mapper.CreateMap<VmSimulatorConfig.MoneyItem, DTO.MoneyItem>();
            Mapper.CreateMap<VmSimulatorConfig.Good, DTO.GoodItem>();

            Mapper.AssertConfigurationIsValid();
        }        
    }
}
