"use strict";

import path from "path";
import { getFilesEntries, makeCommonDataForPages } from "./utilFuncs.js";

/// TYPE DEFINITIONS ///

/**
 * Metadata configuration for HTML resource tags.
 *
 * Currently supports:
 * - script
 * - stylesheet
 * - link
 *
 * Can be extended with additional tag types.
 *
 * @typedef {{
 *   tagType: "script"|"stylesheet"|"link",
 *   dataSrc: string | URL,
 *   inline?: boolean,
 *   deferredLoad?: boolean,
 *   defer?: boolean,
 *   type?: string,
 *   hreflang?: string,
 *   rel?: string,
 *   sizes?: string,
 *   as?: string,
 *   crossorigin?: boolean,
 * }} TPageMetaItem
 */

/**
 * @typedef {{
 *   jsEntries: Record<string, string>,
 *   jsonPaths: Record<string, string>,  // paths to JSON files
 *   metaStylesheetSources: Record<string, TPageMetaItem[]>,
 *   metaScriptSources: Record<string, TPageMetaItem[]>
 *   metaShortCutIconSources: Record<string, TPageMetaItem[]>
 *   metaPreloadSources: Record<string, TPageMetaItem[]>
 * }} TFileEntries
 */

/// END OF TYPE DEFINITIONS ///

/**
 * As all *.js files are treated as ES modules (package.json contains "type": "module"),
 * we get the Node current working directory with process.cwd...
 * Finally, we use path.resolve to construct the absolute path of the src and dist directories
 * relative to the current working directory process.cwd.
 * @type {string}
 */
const curWD = process.cwd();
//import * as nodePath from "path";
const rootFolder = path.basename(path.resolve());

const srcPath = path.resolve(curWD, "src");
const distPath = path.resolve(curWD, "dist");
const tempPath = path.join(srcPath, "temp");
export const pathData = {
	rootFolder,
	srcPath,
	distPath,
	tempPath,
	ftp: "",
	src: {
		html: path.join(srcPath, "html", "*.html"),
		styles: path.join(srcPath, "scss", "*.scss"),
		js: path.join(srcPath, "js", "*.js"),
		img: [
			path.join(srcPath, "assets", "img", "**", "*.{jpg,jpeg,png,svg,gif,webp,avif,ico}"),
			`!${path.join(srcPath, "assets", "img", "svgIcons", "mono", "**", "*")}`,
			`!${path.join(srcPath, "assets", "img", "svgIcons", "multi", "**", "*")}`
		],
		svgIconsMono: [
			path.join(srcPath, "assets", "img", "svgIcons", "mono", "**", "*.svg")
		],
		svgIconsMulti: [
			path.join(srcPath, "assets", "img", "svgIcons", "multi", "**", "*.svg")
		],
		fonts: path.join(srcPath, "assets", "fonts", "**", "*.{eot,woff,woff2,ttf,otf}"),
		data: path.join(srcPath, "assets", "data", "**", "*.{json, pdf, xml}"),
		utils: [
			path.join(srcPath, "*"),
			path.join(srcPath, ".*"),
		],
	},
	build: {
		html: distPath,
		styles: path.join(distPath, "css"),
		js: path.join(distPath, "js"),
		img: path.join(distPath, "assets", "img"),
		svgIcons: path.join(distPath, "assets", "img", "svgIcons"),
		fonts: path.join(distPath, "assets", "fonts"),
		data: path.join(distPath, "assets", "data"),
		utils: distPath,
	},
	watch: {
		htmlNested: [
			`${srcPath}/html/**/*.html`,
		],
		stylesNested: [
			`${srcPath}/scss/**/*.scss`,
			`${srcPath}/js/modulesPack/**/scss/*.scss`,
		],
		jsNested: [
			`${srcPath}/js/**/*.js`,
			`${srcPath}/js/modulesPack/**/*.js`,
		],
		img: [
			`${srcPath}/assets/img/**/*.{jpg,jpeg,png,svg,gif,webp,avif,ico}`,
			`!${srcPath}/assets/img/svgIcons/mono/**/*`,
			`!${srcPath}/assets/img/svgIcons/multi/**/*`
		],
		svgIconsMono: [
			`${srcPath}/assets/img/svgIcons/mono/**/*.svg`
		],
		svgIconsMulti: [
			`${srcPath}/assets/img/svgIcons/multi/**/*.svg`
		],
		fonts: `${srcPath}/assets/fonts/**/*.{eot,woff,woff2,ttf,otf}`,
		data: `${srcPath}/assets/data/**/*.{json, pdf, xml}`,
	},
	clean: [
		distPath,
		path.resolve(curWD, "zip"),
		//path.resolve(curWD, "zip", `${ rootFolder }.zip`),
		tempPath,
	],
}

const pageNamesList = [
	"index",
	"gates",
	"rollers",
	"automation",
	"barriers",
	"awnings",
	"windows",
	"security",
];

