using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;


namespace UseTech.Helpers
{
    /// <summary>
    /// Represents money unit validator. Validates for range and fraction. If Nominal = true, then also validates for valid nominals.
    /// </summary>
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter, AllowMultiple = false)]
    public sealed class MoneyvalidationAttribute : ValidationAttribute
    {
        static readonly HashSet<int> _validNominals = new HashSet<int>(new []{0, 1, 2, 5, 10, 50, 100, 500, 1000, 5000});
        static readonly HashSet<int> _validNominalsFraction = new HashSet<int>(new[] {0, 1, 5, 10, 20, 50});

        public MoneyvalidationAttribute (): base() { }

        public MoneyvalidationAttribute (Func<string> errorMessageAccessor) : base(errorMessageAccessor)
        {
        }

        public MoneyvalidationAttribute (string errorMessage) : base(errorMessage)
        {
        }

        /// <summary>
        /// Turns on nominal validation for both: integer part and fractional.
        /// </summary>
        [DefaultValue(false)]
        public bool IsNominal { get; set; }
        
        protected override ValidationResult IsValid (object value, ValidationContext validationContext)
        {
            if (value == null)
                return ValidationResult.Success;
            decimal val;

            try
            {
                val = Convert.ToDecimal(value);
            }
            catch (FormatException ex)
            {
                return new ValidationResult(string.Format("Property '{0}' on {1} is not a decimal. {2}", validationContext.DisplayName, validationContext.ObjectType.Name, ex.Message));
            }
            catch (OverflowException ex)
            {
                return new ValidationResult(string.Format("Can't convert to decimal: '{0}' on {1}. {2}", validationContext.DisplayName, validationContext.ObjectType.Name, ex.Message));
            }

            if (val < 0.01M)
                return new ValidationResult(string.Format("'{0}' on {1} is less than 0.01", validationContext.DisplayName, validationContext.ObjectType.Name));


            ValidationResult res = ValidateFraction(val, validationContext);

            if (res == ValidationResult.Success && IsNominal)
                res = ValidateNominal(val, validationContext);                            

            return res;
        }

        static ValidationResult ValidateFraction(decimal val, ValidationContext validationContext)
        {
            val *= 100M;
            return Math.Truncate(val) == val ? ValidationResult.Success:
                new ValidationResult(string.Format("'{0}' on {1} has extra fraction, it should not be less, than 0.01", validationContext.DisplayName, validationContext.ObjectType.Name));
        }

        static ValidationResult ValidateNominal(decimal val, ValidationContext validationContext)
        {
            if (val == 0)
                return ValidationResult.Success;

            int integral = (int)Math.Truncate(val);
            int fraction = (int) (Decimal.Remainder(val, 1M) * 100);

            if (!_validNominals.Contains(integral))
                return new ValidationResult(string.Format("'{0}' on {1} has invalid nominal {2}", validationContext.DisplayName, validationContext.ObjectType.Name, integral));

            if (!_validNominalsFraction.Contains(fraction))
                return new ValidationResult(string.Format("'{0}' on {1} has invalid акфсешщт {2}", validationContext.DisplayName, validationContext.ObjectType.Name, fraction));

            return ValidationResult.Success;
        }
    }
}
