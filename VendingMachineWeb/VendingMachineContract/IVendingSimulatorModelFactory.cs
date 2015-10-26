
namespace UseTech.VendingMachine.Contract
{
    /// <summary>
    /// Provides a generic mechanism to create a VM simulator data model.
    /// </summary>
    public interface IVendingSimulatorModelFactory
    {
        IVendingSimulatorModel Create(IVendingMachineModel vm, string userName);
    }
}
