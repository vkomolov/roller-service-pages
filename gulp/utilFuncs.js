"use strict";

/*gulp/utilFuncs.js*/

import fs, { constants } from 'fs';
import path from "path";
import { rimraf } from 'rimraf';

/**
 * It checks the path for existence
 * @param {string} targetPath - Full path to the file or directory to check for access
 * @param {number} [mode = fs.constants.F_OK] - Access mode (e.g., fs.constants.F_OK, fs.constants.R_OK, etc.)
 * @returns {Promise<boolean>}
 */
export async function checkAccess(targetPath, mode = constants.F_OK) {
	try {
		await fs.promises.access(targetPath, mode); // async access
		return true;
	}
	catch {
		return false;
	}
}

/**
 * Checks if the item is a file and matches the target filename.
 * @param {string} fullPath - Full path to the item to be checked with the target filename
 * @param {string} fileName - Target filename
 * @param {number} mode - Access mode
 * @returns {Promise<boolean>}
 */
async function isMatchingFile(fullPath, fileName, mode) {
	const isFile = (await fs.promises.stat(fullPath)).isFile();
	const isMatch = path.basename(fullPath) === fileName;
	const isAccessible = await checkAccess(fullPath, mode);
	return isFile && isMatch && isAccessible;
}

/**
 * Searches for file in a single directory (non-recursive)
 * @param {string} dir - Directory to search
 * @param {string} fileName - Target filename
 * @param {number} mode - Access mode
 * @returns {Promise<SearchResult>}
 */
async function searchInDirectory(dir, fileName, mode) {
	const items = await fs.promises.readdir(dir);

	for (const item of items) {
		const fullPath = path.join(dir, item);
		const isMatch = await isMatchingFile(fullPath, fileName, mode);

		if (isMatch) {
			return createResult(true, fullPath);
		}
	}

	return createResult(false);
}


/**
 * @typedef {object} SearchResult
 * @property {boolean} found - Whether file was found
 * @property {string} [path] - Full path if found
 */

/**
 * Creates a search result object
 * @param {boolean} found
 * @param {string} [fullPath]
 * @returns {SearchResult}
 */
const createResult = (found, fullPath) => ({
	found,
	...(fullPath && { path: fullPath })
});

/**
 * Gets subdirectories of a given directory
 * @param {string} dir - Directory to scan
 * @returns {Promise<string[]>} - Array of subdirectory paths
 */
async function getSubdirectories(dir) {
	const items = await fs.promises.readdir(dir, { withFileTypes: true });

	return items
		.filter(item => item.isDirectory())
		.map(item => path.join(dir, item.name));
}


/**
 * Recursively searches directories for a file
 * @param {string[]} directories - Queue of directories to search
 * @param {string} fileName - Target filename
 * @param {number} mode - Access mode
 * @returns {Promise<SearchResult>}
 */
async function searchRecursively(directories, fileName, mode) {
	for (const dir of directories) {
		// Search current directory
		const result = await searchInDirectory(dir, fileName, mode);

		if (result.found) {
			return result;
		}

		// Add subdirectories to queue for later processing
		const subdirs = await getSubdirectories(dir);
		directories.push(...subdirs);
	}

	return createResult(false);
}

/**
 * Recursively searches for a file in a directory and its subdirectories.
 * @param {string} dir - The directory to search in.
 * @param {string} fileName - The name of the file to search for.
 * @param {boolean} [isNested=false] - If true, searches in subdirectories.
 * @param {boolean} [returnPath=false] - If true, returns the full path of the found file.
 * @param {number} [mode=fs.constants.F_OK] - The access mode to check.
 * @returns {Promise<string|boolean>} - Returns the full path or boolean.
 */
