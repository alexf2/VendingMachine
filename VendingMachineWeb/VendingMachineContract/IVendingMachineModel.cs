using System.Collections.Generic;
using UseTech.VendingMachine.Contract.DTO;

namespace UseTech.VendingMachine.Contract
{
    /// <summary>
    /// Data contract for Vending Machine.
    /// </summary>
    public interface IVendingMachineModel
    {
        /// <summary>
        /// Machine unique name.
        /// </summary>
        string Name { get; }

        /// <summary>
        /// Goods stock for selling.
        /// </summary>
        IEnumerable<GoodItem> Goods { get; }

        /// <summary>
        /// Machine fund, used for change.
        /// </summary>
        IEnumerable<MoneyItem> Wallet { get; }
    }
}
