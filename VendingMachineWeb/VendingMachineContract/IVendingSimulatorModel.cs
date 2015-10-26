using System.Collections.Generic;
using UseTech.VendingMachine.Contract.DTO;

namespace UseTech.VendingMachine.Contract
{
    /// <summary>
    /// Data contract for VM simulator.
    /// </summary>
    public interface IVendingSimulatorModel
    {
        /// <summary>
        /// Test customer fund.
        /// </summary>
        IEnumerable<MoneyItem> CustomerWallet { get; }

        /// <summary>
        /// Machine facilities.
        /// </summary>
        IVendingMachineModel VendingMachine { get; }
    }
}
