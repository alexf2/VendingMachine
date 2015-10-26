using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace UseTech.Helpers
{
    /// <summary>
    /// Provides tools to simplify Data Annotation-based validation.
    /// </summary>
    public static class ValidationHelper
    {
        public static void Validate<T>(T obj, ValidationContext ctx)
        {
            var errors = new List<ValidationResult>();
            bool res = Validator.TryValidateObject(obj, ctx, errors, true);
            if (!res)
            {
                throw new AggregateException(errors.Select((e) => new ValidationException(e is CompositeValidationResult ?
                    e.ErrorMessage + ": " + string.Join("; ", (e as CompositeValidationResult).Results.Select(v => v.ErrorMessage)) :
                    e.ErrorMessage))
                );
            }
        }
    }
}
