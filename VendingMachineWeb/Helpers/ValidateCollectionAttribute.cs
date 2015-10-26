using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace UseTech.Helpers
{
    /// <summary>
    /// When applied to a collection type property, causes each item validation. 
    /// </summary>
    public sealed class ValidateCollectionAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {            
            var results = new List<ValidationResult>();
            CompositeValidationResult compositeResults = null;

            foreach (var o in (IEnumerable)value)
            {                
                var context = new ValidationContext(o, null, null);
                Validator.TryValidateObject(o, context, results, true);

                if (results.Count != 0)
                {
                    if (compositeResults == null)
                        compositeResults = new CompositeValidationResult(String.Format("Validation for '{0}' failed", validationContext.DisplayName));
                    results.ForEach(compositeResults.AddResult);
                    results.Clear();
                }
            }

            if (compositeResults != null)                
                throw new ValidationException(string.Format("Validation for '{0}' failed", validationContext.DisplayName),
                    new AggregateException(compositeResults.Results.Select(r => new ValidationException(r.ErrorMessage))));                

            return ValidationResult.Success;
        }
    }
}