export async function checkFileInDir(
	dir,
	fileName,
	isNested = false,
	returnPath = false,
	mode = fs.constants.F_OK
) {
	try {
		const directories = [dir];
		const result = isNested
			? await searchRecursively(directories, fileName, mode)
			: await searchInDirectory(dir, fileName, mode);

		return returnPath && result.path ? result.path : result.found;
	}
	catch (error) {
		console.error(`Error in checkFileInDir: ${error instanceof Error ? error.message : String(error)}`);
		return false;
	}
}

/**
 * If the path exists, it returns the Promise of the path to be deleted; else it returns an empty Promise
 * @param {string | string[]} targetPaths - path or array of paths to delete
 * @returns {Promise<void>}
 */
export async function cleanDist(targetPaths) {
	const pathArr = Array.isArray(targetPaths) ? targetPaths : [targetPaths];
	const deletePromises = pathArr.map(async pathStr => {
		const pathExists = await checkAccess(pathStr);
		if (pathExists) {
			await rimraf(pathStr);
		}
	});
	await Promise.all(deletePromises);
}

/**
 *
 * @param {string} taskTypeError
 * @return {(function(Error): void)}
 */
export function handleError(taskTypeError) {
	/**@param {Error} err
	 */
	return function (err) {
		console.error(taskTypeError, err.message);
	}
}

/**
 * Combine paths into a single array of strings.
 * @param {(string | string[])[]} paths - Strings or arrays of strings to combine.
 * @returns {string[]} - Combined array of strings.
 */
export const combinePaths = (...paths) => {
	/** @type {string[]} */
	const initial = [];
	return paths.reduce(
		/** @param {string[]} acc
		 * @param {string | string[]} path
		 *
		 * @returns {string[]} */
		(acc, path) => {
			if (Array.isArray(path)) {
				return [...acc, ...path];
			}
			return [...acc, path];
		},
		initial
	);
}

/**
 * @typedef {object} VinylFile
 * @property {Function} isDirectory - Returns true if file is a directory
 * @property {Function} isNull - Returns true if file has null contents
 * @property {Function} isStream - Returns true if file is a stream
 * @property {Buffer|null|NodeJS.ReadableStream} contents - File contents
 * @property {string} path - File path
 * @property {string} base - Base directory
 * @property {string} [baseName] - Base name of the file
 */

/**
 * Processes file to ensure its contents are in buffer format, handles null and stream files.
 * @param {VinylFile} file - The file object from the stream (Vinyl file object).
 * @throws {Error} - Throws an error if file is a stream or has null contents.
 * @returns {VinylFile|null} - The processed file object with its contents in buffer format, or null if file is null.
 */
export function processFile(file) {
	// Check if file.contents is a buffer; if not, convert it to buffer
	if (!(Buffer.isBuffer(file.contents))) {
		// Only convert string contents to buffer, skip null and streams
		if (typeof file.contents === 'string') {
			file.contents = Buffer.from(file.contents);
		}
	}

	// Handle null file
	if (file.isNull()) {
		console.error("file is null...", file.baseName);
		return null;
	}

	// Handle stream file
	if (file.isStream()) {
		throw new Error("Streaming is not supported...");
	}

	return file;
}

/**
 * Converts attributes object into HTML string.
 * Filters out invalid values and warns if any were removed.
 *
 * Rules:
 * - undefined / null / false → removed
 * - true → boolean attribute (no value)
 * - string/number → key="value"
 *
 * @param {object} attrs
 * @returns {string}
 */
function stringifyAttrs(attrs) {
	/**
	 * @type {string[]} removedKeys
	 */
	const removedKeys = [];

	const result = Object.entries(attrs)
		.filter(([key, value]) => {
			const isValid =
				value !== undefined &&
				value !== null &&
				value !== false;

			if (!isValid) {
				removedKeys.push(key);
			}

			return isValid;
		})
		.map(([key, value]) => {
			// Boolean attribute (e.g. defer, async)
			if (value === true) {
				return key;
			}

			return `${key}="${value}"`;
		})
		.join(" ");

	// Warn if any attributes were removed
	if (removedKeys.length) {
		console.warn(
			`[getMetaTag]: removed invalid attributes → ${removedKeys.join(", ")}`
		);
	}

	return result;
}

