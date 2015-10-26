using System.ComponentModel.DataAnnotations;
using DataAnnotationsExtensions;
using UseTech.Helpers;

namespace UseTech.VendingMachine.Contract.DTO
{
    /// <summary>
    /// Data carrier for goods
    /// </summary>
    public struct GoodItem
    {
        [Required]
        [MinLength(2, ErrorMessage="Good's name should be longer, than 2 character")]
        public string Name { get; set; }

        [Min(0.01), Moneyvalidation]
        public decimal Price { get; set; }

        [Min(0)]
        public long CountInPieces { get; set; }
    }
}
