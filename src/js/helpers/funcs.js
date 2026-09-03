'use strict';

/**** TYPE DEFINITIONS ****/
/**
 * for typing of argument params of {@link getInvalidKeys}
 * @typedef {{
 *   invalidValues?: unknown[]
 * }} TGetInvalidKeysParams
 */

export function randomNum(max, min) {
  return Math.floor(Math.random() * max) + min;
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
 * @param {Array} fromArray - target array
 * @param {number} [maxRandCount=1] max number of the random elems from the given array
 * @return {*[] | []} the array of the random elements from the given array
 */
export function getRandomElemsfromArray(fromArray, maxRandCount = 1) {
  if (!Array.isArray(fromArray) || fromArray.length < maxRandCount) {
    console.error(`the length of the given array ${fromArray.length} should not be less than max random count ${maxRandCount}...`);
    return [];
  }

  // Shuffle the array randomly (Fisher-Yates method)
  for (let i = fromArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fromArray[i], fromArray[j]] = [fromArray[j], fromArray[i]]; // Swapping elements
  }

  // Return the first maxRandCount numbers
  return fromArray.slice(0, maxRandCount);
}


/**
 * It gets the LocalStorage by name, validating by the time limit in days;
 * If the time limit is expired, then to return false;
 * If the LocalStorage does not exist then to return false;
 * Else to return the data;
 * @param { string } name of the LocalStorage data;
 * @param { number } [timeLimit=1]: number of days;
 * @returns { object | boolean } the data, stored in the LocalStorage...
 * or false, if its not found or expired by time
 * */
export function getLocalStorage( name, timeLimit=1 ) {
  const storage = localStorage.getItem( name );
  let innData;
  if ( storage ) {
    innData = JSON.parse( storage );
    const creationDate = innData.creationDate;
    const currentDate = Date.now();
    if (((currentDate - creationDate)/1000/60/60/24) > timeLimit) {
      return false;
    }
    return innData;
  }
  return false;
}

/**@description it receives the data and update it with the current Date
 * and sets the localStorage;
 * @param {string} name The name of the LocalStorage to be set
 * @param {Object} data which is fetched
 * */
export function setLocalStorage( name="localData", data ) {
  //log(data, "setting localStorage Data");

  const dataWithDate = {
    data,
    creationDate: Date.now()
  };
  localStorage.setItem(name, JSON.stringify( dataWithDate ));
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