/**
 * Generates an HTML <link> or <script> tag based on provided parameters.
 * params.tagType - Defines the tag behavior:
 *! tagType: "script" → generates <script>
 *! any other tagType → generates <link rel="...">
 * params.dataSrc - URL for the resource (href or src)
 *! Additional properties will be converted into HTML attributes.
 * @param {{
 *  tagType: string,
 *  dataSrc: string|URL,
 *  [key: string]: any
 * }} params - Configuration object
 *
 * @returns {string} Generated HTML string
 *
 * @example
 * // Generate stylesheet link
 * getMetaLinkTag({
 *   tagType: "stylesheet",
 *   dataSrc: "/styles.css"
 * });
 * // => <link rel="stylesheet" href="/styles.css">
 *
 * @example
 * // Generate script with module type
 * getMetaLinkTag({
 *   tagType: "script",
 *   dataSrc: "/app.js",
 *   type: "module"
 * });
 * // => <script src="/app.js" type="module"></script>
 *
 * @example
 * // Generate script with boolean attribute
 * getMetaLinkTag({
 *   tagType: "script",
 *   dataSrc: "/app.js",
 *   defer: true
 * });
 * // => <script src="/app.js" defer></script>
 */
function getMetaLinkTag(params) {
	const { tagType, dataSrc, ...restAttrs } = params;

	if (!tagType || !dataSrc) {
		throw new Error(
			`[getMetaTag]: invalid params → tagType: ${tagType}, dataSrc: ${dataSrc}`
		);
	}

	const attrStr = stringifyAttrs(restAttrs);
	//could take URL data and string...
	const safeSrc = dataSrc instanceof URL ? dataSrc.href : dataSrc;

	// Generate <script> tag
	if (tagType === "script") {
		return `<script src="${safeSrc}"${attrStr ? " " + attrStr : ""}></script>`;
	}

	// Generate <link> tag
	return `<link rel="${tagType}" href="${safeSrc}"${attrStr ? " " + attrStr : ""}>`;
}

/**
 * Recursively processes a directory to find files with the target extension.
 * Returns a new object with entries, does not mutate any external state.
 *
 * @param {string} targetDir - The current directory being processed.
 * @param {string} fileExt - The normalized file extension (with leading dot).
 * @param {boolean} [recursive=false] - Whether to process subdirectories recursively.
 * @param {string} [joinSymbol="_"] - Symbol to join folder names with file name for nested files.
 * @param {string} [nestedPrefix=""] - Accumulated folder names for nested files (internal use).
 * @returns {Record<string, string>} Object with found file entries.
 */
function processDirectory(
	targetDir,
	fileExt,
	recursive = false,
	joinSymbol = "_",
	nestedPrefix = ""
) {
	/** @type {Record<string, string>} */
	const entries = {};

	// Read all items (files and directories) in the current directory
	const items = fs.readdirSync(targetDir, { withFileTypes: true });

	for (const item of items) {
		const itemPath = path.join(targetDir, item.name);

		if (item.isDirectory() && recursive) {
			// Build the nested prefix for subdirectories
			const newNestedPrefix = nestedPrefix
				? `${nestedPrefix}${joinSymbol}${item.name}`
				: item.name;

			// Recursively get entries from subdirectory and merge into current entries
			const subEntries = processDirectory(itemPath, fileExt, recursive, joinSymbol, newNestedPrefix);
			Object.assign(entries, subEntries);
		}
		else if (item.isFile() && item.name.endsWith(fileExt)) {
			// Extract filename without extension
			const fileNameWithoutExt = path.basename(item.name, fileExt);

			// Construct the key: use nestedPrefix with joinSymbol for nested files, plain name for top-level
			const entryKey = nestedPrefix
				? `${nestedPrefix}${joinSymbol}${fileNameWithoutExt}`
				: fileNameWithoutExt;

			// Store the absolute path
			entries[entryKey] = path.resolve(itemPath);
		}
	}
	/** @type {Record<string, string>} */
	return entries;
}

