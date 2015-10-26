using System.Collections.Generic;
using UseTech.Helpers;
using UseTech.VendingMachine.Contract;
using UseTech.VendingMachine.Contract.DTO;

namespace UseTech.VendingMachine.Runtime.Model
{
    /// <summary>
    /// Implements Vending Machine simulator data model.
    /// </summary>
    public class VendingSimulatorModel : IVendingSimulatorModel
    {
        List<MoneyItem> _customerWallet;

        [ValidateCollection]
        public IEnumerable<MoneyItem> CustomerWallet
        {
            get { return _customerWallet ?? (_customerWallet = new List<MoneyItem>()); }
        }

        [ValidateObject]
        public IVendingMachineModel VendingMachine { get; private set; }

        /// <summary>
        /// Implements VM simulator data model builder. Facilitates friction-less and clean model instantiation.
        /// </summary>
        public sealed class VendingSimulatorModelBuilder
        {
            readonly VendingSimulatorModel _vms;
            public VendingSimulatorModelBuilder(IVendingMachineModel vm)
            {
                _vms = new VendingSimulatorModel() {VendingMachine = vm};
            }

            public VendingSimulatorModelBuilder AddCustomerFund(MoneyItem item)
            {
                ((IList<MoneyItem>)_vms.CustomerWallet).Add(item);
                return this;
            }

            public VendingSimulatorModel Build()
            {                
                return _vms;
            }
        }
    }
}
