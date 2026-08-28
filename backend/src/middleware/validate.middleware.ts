import { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware";

interface ValidationRule {
  field: string;
  label: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "array";
  minLength?: number;
}

export const validate = (rules: ValidationRule[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      if (rule.required && (value === undefined || value === null || value === "")) {
        errors.push(`${rule.label} is required`);
        continue;
      }

      if (value !== undefined && value !== null && value !== "") {
        if (rule.type === "string" && typeof value !== "string") {
          errors.push(`${rule.label} must be a string`);
        } else if (rule.type === "number" && typeof value !== "number") {
          errors.push(`${rule.label} must be a number`);
        } else if (rule.type === "boolean" && typeof value !== "boolean") {
          errors.push(`${rule.label} must be a boolean`);
        } else if (rule.type === "array" && !Array.isArray(value)) {
          errors.push(`${rule.label} must be an array`);
        }

        if (rule.minLength && typeof value === "string" && value.length < rule.minLength) {
          errors.push(`${rule.label} must be at least ${rule.minLength} characters`);
        }
      }
    }

    if (errors.length > 0) {
      next(new AppError(errors.join(", "), 400));
      return;
    }

    next();
  };
};