/**
 * Searches for files with the target extension at the given path.
 *
 * @param {string} pathToFiles - Path to the directory to search in.
 * @param {string} targetExt - Target extension of the files (with or without dot), e.g., ".js", ".html", "js", "html".
 * @param {boolean} [recursive=false] - If true, searches recursively in all subdirectories.
 *                                      If false, only searches the top-level directory.
 * @param {string} [joinSymbol="_"] - Symbol to join folder names with file name for nested files.
 *                                    Only used when recursive is true. Defaults to "_".
 * @returns {Record<string, string>} An object where:
 *         - For top-level files: key is the filename without extension (e.g., "one").
 *         - For nested files: key is "folderName{joinSymbol}fileName" or nested path with joinSymbol.
 *         - Value is the absolute path to the file.
 *
 * @example
 * // Search only in the top-level directory (non-recursive)
 * getFilesEntries("src/js", "js");
 * // Result: { "one": "/project/src/js/one.js" }
 *
 * @example
 * // Search recursively with default join symbol "_"
 * getFilesEntries("src/js", "js", true);
 * // Result: {
 * //   "one": "/project/src/js/one.js",
 * //   "foo_two": "/project/src/js/foo/two.js",
 * //   "foo_bar_three": "/project/src/js/foo/bar/three.js"
 * // }
 *
 * @example
 * // Search recursively with custom join symbol "-"
 * getFilesEntries("src/js", "js", true, "-");
 * // Result: {
 * //   "one": "/project/src/js/one.js",
 * //   "foo-two": "/project/src/js/foo/two.js",
 * //   "foo-bar-three": "/project/src/js/foo/bar/three.js"
 * // }
 */
export function getFilesEntries(
	pathToFiles,
	targetExt,
	recursive = false,
	joinSymbol = "_"
) {
	// Normalize the extension to always include a leading dot
	const fileExt = targetExt.startsWith(".") ? targetExt : `.${targetExt}`;

	// Resolve the absolute path for consistent path handling
	const resolvedPath = path.resolve(pathToFiles);

	// Check if the provided path exists
	if (!fs.existsSync(resolvedPath)) {
		console.error("No such path found at getFilesEntries:", pathToFiles);
		return /** @type {Record<string, string>} */ ({});
	}

	// Get entries from the root directory
	const entries = processDirectory(resolvedPath, fileExt, recursive, joinSymbol);

	// Log a warning if no files were found
	if (Object.keys(entries).length === 0) {
		console.error(`[getFilesEntries]: no files found with ${fileExt} at ${pathToFiles}`);
	}

	return entries;
}

/**
 * Safely reads and parses JSON file.
 *
 * @param {string} filePath
 * @returns {object}
 */
export function readJsonSafe(filePath) {
	if (!filePath || !fs.existsSync(filePath)) {
		console.error(`[readJsonSafe]: File not found: ${filePath}`);
		return {};
	}

	try {
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	}
	catch (e) {
		console.error(`[readJsonSafe]: Invalid JSON: ${filePath}`);
		return {};
	}
}

/**
 * @typedef {object} PageContent
 * @property {object} head
 * @property {object} header
 * @property {object} main
 */

/**
 * @typedef {object} InitialData
 * @property {string[]} languages
 * @property {string} rootUrl
 * !optional:
 * @property {string} [robotsParams]
 * @property {Record<string, string[]>} [metaStylesheetSources]
 * @property {Record<string, object[]>} [metaScriptSources]
 * @property {string[]} [metaCanonical]
 * @property {string} [metaDefaultRel]
 */

