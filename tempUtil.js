"use strict";

import { getMatchedFromArray } from './src/js/helpers/funcs.js';
import { fileEntries } from './gulp/paths.js';
import { getPageData} from './gulp/utilFuncs.js';

/////////////// END OF IMPORTS /////////////////////////

////////////// INITIAL SETTINGS ///////////////////////

const robotsParams = 'noindex';

//base root url at the server... example: "https://example.com"
const rootUrl = 'https://example.com';
//! json pages` data could have more language versions... setting target languages to use...
const alternateLanguages = ["uk", "ru"];
// canonical languages could be multiple for crawler indexation
const canonicalLanguages = ["uk", "ru"];
// default language for <link rel="alternate" href="..." hreflang="x-default" />
const metaDefaultRel = "uk";

/**
 * getting the file entries for all *.json with the pages` content.
 * Each json file contains the pages` data with particular language version.
 * Gulp automatically compiles pages for each ${lang}.json and passes them to dist/html/${lang}
 * Gulp automatically adds language version navigation at <header> of the pages...
 */
const jsonEntries = fileEntries.jsonPaths;
const jsEntries = fileEntries.jsEntries;

const metaStylesheetSources = fileEntries.metaStylesheetSources;
const metaScriptSources = fileEntries.metaScriptSources;

const jsonEntriesKeys = Object.keys(jsonEntries);

/**
 * alternate languages to be used from json files at "assets/data/pagesVersions": ["ru", "uk"]
 * @type {string[]}
 * checking the given languages to be in jsonEntries... could be also [] if not contained...
 */
export const languages = getMatchedFromArray(jsonEntriesKeys, alternateLanguages);

/**
 * The array of canonical languages to be used
 * @type {string[]}
 */
const metaCanonical = getMatchedFromArray(jsonEntriesKeys, canonicalLanguages);

////////////// END OF INITIAL SETTINGS ///////////////////////

/**
 * ! it returns the page`s data context with the language version for the gulp-file-include settings
 * @param {string} lang
 * @return {{
 * prefix: string,
 * basepath: string,
 * context: {data: ({}|Record<string, Object>)}
 * }}
 */
export const setFileIncludeSettings = lang => {
	return {
		prefix: '@@',
		basepath: '@file',
		context: {
			data: (Object.keys(jsonEntries).length > 0)
				? getPageData(
					jsonEntries,
					{
						robotsParams,
						metaStylesheetSources,
						metaScriptSources,
						rootUrl,
						metaCanonical,
						metaDefaultRel,
						languages
					},
					lang
				)
				: {},
		}
	};
};

const tempData = setFileIncludeSettings("uk");
const {data} = tempData.context;
const indexData = data["index"];
console.log(indexData);