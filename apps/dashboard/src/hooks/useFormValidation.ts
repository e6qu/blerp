import { useState, useCallback } from "react";

type ValidatorFn = (value: string) => string | undefined;

export function required(message = "This field is required"): ValidatorFn {
  return (value) => (value.trim() ? undefined : message);
}

export function minLength(n: number, message?: string): ValidatorFn {
  return (value) => (value.length >= n ? undefined : message || `Must be at least ${n} characters`);
}

export function maxLength(n: number, message?: string): ValidatorFn {
  return (value) => (value.length <= n ? undefined : message || `Must be at most ${n} characters`);
}

export function email(message = "Invalid email address"): ValidatorFn {
  return (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : message);
}

export function matches(regex: RegExp, message = "Invalid format"): ValidatorFn {
  return (value) => (regex.test(value) ? undefined : message);
}

type Rules<T extends string> = Record<T, ValidatorFn[]>;

export function useFormValidation<T extends string>(rules: Rules<T>) {
  const [errors, setErrors] = useState<Partial<Record<T, string>>>({});

  const validateField = useCallback(
    (field: T, value: string): string | undefined => {
      const fieldRules = rules[field];
      if (!fieldRules) return undefined;

      for (const rule of fieldRules) {
        const error = rule(value);
        if (error) {
          setErrors((prev) => ({ ...prev, [field]: error }));
          return error;
        }
      }
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      return undefined;
    },
    [rules],
  );

  const validate = useCallback(
    (values: Record<T, string>): boolean => {
      const newErrors: Partial<Record<T, string>> = {};
      let isValid = true;

      for (const field of Object.keys(rules) as T[]) {
        const value = values[field] || "";
        for (const rule of rules[field]) {
          const error = rule(value);
          if (error) {
            newErrors[field] = error;
            isValid = false;
            break;
          }
        }
      }

      setErrors(newErrors);
      return isValid;
    },
    [rules],
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return { errors, validate, validateField, clearErrors, isValid };
}
