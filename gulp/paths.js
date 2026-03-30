"use strict";

import path from "path";
import { getFilesEntries } from "./utilFuncs.js";

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
			`!${ path.join(srcPath, "assets", "img", "svgIcons", "mono", "**", "*") }`,
			`!${ path.join(srcPath, "assets", "img", "svgIcons", "multi", "**", "*") }`
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
			`${ srcPath }/html/**/*.html`,
		],
		stylesNested: [
			`${ srcPath }/scss/**/*.scss`,
			`${ srcPath }/js/modulesPack/**/scss/*.scss`,
		],
		jsNested: [
			`${ srcPath }/js/**/*.js`,
			`${ srcPath }/js/modulesPack/**/*.js`,
		],
		img: [
			`${ srcPath }/assets/img/**/*.{jpg,jpeg,png,svg,gif,webp,avif,ico}`,
			`!${ srcPath }/assets/img/svgIcons/mono/**/*`,
			`!${ srcPath }/assets/img/svgIcons/multi/**/*`
		],
		svgIconsMono: [
			`${ srcPath }/assets/img/svgIcons/mono/**/*.svg`
		],
		svgIconsMulti: [
			`${ srcPath }/assets/img/svgIcons/multi/**/*.svg`
		],
		fonts: `${ srcPath }/assets/fonts/**/*.{eot,woff,woff2,ttf,otf}`,
		data: `${ srcPath }/assets/data/**/*.{json, pdf, xml}`,
	},
	clean: [
		distPath,
		path.resolve(curWD, "zip"),
		//path.resolve(curWD, "zip", `${ rootFolder }.zip`),
		tempPath,
	],
}

/**
 * is used as common css file source for the meta <link rel="stylesheet"> tag at head
 * @type {string} commonStyleSource
 * ! if some page needs separate css files, it could be added separately to fileEntries.stylesheetTagSource...
 */
const commonStyleSource = "/css/index.min.css";

const metaStylesheetSources = {
	index: [commonStyleSource],
	gates: [commonStyleSource],
	rollers: [commonStyleSource],
	automation: [commonStyleSource],
	barriers: [commonStyleSource],
	awnings: [commonStyleSource],
	windows: [commonStyleSource],
	security: [commonStyleSource],
}

/**
 * the scripts can be written at the end of the tag <body> omitting writing it in the tag <head>
 * In metaScriptSources <script> tag will be written at head...
 * @type {Record<string, Record<string, string>[]>}
 */
const metaScriptSources = {
	index: [
		/*{
				src: "/js/index.bundle.js", //this property must exist in scriptSource
				defer: true   //this property may not exist in scriptSource
		},*/
	],
	gates: [
		/*{
				src: "/js/index.bundle.js", //this property must exist in scriptSource
				defer: true   //this property may not exist in scriptSource
		},*/
	],
	rollers: [
		/*{
				src: "/js/index.bundle.js", //this property must exist in scriptSource
				defer: true   //this property may not exist in scriptSource
		},*/
	],
	automation: [
		/*{
				src: "/js/index.bundle.js", //this property must exist in scriptSource
				defer: true   //this property may not exist in scriptSource
		},*/
	],
	barriers: [
		/*{
				src: "/js/index.bundle.js", //this property must exist in scriptSource
				defer: true   //this property may not exist in scriptSource
		},*/
	],
	awnings: [
		/*{
				src: "/js/index.bundle.js", //this property must exist in scriptSource
				defer: true   //this property may not exist in scriptSource
		},*/
	],
	windows: [
		/*{
				src: "/js/index.bundle.js", //this property must exist in scriptSource
				defer: true   //this property may not exist in scriptSource
		},*/
	],
	security: [
		/*{
				src: "/js/index.bundle.js", //this property must exist in scriptSource
				defer: true   //this property may not exist in scriptSource
		},*/
	],
}


//source folder for the pages` data json files:
export const pagesDataJsonFolder = "assets/data/pagesVersions";

/**
 * @type {{
 *   jsEntries: Record<string, string>,
 *   jsonPaths: Record<string, string>,  // paths to JSON files
 *   metaStylesheetSources: Record<string, string[]>,
 *   metaScriptSources: Record<string, object[]>
 * }}
 */
export const fileEntries = {
	jsEntries: getFilesEntries(path.join(pathData.srcPath, "js"), "js"),
	//getting all **/*.json
	jsonPaths: getFilesEntries(
		path.join(pathData.srcPath,pagesDataJsonFolder),
		"json",
		true,
		"_"
	),
	metaStylesheetSources,
	metaScriptSources,
}