using System.Collections.Generic;
using UseTech.Helpers;
using UseTech.VendingMachine.Contract;
using UseTech.VendingMachine.Contract.DTO;

namespace UseTech.VendingMachine.Runtime.Model
{
    /// <summary>
    /// Implements Vending Machine data model.
    /// </summary>
    public class VendingMachineModel : IVendingMachineModel
    {
        List<GoodItem> _goods;
        List<MoneyItem> _wallet;

        public string Name { get; private set; }


        [ValidateCollection]
        public IEnumerable<GoodItem> Goods
        {
            get { return _goods ?? (_goods = new List<GoodItem>()); }
        }

        [ValidateCollection]
        public IEnumerable<MoneyItem> Wallet
        {
            get { return _wallet ?? (_wallet = new List<MoneyItem>()); }
        }


        /// <summary>
        /// Implements VM data model builder. Facilitates friction-less and clean model instantiation.
        /// </summary>
        public sealed class VendingMachineModelBuilder
        {
            readonly VendingMachineModel _vm;
            public VendingMachineModelBuilder(string name)
            {
                _vm = new VendingMachineModel() {Name = name};
            }

            public VendingMachineModelBuilder AddGood(GoodItem item)
            {
                ((IList<GoodItem>)_vm.Goods).Add(item);
                return this;
            }

            public VendingMachineModelBuilder AddFund(MoneyItem item)
            {                
                ((IList<MoneyItem>)_vm.Wallet).Add(item);
                return this;
            }

            public VendingMachineModel Build()
            {
                if (_vm._wallet != null)
                    _vm._wallet.Sort( (i1, i2) => i2.Nominal.CompareTo(i1.Nominal) );
                return _vm;
            }
        }
    }
}
