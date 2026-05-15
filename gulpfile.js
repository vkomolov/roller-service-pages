import gulp from "gulp";

import { pathData } from "./gulp/paths.js";
import { modes } from "./gulp/settings.js";
import tasks from "./gulp/tasks.js";
import { cleanDist } from "./gulp/utilFuncs.js";
import BrowserSync from "./modules/BrowserSync.js";

/////////////// END OF IMPORTS /////////////////////////
const { series, parallel, watch } = gulp;

/**
 *
 * @param {string} lang
 * @return {BrowserSync}
 */
const initBs = (lang) => {
	return new BrowserSync({
		baseDir: pathData.distPath,
		startPath: `/${ lang }/index.html`,
		open: false,  //not open browser immediately
		notify: false,
		noCacheHeaders: true,
		injectChanges: true,  // Enabling change injection
		reloadOnRestart: true,  // Reboot on restart
		ui: false,  // Disabling UI
	});
};

/**
 *
 * @param {object} bs
 */
function watchFiles(bs) {
	const pipesDev = tasks[modes.dev];
	watch(pathData.watch.htmlNested, series(pipesDev.pipeHtml, bs.reload));
	watch(pathData.watch.stylesNested, series(pipesDev.pipeStyles, bs.reload));
	watch(pathData.watch.jsNested, series(pipesDev.pipeJs, bs.reload));
	watch(pathData.watch.img, series(pipesDev.pipeImages, bs.reload));
	watch(pathData.watch.svgIconsMono, series(pipesDev.pipeSvgSpriteMono, bs.reload));
	watch(pathData.watch.svgIconsMulti, series(pipesDev.pipeSvgSpriteMulti, bs.reload));
	watch(pathData.watch.fonts, series(pipesDev.pipeFonts, bs.reload));
	//watching data, including *.json, and renewing the html files, compiled with gulp-file-include
	watch(pathData.watch.data, series(pipesDev.pipeData, pipesDev.pipeHtml, bs.reload));
}

/**
 * It initiates tasks with account to the mode of tasks to run
 * @param { string } mode - "dev" or "build"
 * @param { function } cb - callback
 */
function runPipes(mode, cb) {
	if (mode in modes) {
		const task = tasks[mode];

		series(
			distClean,
			// Stage 1: collecting all static assets...
			parallel(
				task.pipeImages,
				task.pipeFonts,
				task.pipeSvgSpriteMono,
				task.pipeSvgSpriteMulti,
				task.pipeData,
				task.pipeUtils,
			),
			// Stage 2: compiling styles and scripts...
			parallel(
				task.pipeStyles,
				task.pipeJs,
			),
			// Stage 3: HTML is compiled finally — it could inline CSS and add webp to HTML
			task.pipeHtml,
		)(cb);
	}
	else {
		console.error(`the mode ${ mode } is not correct. Please use "dev" or "build" instead...`);
	}
}

export async function distClean() {
	await cleanDist(pathData.clean);
}

export function pipesDev(cb) {
	runPipes(modes.dev, cb);
}

export function pipesBuild(cb) {
	runPipes(modes.build, cb);
}

export function runDev(cb) {
	const bs = initBs("uk");

	series(
		pipesDev,
		bs.start,
		() => watchFiles(bs)
	)(cb);
}

export function runBuild(cb) {
	const bs = initBs("uk");
	series(
		pipesBuild,
		bs.start,
	)(cb);
}