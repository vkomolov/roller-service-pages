'use strict';

/**** TYPE DEFINITIONS ****/

/**
 *! DOM type aliases used by this module.
 *
 * @typedef {import("../types/dom.types.js").TLogMessageParams} TLogMessageParams
 */

/**
 * for typing of argument params of {@link getInvalidKeys}
 * @typedef {{
 *   invalidValues?: unknown[]
 * }} TGetInvalidKeysParams
 */

////////////

/**
 * Type guard that checks if a key exists in an object.
 * Narrows the key type to keyof T, allowing safe indexed access.
 *
 * @template {Record<PropertyKey, unknown>} T
 * @param {T} obj - The object to check the key against.
 * @param {PropertyKey} key - The key to check.
 * @returns {key is keyof T} True if key exists in the object.
 *
 * @example
 * const handlers = { head: (v) => v, main: (v) => v };
 * const key = "head";
 * if (isKeyOf(handlers, key)) {
 *   handlers[key](value); // TS knows key is "head" | "main"
 * }
 */
export function isKeyOf(obj, key) {
  return key in obj;
}

/**
 * Returns the names of missing or invalid object properties.
 *
 * A property is considered missing if:
 * - it does not exist as an own property of the object;
 * - or its value matches one of the specified invalid values.
 *
 * String values are trimmed before comparison, so a value containing
 * only whitespace is treated as an empty string (`''`).
 *
 * @param {Record<string, unknown>} targetObj
 * @param {string[]} keys
 * @param {TGetInvalidKeysParams} [params]
 * @returns {string[]}
 *
 * @example
 * getInvalidKeys(
 *   targetObj,
 *   ['selector', 'pageType'],
 *   {invalidValues: [undefined, null, '']}
 * );
 *
 * @example
 * getInvalidKeys(
 *   targetObj,
 *   ['count', 'enabled'],
 *   {invalidValues: [undefined, null, '', 0]}
 * );
 *
 */
export function getInvalidKeys(targetObj, keys, params) {
  const invalidValues = params?.invalidValues ?? [];
  const invalidSet = new Set(invalidValues);

  return keys.filter(key => {
    if (!Object.hasOwn(targetObj, key)) {
      return true;
    }

    const value = targetObj[key];

    return invalidSet.has(
      typeof value === "string"
        ? value.trim()
        : value
    );
  });
}

/**
 * @param {"warn"|"log"|"error"} logType
 * @param {TLogMessageParams} params
 * @returns {void}
 */
export function initLog(logType, params) {
  const { component = 'Unknown', message = '', details } = params;

  if (typeof console[logType] !== 'function') {
    throw new TypeError(`[initLog]: unsupported log type "${logType}".`);
  }

  const formattedMessage = `[${component}]: ${message}`;

  if (details !== undefined) {
    // We pass them as separate arguments—modern browsers render this perfectly.
    console[logType](formattedMessage, '\nDetails:', details);
  }
  else {
    console[logType](formattedMessage);
  }
}

/**
 * Wraps a function to catch and log synchronous errors.
 *
 * @template {(...args: any[]) => any} T
 *
 * @param {T} func - The function to wrap.
 * @param {string} [fallbackName] - Optional custom name for logging (useful for anonymous/arrow functions).
 *
 * @returns {(...args: Parameters<T>) => (ReturnType<T> | undefined)}
 * A wrapped function that returns the original result or undefined if an error occurs.
 *
 * @throws {TypeError} If func is not a function.
 *
 * @example
 * // Option 1: Named function (the name will be picked up automatically)
 * function calculateTax(amount) { return amount * 0.2; }
 * const safeTax = tryUse(calculateTax);
 * safeTax(100);
 *
 * @example
 * // Option 2: Arrow function with a custom name for logs
 * const safeSum = tryUse((a, b) => a + b, 'sumOperation');
 * console.log(safeSum(2, 3)); // 5
 *
 * @example
 * const safeSum = tryUse((a, b) => a + b, 'sumOperation')(2, 3);
 *
 * @example
 * const safeSum = tryUse(someFunc)(2, 3);
 */
export function tryUse(func, fallbackName) {
  if (typeof func !== 'function') {
    initLog('error', {
      component: 'tryUse',
      message: `Expected a function, received "${typeof func}".`,
      details: new TypeError(`Received ${typeof func} instead of function`),
    });

    return () => undefined;
  }

  const component = func.name || fallbackName || 'AnonymousFunction';

  return (/** @type {Parameters<T>} */ ...args) => {
    try {
      return func(...args);
    } catch (error) {
      initLog('error', {
        component,
        message: `An error occurred during animation initialization.`,
        details: error,
      });

      return undefined;
    }
  };
}