const commonStyleSource = "/css/index.min.css";  // relative for HTML
const criticalStyleSource = "/css/critical.min.css";
const mainScriptSource = "/js/index.bundle.js";
const vendorScriptSource = "/js/vendor.bundle.js";
const shortcutIconSource_24 = "/assets/img/24_7_24x24.ico";
const shortcutIconSource_32 = "/assets/img/24_7_32x32.ico";
const shortcutIconSource_48 = "/assets/img/24_7_48x48.ico";
const preloadFontSource = "/assets/fonts/Roboto/Roboto-Bold.woff2";

/**
 * data for writing in <head>:
 *  <link
 *     rel="shortcut icon"
 *     sizes="24x24"
 *     href="/assets/img/24_7_24x24.ico"
 *     type="image/x-icon"
 *  >
 *
 *  <link
 *     rel="shortcut icon"
 *     sizes="32x32"
 *     href="/assets/img/24_7_32x32.ico"
 *     type="image/x-icon"
 *  >
 *
 *  <link
 *     rel="shortcut icon"
 *     sizes="48x48"
 *     href="/assets/img/24_7_48x48.ico"
 *     type="image/x-icon"
 *  >
 *
 * @type {TPageMetaItem[]}
 */
const totalShortcutIconSource = [
	{
		tagType: "link",
		rel: "shortcut icon",
		dataSrc: shortcutIconSource_24,
		sizes: "24x24",
		type: "image/x-icon"
	},
	{
		tagType: "link",
		rel: "shortcut icon",
		dataSrc: shortcutIconSource_32,
		sizes: "32x32",
		type: "image/x-icon"
	},
	{
		tagType: "link",
		rel: "shortcut icon",
		dataSrc: shortcutIconSource_48,
		sizes: "48x48",
		type: "image/x-icon"
	},
];

/**
 * styles links to be written in head, including inline styles and deferred loaded styles:
 * <style>
 * All inline styles for the site go here
 * </style>
 * <link
 *   rel="preload"
 *   href="/css/index.min.css"
 *   as="style"
 *   onload="this.onload=null;this.rel='stylesheet'"
 * >
 *
 * @type {TPageMetaItem[]}
 */
const totalStyleSource = [
	{
		tagType: "stylesheet",
		dataSrc: criticalStyleSource,
		inline: true  //optional... can be undefined
	},
	{
		tagType: "stylesheet",
		dataSrc: commonStyleSource,
		deferredLoad: true //optional... can be undefined
	}
];

/**
 * The scripts to be written in head:
 * <script src="/js/index.bundle.js" type="module" defer></script>
 * <script src="/js/vendor.bundle.js" type="module" defer></script>
 *
 * @type {TPageMetaItem[]}
 */
const totalScriptSource = [
	{
		tagType: "script",
		dataSrc: mainScriptSource,
		type: "module", //optional
		defer: true   //optional
	},
	{
		tagType: "script",
		dataSrc: vendorScriptSource,
		type: "module", //optional
		defer: true   //optional
	},
];

/**
 * The preload links to be written in head:
 *     <link
 *         rel="preload"
 *         href="/assets/fonts/Roboto/Roboto-Bold.woff2"
 *         as="font"
 *         type="font/woff2"
 *         crossorigin
 *     >
 *
 * @type {TPageMetaItem[]}
 */
const preloadMetaData = [
	{
		tagType: "link",
		rel: "preload",
		dataSrc: preloadFontSource,
		as: "font",
		type:"font/woff2",
		crossorigin: true,
	}
];

/**
 * The shortcut icon data, which will be written in <head> to all pages...
 * @type {Record<string, TPageMetaItem[]>}
 */
const metaShortCutIconSources = makeCommonDataForPages(
	pageNamesList,
	totalShortcutIconSource
);

/**
 * The styles data, which will be written in <head> to all pages...
 * @type {Record<string, TPageMetaItem[]>}
 */
const metaStylesheetSources = makeCommonDataForPages(
	pageNamesList,
	totalStyleSource
);

/**
 * the scripts, which will be written in <head> to all pages...
 * @type {Record<string, TPageMetaItem[]>}
 */
const metaScriptSources = makeCommonDataForPages(
	pageNamesList,
	totalScriptSource
);

const metaPreloadSources = makeCommonDataForPages(
	pageNamesList,
	preloadMetaData
);

//source folder for the pages` data json files:
export const pagesDataJsonFolder = "assets/data/pagesVersions";

/**
 * @type {TFileEntries}
 */
export const fileEntries = {
	jsEntries: getFilesEntries(path.join(pathData.srcPath, "js"), "js"),
	//getting all **/*.json
	jsonPaths: getFilesEntries(
		path.join(pathData.srcPath, pagesDataJsonFolder),
		"json",
		true,
		"_"
	),
	metaStylesheetSources,
	metaScriptSources,
	metaShortCutIconSources,
	metaPreloadSources
}