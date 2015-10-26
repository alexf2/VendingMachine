
namespace UseTech.VendingMachine.Contract
{
    /// <summary>
    /// Provides a generic mechanism to create a VM data model. 
    /// </summary>
    public interface IVendingMachineModelFactory
    {
        IVendingMachineModel Create(string vendingMacineName);
    }
}