/**
 * @typedef {InitialData & {
 *   lang: string,
 *   pageName: string,
 *   [key: string]: any  // ← allowing other keys...
 * }} Context
 */

/**
 * @typedef {Record<string, PageContent>} PagesData
 */

/**
 *
 * @param {Record<string, string>} jsonEntries
 * @param {InitialData} initialData - Global configuration
 * @param {string} lang
 *
 * @returns {PagesData}
 */
export function getPageData(
	jsonEntries,
	initialData,
	lang
) {

	try {
		const headerDataSource = `header_${lang}`;

		//checking arguments
		if (!(lang in jsonEntries)) {
			console.error(`[getPageData]: no data for lang: ${lang}`);
			return {};
		}

		if (!(headerDataSource in jsonEntries)) {
			console.error(`[getPageData]: no header data for lang: ${lang}`);
			return {};
		}

		//checking key types of initialData, pageJsonEntries and throws error if not valid...
		validateInput(jsonEntries, initialData);

		//to avoid type {} of jsonEntries (tsconfig.json - "allowJs": true)
		const entries = /** @type {Record<string, string>} */ (jsonEntries);

		const mainDataJsonSource = entries[lang];
		const headerDataJsonSource = entries[headerDataSource];

		const pagesData = readJsonSafe(mainDataJsonSource);
		const headerData = readJsonSafe(headerDataJsonSource);

		const pageDataRes = Object.fromEntries(
			Object.entries(pagesData).map(([pageName, pageData]) => {
				const pageDataCombi = {
					...pageData,
					header: {
						...headerData
					}
				}

				const context/** @type {Context} */ = {
					...initialData,
					lang,
					pageName,
				};

				return [pageName, buildPageContent(pageDataCombi, context)];
			})
		);

		//console.log("getPageData:");
		//console.log(pageDataRes);

		return pageDataRes;
	}
	catch (error) {
		//strict mode: tsconfig.json
		if (error instanceof Error) {
			console.error(`[getPageData]: Failed for "${lang}": ${error.message}`);
		}
		else {
			console.error(`[getPageData]: Failed for "${lang}":`, error);
		}
		return {};
	}
}


/**
 * @param {object} pageData  // ← not PagesData! It is the data for the single page...
 * @param {Context} context
 *
 * @returns {PageContent}
 */
function buildPageContent(pageData, context) {

	// checking properties...
	const requiredForHead = ['lang', 'pageName', 'rootUrl', 'languages'];
	const missing = requiredForHead.filter(key => !(key in context));
	if (missing.length) {
		throw new Error(`[buildPageContent]: Missing head fields: ${missing.join(', ')}`);
	}

	const { lang, languages } = context;

	/**
	 * @typedef {object} Handlers
	 * @property {(value: object) => object} head
	 * @property {(value: object) => object} header
	 * @property {(value: object) => object} main
	 */

	/** @type {Handlers & Record<string, (value: any) => any>} */
	const handlers = {
		/**
		 * @param {object} value
		 * @return {object}
		 */
		head: (value) => {
			return {
				...value,
				...getInitialHeadData(context),
			}
		},
		/**
		 *
		 * @param {object} value
		 * @return {object}
		 */
		header: (value) => {
			return {
				...(value || {}),
				...context,
			}
		},

		/**
		 *
		 * @param {object} value
		 */
		main: (value) => ({
			...(value || {}),
			lang,
			languages,
		}),
	}

	return /** @type {PageContent} */ (Object.fromEntries(
		Object.entries(pageData).map(([key, value]) => {
			const handler = handlers[key];
			if (handler) {
				return [key, handler(value)];
			}
			return [key, value];
		})
	));

}


/**
 * Validates input configuration.

 * @param {Record<string, string>} jsonEntries
 * @param {object} initialData
 *
 * @throws {Error}
 */
