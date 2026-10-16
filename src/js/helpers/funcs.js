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
 * Returns a random integer in the inclusive range [min, max].
 *
 * @param {number} min - Lower bound (inclusive).
 * @param {number} max - Upper bound (inclusive).
 * @returns {number} Random integer between `min` and `max`.
 *
 * @throws {TypeError} When arguments are not finite numbers.
 * @throws {RangeError} When `min` is greater than `max`.
 */
export function randomNum(min, max) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new TypeError("[randomNum]: both arguments must be finite numbers.");
  }

  if (min > max) {
    throw new RangeError(`[randomNum]: min (${min}) must not exceed max (${max}).`);
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Filters and returns the elements from `values` that are present in `targetArr`.
 *
 * This function checks if the first argument `targetArr` is a non-empty array and then
 * filters the remaining arguments (`...values`) to find which ones are included in `targetArr`.
 * If `targetArr` is not a valid array or is empty, a warning is logged to the console and an empty array is returned.
 *
 * @param {Array<unknown>} targetArr - The array to check for matches.
 * @param {...*} values - A list of values to check against the `targetArr`.
 *
 * @returns {Array<unknown>} - An array of matched values from `values` that exist in `targetArr`.
 *
 * @example
 * const result = getMatchedFromArray([1, 2, 3, 4], 2, 4, 6);
 * console.log(result); // Output: [2, 4]
 *
 * @example
 * const result = getMatchedFromArray([], 1, 2);
 * console.log(result); // Output: []
 */
export function getMatchedFromArray(targetArr, ...values) {
  if (!Array.isArray(targetArr) || !targetArr.length) {
    console.error(`at getMatchedFromArray: the given array of values is not Array or empty...`);
    return [];
  }

  const targetSet = new Set(targetArr); // Convert targetArr to Set for O(1) lookups
  const flatValues = values.flat(); //to flat possible arrays in the array of values
  return flatValues.filter(val => targetSet.has(val));
}

/**
 *  It randomly chooses the requested amount of elems from the given array
 * @param {*[]} fromArray - target array
 * @param {number} [maxRandCount=1] max number of the random elems from the given array
 * @return {*[] | undefined} the array of the random elements from the given array
 */
export function getRandomElemsfromArray(fromArray, maxRandCount = 1) {
  if (!Array.isArray(fromArray) || fromArray.length < maxRandCount) {
    console.error(`the length of the given array ${fromArray.length} should not be less than max random count ${maxRandCount}...`);
    return;
  }
  const innArray = [...fromArray];

  // Shuffle the array randomly (Fisher-Yates method)
  for (let i = innArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [innArray[i], innArray[j]] = [innArray[j], innArray[i]]; // Swapping elements
  }

  // Return the first maxRandCount numbers
  return innArray.slice(0, maxRandCount);
}

/**
 * @typedef {{
 *   data: Record<string, unknown>,
 *   creationDate: number,
 * }} TLocalStorageEntry
 */

/**
 * Milliseconds in one day, used for TTL calculations.
 * @type {number}
 */
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Reads a localStorage entry and validates it against a TTL in days.
 *
 * Returns `undefined` in every "no usable data" scenario:
 * missing key, malformed JSON, unexpected data shape, or expired TTL.
 *
 * Absence of data is a normal state and is not logged as an error.
 *
 * @param {string} name - localStorage key.
 * @param {number} [timeLimit=1] - Time-to-live in days.
 * @returns {TLocalStorageEntry | undefined} The stored entry, or `undefined`.
 */
export function getLocalStorage(name, timeLimit = 1) {
  let parsed;

  try {
    const storage = localStorage.getItem(name);

    // Missing key is a normal first-visit state, not an error.
    if (storage === null) {
      return undefined;
    }

    parsed = JSON.parse(storage);
  } catch (error) {
    // Quota/security errors on read, or malformed JSON.
    console.error(`[getLocalStorage]: failed to read "${name}":`, error);
    return undefined;
  }

  // Validate the expected entry shape before trusting its fields.
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Number.isFinite(parsed.creationDate)
  ) {
    console.warn(`[getLocalStorage]: entry "${name}" has an invalid shape.`);
    return undefined;
  }

  const ageInDays = (Date.now() - parsed.creationDate) / MS_PER_DAY;

  if (ageInDays > timeLimit) {
    return undefined; // Expired entries are an expected state.
  }

  return /** @type {TLocalStorageEntry} */ (parsed);
}


/**
 * Writes data to localStorage wrapped with a creation timestamp,
 * so that {@link getLocalStorage} can validate its TTL.
 *
 * @param {string} name - localStorage key.
 * @param {Record<string, unknown>} data - Payload to store.
 * @returns {boolean} `true` when the entry was written successfully.
 */
export function setLocalStorage(name, data) {
  const entry = {
    data,
    creationDate: Date.now(),
  };

  try {
    localStorage.setItem(name, JSON.stringify(entry));
    return true;
  } catch (error) {
    // QuotaExceededError or storage disabled (e.g. private mode).
    console.error(`[setLocalStorage]: failed to write "${name}":`, error);
    return false;
  }
}

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
 * Creates a Set containing the keys of an object.
 *
 * The generic key type is preserved instead of being widened
 * to `string`.
 *
 * @template {string} K
 *
 * @param {Record<K, unknown>} object
 *
 * @returns {Set<K>}
 */
export function createKeySet(object) {
  return new Set(
    /** @type {K[]} */
    (Object.keys(object))
  );
}

/**
 * Checks whether a string exists in a Set of valid values.
 *
 * The successful check narrows the value from `string`
 * to the Set's element type.
 *
 * @template {string} T
 *
 * @param {string} value - Value to validate.
 * @param {Set<T>} values - Set containing valid values.
 *
 * @returns {value is T} Whether the value exists in the Set.
 */
export function isInSet(value, values) {
  return values.has(/** @type {T} */ (value));
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
