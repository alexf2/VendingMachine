using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace UseTech.Helpers
{
    /// <summary>
    /// When applied to a property, causes recursive object validation.
    /// </summary>
    public sealed class ValidateObjectAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var results = new List<ValidationResult>();
            var context = new ValidationContext(value, null, null);

            Validator.TryValidateObject(value, context, results, true);

            if (results.Count != 0)                            
                throw new ValidationException(string.Format("Validation for '{0}' failed", validationContext.DisplayName),
                    new AggregateException(results.Select( r => new ValidationException(r.ErrorMessage))));                
            

            return ValidationResult.Success;
        }
    }

    public class CompositeValidationResult : ValidationResult
    {
        private readonly Lazy<List<ValidationResult>> _results = new Lazy<List<ValidationResult>>(() => new List<ValidationResult>());

        public IEnumerable<ValidationResult> Results
        {
            get
            {
                return _results.Value;
            }
        }

        public CompositeValidationResult(string errorMessage) : base(errorMessage) { }
        public CompositeValidationResult(string errorMessage, IEnumerable<string> memberNames) : base(errorMessage, memberNames) { }
        protected CompositeValidationResult(ValidationResult validationResult) : base(validationResult) { }

        public void AddResult(ValidationResult validationResult)
        {
            _results.Value.Add(validationResult);
        }
    }
}