function validateInput(jsonEntries, initialData) {
	const errors = [];

	if (!isObject(jsonEntries)) {
		errors.push('"pageJsonEntries" must be an object');
	}

	if (!isObject(initialData)) {
		errors.push('"initialData" must be an object');
	}

	/** @type {Record<string, (v: any) => boolean>} */
	const schema = {
		languages: isStringArray,
		robotsParams: isString,
		metaStylesheetSources: isObject,
		metaScriptSources: isObject,
		metaCanonical: isStringArray,
		metaDefaultRel: isString,
		rootUrl: isString,
	};

	// creating temporal object with index signature
	/** @type {Record<string, any>} */
	const dataAny = initialData;

	for (const key in schema) {
		const validate = schema[key];

		if (dataAny.hasOwnProperty(key) && !validate(dataAny[key])) {
			errors.push(`[validateInput]: "${key}" is invalid`);
		}
	}

	if (errors.length) {
		throw new Error(`[validateInput]\n- ${errors.join("\n- ")}`);
	}
}

/* ---------- Helpers ---------- */
/** @param {any} v */
function isObject(v) {
	return v !== null && typeof v === "object" && !Array.isArray(v);
}

/** @param {any} v */
function isString(v) {
	return typeof v === "string";
}

/** @param {any} v */
function isStringArray(v) {
	return Array.isArray(v) && v.every(isString);
}

/**
 * @param {{
 *   lang: string,
 *   languages: string[],
 *   [key: string]: any   // pageName and rootUrl are here...
 * }} context
 */
