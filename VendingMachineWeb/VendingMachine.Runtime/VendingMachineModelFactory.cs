using System.Linq;
using AutoMapper;
using UseTech.VendingMachine.Contract;
using UseTech.VendingMachine.Runtime.Config;
using UseTech.VendingMachine.Runtime.Model;

using DTO = UseTech.VendingMachine.Contract.DTO;

namespace UseTech.VendingMachine.Runtime
{
    /// <summary>
    /// Implements a concrete factory for VM data model.
    /// </summary>
    public sealed class VendingMachineModelFactory : IVendingMachineModelFactory
    {
        public IVendingMachineModel Create(string vendingMacineName)
        {
            var cfg = VmSimulatorConfig.Instance;
            var builder = new VendingMachineModel.VendingMachineModelBuilder(vendingMacineName);

            var vm = cfg.VendingMachines.FirstOrDefault(w => w.Name == vendingMacineName);

            foreach (var good in vm.Goods)
                builder.AddGood(Mapper.Map<DTO.GoodItem>(good));

            foreach (var fund in cfg.Wallets.FirstOrDefault(w => w.Name == vm.WalletRef).Items)
                builder.AddFund(Mapper.Map<DTO.MoneyItem>(fund));

            return builder.Build();
        }
    }
}
