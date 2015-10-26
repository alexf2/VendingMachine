using DataAnnotationsExtensions;
using UseTech.Helpers;

namespace UseTech.VendingMachine.Contract.DTO
{
    /// <summary>
    /// Money item carrier
    /// </summary>
    public struct MoneyItem
    {
        [Min(0.01), Moneyvalidation(IsNominal = true)]
        public decimal Nominal { get; set; }
        
        [Min(0L)]
        public long Amount { get; set; }
    }
}
