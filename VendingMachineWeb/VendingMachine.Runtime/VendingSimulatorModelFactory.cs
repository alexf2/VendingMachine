using System.ComponentModel.DataAnnotations;
using System.Linq;
using UseTech.Helpers;
using UseTech.VendingMachine.Contract;
using AutoMapper;
using UseTech.VendingMachine.Runtime.Config;
using UseTech.VendingMachine.Runtime.Model;

using DTO = UseTech.VendingMachine.Contract.DTO;

namespace UseTech.VendingMachine.Runtime
{
    /// <summary>
    /// Implements a concrete model for VM simulator data model.
    /// </summary>
    public sealed class VendingSimulatorModelFactory : IVendingSimulatorModelFactory
    {
        public IVendingSimulatorModel Create(IVendingMachineModel vm, string userName)
        {
            var cfg = VmSimulatorConfig.Instance;
            var builder = new VendingSimulatorModel.VendingSimulatorModelBuilder(vm);

            foreach (var fund in cfg.Wallets.FirstOrDefault(w => w.Name == userName).Items)
                builder.AddCustomerFund(Mapper.Map<DTO.MoneyItem>(fund));

            var res = builder.Build();

            ValidationHelper.Validate(res, new ValidationContext(res, null, null));

            return res;
        }
    }
}
