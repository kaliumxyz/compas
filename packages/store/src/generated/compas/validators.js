// Generated by @compas/code-gen
/* eslint-disable no-unused-vars */

import { AppError, isNil } from "@compas/stdlib";
import {
  anonymousValidator446238440,
  anonymousValidator572766398,
} from "../common/anonymous-validators.js";
/**
 * @template T
 * @typedef {import("@compas/stdlib").Either<T, AppError>} Either
 */
/**
 * @param {undefined|any|CompasSqlOrderByInput} value
 * @param {string|undefined} [propertyPath]
 * @returns {Either<CompasSqlOrderBy>}
 */
export function validateCompasSqlOrderBy(value, propertyPath = "$") {
  const result = anonymousValidator446238440(value, propertyPath);
  if (result.errors) {
    const info = {};
    for (const err of result.errors) {
      if (isNil(info[err.propertyPath])) {
        info[err.propertyPath] = err;
      } else if (Array.isArray(info[err.propertyPath])) {
        info[err.propertyPath].push(err);
      } else {
        info[err.propertyPath] = [info[err.propertyPath], err];
      }
    }
    /** @type {{ error: AppError }} */
    return {
      error: AppError.validationError("validator.error", info),
    };
  }
  /** @type {{ value: CompasSqlOrderBy}} */
  return { value: result.value };
}
/**
 * @param {undefined|any|CompasSqlOrderByOptionalFieldInput} value
 * @param {string|undefined} [propertyPath]
 * @returns {Either<CompasSqlOrderByOptionalField>}
 */
export function validateCompasSqlOrderByOptionalField(
  value,
  propertyPath = "$",
) {
  const result = anonymousValidator572766398(value, propertyPath);
  if (result.errors) {
    const info = {};
    for (const err of result.errors) {
      if (isNil(info[err.propertyPath])) {
        info[err.propertyPath] = err;
      } else if (Array.isArray(info[err.propertyPath])) {
        info[err.propertyPath].push(err);
      } else {
        info[err.propertyPath] = [info[err.propertyPath], err];
      }
    }
    /** @type {{ error: AppError }} */
    return {
      error: AppError.validationError("validator.error", info),
    };
  }
  /** @type {{ value: CompasSqlOrderByOptionalField}} */
  return { value: result.value };
}
