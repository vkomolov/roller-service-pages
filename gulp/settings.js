'use strict';

/*gulp/settings.js*/

import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import discardUnused from 'postcss-discard-unused';
import normalizeWhitespace from 'postcss-normalize-whitespace';
import sortMediaQueries from 'postcss-sort-media-queries';
import TerserPlugin from 'terser-webpack-plugin';
import { getMatchedFromArray } from '../src/js/helpers/funcs.js';
import { fileEntries } from './paths.js';
import { getPageData} from './utilFuncs.js';

/////////////// END OF IMPORTS /////////////////////////

////////////// INITIAL SETTINGS ///////////////////////
export const modes = {
	dev: 'dev',
	build: 'build'
};
const robotsParams = 'noindex, nofollow';
//const robotsParams = 'index, follow';

//base root url at the server... example: "https://example.com"
const rootUrl = 'https://roller-service.pages.dev/';
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
	const pageData = (Object.keys(jsonEntries).length > 0)
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
		: {};

	return {
		prefix: '@@',
		basepath: '@file',
		context: {
			data: pageData
		}
	};
};


export const beautifySettings = {
	html: {
		//indent_size: 2,
		//indent_char: ' ',
		indent_with_tabs: true,
		preserve_newlines: false
		//max_preserve_newlines: 0,
		//wrap_line_length: 80,
		//extra_liners: ['head', 'body', '/html']
	}
};
export const optimizeCss = [
	sortMediaQueries({
		sort: 'mobile-first'
	}),
	autoprefixer(),
	discardUnused({}),
	cssnano({
		preset: [
			'default',
			{
				normalizeWhitespace: false //avoiding compressing css file
			}
		]
	})
];
export const minifyCss = [normalizeWhitespace()];
export const useGulpSizeConfig = (params = {}) => {
	return Object.assign(
		{
			showFiles: true,
			pretty: true,
			showTotal: false,
			gzip: false
		},
		params
	);
};
export const webpackConfigJs = {
	dev: {
		mode: 'development',
		devtool: 'source-map',
		entry: {
			...jsEntries
		},
		output: {
			filename: '[name].bundle.js'
			//path: pathData.build.js,  //will be piped to gulp.dest with the path: pathData.build.js
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: [['@babel/preset-env', { modules: false }]],
								plugins: [
									'@babel/plugin-transform-runtime',
									'@babel/plugin-transform-classes'
								]
							}
						}
					]
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader']
				}
			]
		}
	},
	build: {
		mode: 'production',
		entry: {
			...jsEntries
		},
		output: {
			filename: '[name].bundle.js'
			//path: pathData.build.js,  //will be piped to gulp.dest with the path: pathData.build.js
		},
		optimization: {
			minimize: true,
			minimizer: [
				new TerserPlugin({
					parallel: true,
					terserOptions: {
						format: {
							comments: false
						}
					},
					extractComments: false
				})
			]
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: [['@babel/preset-env', { modules: false }]],
								plugins: [
									'@babel/plugin-transform-runtime',
									'@babel/plugin-transform-classes'
								]
							}
						}
					]
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader']
				}
			]
		}
	}
};
export const svgoSpriteOptions = {
	mono: {
		plugins: [
			{
				name: 'removeAttrs',
				params: {
					attrs: ['class', 'pagesVersions-name', 'fill', 'stroke.*'] //"stroke.*" removing all stroke-related attributes
				}
			},
			{
				name: 'removeDimensions' // it removes width and height
			}
		]
	},
	multi: {
		plugins: [
			{
				name: 'removeAttrs',
				params: {
					attrs: ['class', 'pagesVersions-name']
				}
			},
			{
				name: 'removeDimensions' // it removes width and height
			},
			{
				name: 'removeUselessStrokeAndFill',
				active: false
			},
			{
				name: 'inlineStyles',
				active: true
			}
		]
	}
};