function getInitialHeadData(context) {
	const { rootUrl, lang, pageName } = context;

	/**
	 * Generates a full URL object for a specific language version of the page.
	 *
	 * Ensures the base URL has a trailing slash and safely constructs
	 * a normalized absolute URL using the URL constructor.
	 *
	 * @param {string} language - Language code (e.g., "en", "ru", "uk").
	 * @returns {URL} A URL object pointing to the language-specific page.
	 *
	 * @example
	 * getUrlLangVersion("en")
	 * // => https://example.com/en/pageName.html
	 *
	 * @example
	 * getUrlLangVersion("ru")
	 * // => https://example.com/ru/pageName.html
	 */
	const getUrlLangVersion = (language) => {
		const base = rootUrl.endsWith("/") ? rootUrl : rootUrl + "/";
		return new URL(`${language.trim()}/${pageName}.html`, base);
	}

	/**
	 * Handlers to process head initialData properties
	 * @type {Record<string, function(any): [string, string]>}
	 */
	const handlers = {
		/**
		 * It creates alternate links of the pages..
		 * @sample <link rel="alternate" href="https://example.com/ru/pageName.html" hreflang="ru">
		 * @sample <link rel="alternate" href="https://example.com/uk/pageName.html" hreflang="uk">
		 * @param {string[]} languages
		 * @return {[string,string]}
		 */
		languages: (languages) => {
			const alternateLinks = languages
				.map(language => {
					const langTrimmed = language.trim();
					return getMetaLinkTag({
						tagType: "alternate",
						dataSrc: getUrlLangVersion(langTrimmed).href,
						hreflang: langTrimmed,
					})
				})
				.join("\n");

			return ["alternate", alternateLinks];
		},

		/**
		 * Creates canonical link of the site`s page
		 * @sample <link rel="canonical" href="https://example.com/uk/pageName.html" hreflang="uk">
		 *
		 * if multilanguage site has two canonical languages, then to use canonical for the active page language
		 * @param {string[]} metaCanonical - optional languages for links rel="canonical"
		 * @return {[string,string]}
		 */
		metaCanonical: (metaCanonical) => {
			//if active lang is in metaCanonical language options then to create canonical link with active language
			const canonicalLang = (metaCanonical.includes(lang)) ? lang : metaCanonical[0];
			const metaCanonicalStr = getMetaLinkTag({
				tagType: "canonical",
				dataSrc: getUrlLangVersion(canonicalLang).href,
			})

			return ["canonical", metaCanonicalStr];
		},

		/**
		 * Creates default language version of the page
		 * @sample <link rel="alternate" href="https://example.com/uk/pageName.html" hreflang="x-default">
		 * @param {string} metaDefaultRel
		 * @return {[string,string]}
		 */
		metaDefaultRel: (metaDefaultRel) => {
			const metaDefaultTrimmed = metaDefaultRel.trim();
			const metaDefaultTag = metaDefaultTrimmed.length > 1
				? getMetaLinkTag({
					tagType: "alternate",
					dataSrc: getUrlLangVersion(metaDefaultTrimmed).href,
					hreflang: "x-default"
				})
				: "";

			return ["default", metaDefaultTag]
		},

		/**
		 * creates robotsParams
		 * @param {string} robotsParams
		 * @return {[string,string]}  - ["robots", `<meta name="robots" content=${robotsParams}>`]
		 */
		robotsParams: (robotsParams) => {
			return ["robots", robotsParams];
		},

		/**
		 * creates *.css links for the <head>
		 * @sample <link rel="stylesheet" href="" >
		 * @param {Record<string, string[]>} metaStylesheetSources
		 * @return {[string,string]}
		 */
		metaStylesheetSources: (metaStylesheetSources) => {
			const pageStyleSheetLinks = metaStylesheetSources[pageName];
			if (!pageStyleSheetLinks?.length) {
				console.warn(`[getInitialHeadData]: No stylesheet links found for page: ${pageName}`);
				return ["stylesheet", ""];
			}

			const stylesheetLinks = pageStyleSheetLinks.map(href => {
				return getMetaLinkTag({
					tagType: "stylesheet",
					dataSrc: href
				});
			}).join('\n');

			return ["stylesheet", stylesheetLinks];
		},

		/**
		 * creates links for scripts in <head>
		 * @sample <script src="/js/*.js" defer></script>
		 * @param {Record<string, Record<string, string>[]>} metaScriptSources
		 * @return {[string, string]}
		 */
		metaScriptSources: (metaScriptSources) => {
			const pageScripts = metaScriptSources?.[pageName];
			const scriptSource = pageScripts?.length > 0
				? pageScripts.map((scriptSrc) => {
					const { src, ...restAttr } = scriptSrc;

					return getMetaLinkTag({
						tagType: "script",
						dataSrc: src,
						...restAttr,
					});
				}).join('\n')
				: "";


			return ["scriptSource", scriptSource];
		}
	}

	return Object.fromEntries(
		Object.entries(context).map(([key, val]) => {
			if (key in handlers) {
				return handlers[key](val);
			}
			return [key, val];
		})
	);
}

/**
 * Recursively searches for the project root directory by looking for a marker file (e.g. package.json).
 *
 * Starts from the given directory and traverses up the file system until the marker file is found.
 * Throws an error if the root directory cannot be determined.
 *
 * @param {string} dir - The starting directory path (absolute or relative).
 * @param {string} [marker="package.json"] - File name used to identify the root directory. Defaults to "package.json".
 * @returns {string} Absolute path to the detected project root directory.
 * @throws {Error} Will throw if the root directory cannot be found.
 *
 * @example
 * // Given structure:
 * // /project
 * //   package.json
 * //   /scripts/utils/path-utils.mjs
 *
 * const __dirname = dirname(fileURLToPath(import.meta.url));
 * const root = findRoot(__dirname);
 *
 * console.log(root);
 * // → "/project"
 *
 * @example
 * // Usage in a config file
 * const rootDir = findRoot(process.cwd());
 * const srcPath = path.resolve(rootDir, "src");
 */
export function findRoot(dir, marker = "package.json") {
	if (fs.existsSync(path.join(dir, marker))) {
		return dir;
	}

	const parent = path.resolve(dir, "..");
	if (parent === dir) {
		throw new Error("Root directory not found");
	}

	return findRoot(parent);
}
